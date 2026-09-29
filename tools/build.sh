#!/usr/bin/env bash
# 构建介绍页并把 current 符号链接原子翻到新版本，进程不用重启。
#
# 用法：
#   tools/build.sh                 # 部署机构建
#   LAWVER_INTRO_KEEP=5 tools/build.sh
#   tools/build.sh --skip-install  # 依赖没变时跳过 pnpm install
#
# 目录约定（与 server/serve.py 一致）：
#   dist/            本次构建产物（vite 输出）
#   releases/<时间戳>/  历次产物，保留最近 KEEP 个
#   current -> releases/<时间戳>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

KEEP="${LAWVER_INTRO_KEEP:-3}"
SKIP_INSTALL=0
for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=1 ;;
    *) echo "未知参数：$arg" >&2; exit 2 ;;
  esac
done

if [[ "$SKIP_INSTALL" != "1" ]]; then
  pnpm install --frozen-lockfile
fi

pnpm run build

STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$ROOT/releases/$STAMP"
mkdir -p "$ROOT/releases"
rm -rf "$TARGET"
mv "$ROOT/dist" "$TARGET"

# 原子换链接：先建临时链接，再用 rename(2) 覆盖 current——serve.py 每请求解析一次，
# 半写状态不会出现。mv -T 在 BSD 上不存在，所以走 python 的 os.replace。
ln -s "$TARGET" "$ROOT/.current.new"
python3 - "$ROOT" <<'PY'
import os
import sys

root = sys.argv[1]
os.replace(os.path.join(root, ".current.new"), os.path.join(root, "current"))
PY

# 清理旧版本（按目录名排序即按时间排序）。不用 mapfile：macOS 自带 bash 3.2 没有它。
while IFS= read -r dir; do
  [[ -n "$dir" ]] && rm -rf "$dir"
done < <(ls -1dt "$ROOT"/releases/*/ 2>/dev/null | tail -n +$((KEEP + 1)) || true)

echo "[lawver-intro] 已发布 $(basename "$TARGET") → current"
