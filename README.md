# Lawver Intro

中文 | [English](./README.en.md) | [日本語](./README.ja.md)

Lawver Intro 是 Lawver 的独立产品介绍页。它用 Astro + Vue 3 构建，负责承载 Lawver 的品牌第一印象、核心能力说明、应用工作台、工作方式、记忆边界和信任声明。

这个仓库不是 Lawver 主应用，也不是设计系统源文件。它是一个轻量、静态、可独立部署的介绍站点，面向用户第一次了解产品时的阅读体验。

## 页面内容

- **Hero**: 展示 Lawver 品牌、中文法律 AI 工作台定位和入口链接。
- **能力介绍**: 说明法律与案例检索、企业信息查询、卷宗处理、模拟法庭和输出审查能力。
- **应用工作台**: 区分法律咨询工作台与模拟法庭工作台，说明文件、记忆、庭审角色、复盘路径和 mcps 工具入口。
- **工作方式**: 解释默认咨询、Plan-and-Solve 和 OCP 输出审查。
- **注意力与记忆**: 说明当前上下文、对话级记忆和庭审角色记忆之间的边界。
- **信任与边界**: 强调浏览器优先持久、工作区隔离、认证审计和谨慎表达。
- **产品设计**: 解释整体拓扑与 MCPS 工具网关、双轨编排管线与 OCP 审查、模拟法庭 FSM、多路召回记忆和沙箱边界。
- **下载中心**: 提供 Web 端入口与 Android 客户端下载，展示构建期解析的版本号、包大小与发布时间。安装包由本站镜像托管，不依赖 GitHub 的下载可达性。
- **页脚**: 三个页面共用的收尾区，汇总产品锚点、页面入口与外部访问入口。

子页面在 Hero 下方提供章节索引（产品设计页）或版本规格行（下载中心），把可导航的锚点和构建期元数据放在首屏可见的位置，而不是留作空白。

## 技术栈

- Astro 6 静态站点。
- Vue 3 组件。只有需要滚动交互的首页水合，产品设计页与下载中心在构建期渲染为纯静态 HTML，不向浏览器发送框架运行时。
- TypeScript。
- 自定义 CSS 与 Lawver 品牌视觉。

## 快速开始

```bash
pnpm install
pnpm dev
```

开发服务器默认由 Astro 启动，并监听 `0.0.0.0`，方便在局域网或远程环境中预览。

## 构建

```bash
pnpm build
```

构建分三步：先运行 `scripts/fetch-apk.mjs` 把上游最新 release 的安装包镜像到 `public/apk/`，再执行 `astro check`，最后输出静态站点到 `dist/`。

只想刷新镜像而不构建：

```bash
pnpm run fetch:apk
```

预览构建产物：

```bash
pnpm preview
```

## 发布同步与 APK 镜像

上游应用仓库（`Hill-1024/Lawyance`）发布 release 后，站点通过两条路径更新：

1. **主路径**：上游的 `.github/workflows/rebuild-intro-page.yml` 在 `release: published` 时 POST Cloudflare Pages deploy hook，触发 Pages 重新构建本仓库。
2. **兜底路径**：本仓库的 `.github/workflows/rebuild-on-release.yml` 每 6 小时比对上游最新 tag 与线上 `/apk/version.json` 的 `tagName`。两者不一致就触发重建：配置了 `CF_PAGES_DEPLOY_HOOK` secret 时发 deploy hook，否则推一个空提交让 Pages 重新构建。它同时接受 `repository_dispatch`（类型 `upstream-release`）和手动 `workflow_dispatch`。

安装包由 `scripts/fetch-apk.mjs` 在构建期镜像：

- 从上游最新 release 下载 `.apk`，校验 sha256 与 ZIP 容器头，写入 `public/apk/Lawver-<版本>.apk`，并清理旧版本文件。
- 同时写出 `public/apk/version.json`：本站托管的版本清单，也是发布比对的依据。
- 页面优先使用本站镜像；镜像缺失时按应用后端 APK 接口、GitHub Release 的顺序回退。镜像失败只告警，不中断构建。

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `LAWVER_UPSTREAM_REPO` | `Hill-1024/Lawyance` | 上游应用仓库 |
| `GITHUB_TOKEN` / `GH_TOKEN` | 空 | 可选，避免构建机被 GitHub API 限流 |
| `LAWVER_SITE_ORIGIN` | `astro.config.mjs` 的 `site` | 清单里 `apkUrl` 的来源域名 |
| `LAWVER_SKIP_APK_MIRROR` | 空 | 设为 `1` 时跳过镜像，便于离线构建 |

