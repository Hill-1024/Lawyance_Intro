#!/usr/bin/env python3
"""介绍页静态服务：只服务构建产物目录，SPA 回退 + 健康检查。

- 每次请求都重新解析 current（符号链接），所以换版只是翻链接，不需要重启进程；
- 不注入 <base>：构建用的是绝对路径（vite base: '/'），介绍页固定在站点根提供服务；
- 只绑回环地址：外部流量由同一台机器上的分流核心按路径转发进来。

用法：
    python3 server/serve.py --root ./current --port 8082
环境变量：LAWVER_INTRO_ROOT、LAWVER_INTRO_PORT、LAWVER_INTRO_HOST
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import posixpath
import sys
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

# 构建产物里没有扩展名的请求（/、/design、/pricing…）都回退到 index.html。
SPA_FALLBACK = "index.html"
IMMUTABLE_PREFIX = "intro-assets/"
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
NO_CACHE = "no-cache"
STATIC_CACHE = "public, max-age=3600"

# 显式覆盖：mimetypes 对这几类要么给不出、要么给得过时。漏掉 text/html 的后果是
# 浏览器把页面当附件下载——整套界面白屏，而 curl 检查完全看不出来。
EXTRA_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
    ".woff2": "font/woff2",
    ".json": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml",
}


def content_type_for(target: Path) -> str:
    suffix = target.suffix.lower()
    if suffix in EXTRA_TYPES:
        return EXTRA_TYPES[suffix]
    guessed, _ = mimetypes.guess_type(target.name)
    if not guessed:
        return "application/octet-stream"
    if guessed.startswith("text/") and "charset" not in guessed:
        return f"{guessed}; charset=utf-8"
    return guessed


class IntroHandler(SimpleHTTPRequestHandler):
    """在 SimpleHTTPRequestHandler 上补 SPA 回退、缓存头与 /healthz。"""

    server_version = "LawverIntro/1.0"

    def __init__(self, *args, root: Path, **kwargs):
        self._root = root
        super().__init__(*args, directory=str(root), **kwargs)

    # ── 工具 ──────────────────────────────────────────────────────────────
    def _current_root(self) -> Path:
        """解析一次根目录（含符号链接），每请求一次，翻链接即刻生效。"""
        return Path(self._root).resolve()

    def _resolve(self, path: str) -> Path | None:
        """把 URL 路径映射到磁盘路径；越界或不存在返回 None。"""
        root = self._current_root()
        relative = posixpath.normpath(unquote(urlparse(path).path)).lstrip("/")
        candidate = (root / relative).resolve()
        if candidate != root and root not in candidate.parents:
            return None
        if candidate.is_dir():
            candidate = candidate / SPA_FALLBACK
        return candidate if candidate.is_file() else None

    def _send_file(self, target: Path, *, head_only: bool = False) -> None:
        try:
            payload = target.read_bytes()
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")
            return
        relative = target.relative_to(self._current_root()).as_posix()
        suffix = target.suffix.lower()
        if suffix == ".html":
            cache = NO_CACHE
        elif relative.startswith(IMMUTABLE_PREFIX):
            cache = IMMUTABLE_CACHE
        else:
            cache = STATIC_CACHE
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type_for(target))
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", cache)
        self.end_headers()
        if not head_only:
            self.wfile.write(payload)

    # ── 路由 ──────────────────────────────────────────────────────────────
    def do_GET(self) -> None:  # noqa: N802 - http.server 约定
        path = urlparse(self.path).path
        if path == "/healthz":
            body = json.dumps({"status": "ok", "root": str(self._current_root())}).encode()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", NO_CACHE)
            self.end_headers()
            self.wfile.write(body)
            return
        target = self._resolve(self.path)
        if target is None:
            fallback = self._resolve("/")
            if fallback is None:
                self.send_error(HTTPStatus.SERVICE_UNAVAILABLE, "intro build missing")
                return
            # 只有不像静态资源的路径才做 SPA 回退，避免把 HTML 当 JS 交出去。
            if Path(unquote(path)).suffix:
                self.send_error(HTTPStatus.NOT_FOUND, "Not Found")
                return
            target = fallback
        self._send_file(target)

    def do_HEAD(self) -> None:  # noqa: N802
        target = self._resolve(self.path)
        if target is None:
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")
            return
        self._send_file(target, head_only=True)

    def log_message(self, fmt: str, *args) -> None:  # noqa: D102
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main() -> int:
    parser = argparse.ArgumentParser(description="Lawver 介绍页静态服务")
    parser.add_argument(
        "--root",
        default=os.environ.get("LAWVER_INTRO_ROOT") or str(Path(__file__).resolve().parents[1] / "current"),
        help="构建产物目录（可以是符号链接），默认 <repo>/current",
    )
    parser.add_argument("--host", default=os.environ.get("LAWVER_INTRO_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("LAWVER_INTRO_PORT", "8082")))
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        print(f"[lawver-intro] 构建产物不存在：{root}（先跑 tools/build.sh）", file=sys.stderr)
        return 2

    handler = partial(IntroHandler, root=root)
    with ThreadingHTTPServer((args.host, args.port), handler) as httpd:
        print(f"[lawver-intro] serving {root} on http://{args.host}:{args.port}", file=sys.stderr)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
