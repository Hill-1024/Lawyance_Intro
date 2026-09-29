# Lawver 介绍页

Lawver 的产品介绍页：与功能页**同域、不同进程**的独立站点，代码与部署都不和主应用绑在一起。

## 与功能页的关系

同一台机器上跑三件东西，由分流核心按路径分派：

| 端口 | 进程 | 负责的路径 |
|---|---|---|
| 8080 | 分流核心（主仓 `deploy/router/`） | 入口。健康检查、维护跳转、`/under_maintenance` |
| 8081 | 功能页（FastAPI + 工作台） | `/home`、`/login`、`/settings/*`、`/admin`、`/business`、`/court/*`、`/project/*`、`/conversation/*`、`/api/*`、`/sw.js`、`/manifest.webmanifest` |
| 8082 | **本仓库**（静态服务，`server/serve.py`） | `/`、`/design`、`/download`、`/pricing`、`/robots.txt`、`/sitemap.xml`、`/intro-assets/*` |

两条硬规则：

1. **产物必须落在 `/intro-assets/*`**（`vite.config.ts` 里写死）。功能页占着 `/assets/*`，同域下不分开，核心就无法按路径判定归属；静态文件名（`favicon.svg` 之类）同理，只放在 `/intro-assets/` 里。
2. **站内跳转与跨进程跳转要分清**：`/`、`/design`、`/download`、`/pricing` 用 react-router 的 `<Link>`；`/home`、`/login` 必须用真实 `<a>` 跳转——它们属于另一个进程，客户端路由到不了。

两台机器同一套布局：`lawver.dev`（国内）与 `global.lawver.dev`（海外）各跑一份核心 + 功能页 + 介绍页，差异只有主机名和数据源。

## 开发

```bash
pnpm install
pnpm dev     # http://127.0.0.1:5174，/api 代理到分流核心（默认 8080）
pnpm lint
pnpm build
```

## 部署（部署机）

两个仓库各自拉取、各自构建：

```bash
git pull
tools/build.sh
sudo systemctl restart lawver-intro   # 只有改了 server/serve.py 才需要
```

- `tools/build.sh` 把产物放进 `releases/<时间戳>/`，再用 `rename(2)` 原子翻转 `current` 符号链接；`serve.py` 每个请求解析一次链接，所以换版是零停机、不需要重启进程。
- 构建失败时 `current` 不动，线上继续跑上一版。
- 保留最近 3 个版本，`LAWVER_INTRO_KEEP` 可调。
- 单元文件见 `deploy/lawver-intro.service`，路径与用户按部署机实际情况改。

## 数据来源

页面本身没有后端，两处运行时依赖都来自功能页的同源接口：

- `/api/plans`：定价页的套餐目录。后端是价格的唯一来源，前端不硬编码；接口不可用时回落到「按量充值」单卡。
- `/api/releases/android/latest`：下载中心的 Android 版本信息；失败时回落到静态文案与 `/api/releases/android/apk`。

功能页维护中时这两处自动降级，介绍页照常渲染。

## 设计 token

`src/styles/tokens.css` 是从主仓 `frontend/src/index.css` 的 token 层复制过来的。两个仓库独立拉取、独立构建，不引 workspace 依赖；主仓调整调色板、圆角、阴影档位时，这里要同步一份（文件头有说明）。

## 与外部系统的约定

- 分流核心（主仓 `deploy/router/`）的介绍页路径表必须与本文件上面的表格一致；改路径表要两边一起改。
- `/under_maintenance` 由核心自答，本仓库既不需要也不应该提供该路径。
- 本仓库不注册 Service Worker：介绍页不需要离线壳，而 SW 的缓存回放会在功能页维护期间把用户留在旧页面上。