`public/apk/` 是构建产物，不纳入版本管理。

## 项目结构

```text
.
├── .github/
│   └── workflows/
│       └── rebuild-on-release.yml
├── astro.config.mjs
├── public/
│   ├── _headers
│   ├── apk/                 # 构建期生成的镜像，不入库
│   └── favicon.svg
├── scripts/
│   └── fetch-apk.mjs
└── src/
    ├── components/
    │   ├── BrandLogo.vue
    │   ├── DesignPage.vue
    │   ├── DownloadPage.vue
    │   ├── HomePage.vue
    │   ├── SiteFooter.vue
    │   └── SiteHeader.vue
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── design.astro
    │   ├── download.astro
    │   └── index.astro
    ├── styles/
    │   └── global.css
    └── utils/
        ├── apkMirror.ts
        ├── github.ts
        └── scrollEffects.ts
```

| 路径 | 说明 |
| --- | --- |
| `src/components/HomePage.vue` | 首页主体内容、滚动交互和分区文案，是唯一需要水合的 Vue 岛 |
| `src/components/DesignPage.vue` | 产品设计与系统架构页内容，无客户端状态 |
| `src/components/DownloadPage.vue` | 下载中心内容与构建期解析的版本信息 |
| `src/components/SiteHeader.vue` | 固定顶部导航、当前页高亮与移动端降级 |
| `src/components/SiteFooter.vue` | 三个页面共用的页脚，放在 `<main>` 之外，保持 contentinfo 地标语义 |
| `src/components/BrandLogo.vue` | Lawver 品牌标识组件 |
| `src/layouts/BaseLayout.astro` | HTML 骨架、字体与元信息、滚动显现引导脚本 |
| `scripts/fetch-apk.mjs` | 构建期把上游最新 release 的 APK 镜像进 `public/apk/`，并写出 `version.json` 清单 |
| `src/utils/apkMirror.ts` | 读取镜像清单，让页面优先使用本站托管的安装包 |
| `src/utils/github.ts` | 构建期获取最新 Android 版本，失败时逐级回退 |
| `src/utils/scrollEffects.ts` | 滚动显现与锚点定位的渐进增强脚本，三个页面共用 |
| `src/styles/global.css` | 页面布局、共用组件样式、响应式样式和动效 |
| `.github/workflows/rebuild-on-release.yml` | 定时比对上游客仓库 release 与线上版本，必要时触发重建 |
| `src/pages/*.astro` | 三个页面入口 |

## 维护原则

- 文案应服务于产品理解，而不是堆砌功能列表。
- 品牌、颜色和排版应与 Lawver 主应用保持一致。
- 页面应保持静态、快速、易部署，不引入不必要的客户端状态。`client:load` 只用于首屏确实需要滚动状态的首页，静态页面直接渲染。
- 滚动显现属于渐进增强：隐藏样式只在 `BaseLayout.astro` 的引导脚本运行后才生效，禁用或加载失败时内容仍然完整可读。
- 跨页面共用样式（按钮、CTA 分组、区块标签、页脚、深色带、规格行）写在 `global.css`，不要复制进各页面的 `<style scoped>`。
- 章节标题保持 `text-wrap: balance`：中文可在任意字符间换行，窄列里不加平衡会折出只有两个字的孤行。
- 深色带（`.band--dark`）是页面唯一的明暗切换手段，每个页面最多用一次，并保持上下边缘透明淡出。
- 站点域名配置在 `astro.config.mjs` 的 `site`，canonical 与 `og:url` 由它生成，更换域名时必须同步修改。镜像清单的 `apkUrl` 也取自这里。
- 入口链接指向正式 Lawver 服务，变更域名时需要同步检查 CTA。
- `/apk/` 下的路径约定被 `public/_headers`、镜像脚本和发布比对脚本共同依赖，改动目录或文件命名时要一起改。

## 许可证

当前仓库尚未声明开源许可证。复用、分发或二次发布前，请先联系维护者确认授权。
