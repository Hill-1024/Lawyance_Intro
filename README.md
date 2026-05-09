# Lawyance Intro

中文 | [English](./README.en.md) | [日本語](./README.ja.md)

Lawyance Intro 是 Lawyance 的独立产品介绍页。它用 Astro + Vue 3 构建，负责承载 Lawyance 的品牌第一印象、核心能力说明、Agent 工作方式、记忆边界和信任声明。

这个仓库不是 Lawyance 主应用，也不是设计系统源文件。它是一个轻量、静态、可独立部署的介绍站点，面向用户第一次了解产品时的阅读体验。

## 页面内容

- **Hero**: 展示 Lawyance 品牌、中文法律 AI 助手定位和入口链接。
- **能力介绍**: 说明法律检索、案例分析、合同审查和咨询整理能力。
- **Agent 范式**: 解释从直接回答到规划、行动、校验的工作流。
- **注意力与记忆**: 说明当前上下文与对话级记忆之间的边界。
- **信任与边界**: 强调数据边界、依据可核验和谨慎表达。

## 技术栈

- Astro 5 静态站点。
- Vue 3 组件。
- TypeScript。
- 自定义 CSS 与 Lawyance 品牌视觉。

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

构建会先执行 `astro check`，再输出静态站点到 `dist/`。

预览构建产物：

```bash
pnpm preview
```

## 项目结构

```text
.
├── astro.config.mjs
├── public/
│   └── favicon.svg
└── src/
    ├── components/
    │   ├── BrandLogo.vue
    │   └── HomePage.vue
    ├── pages/
    │   └── index.astro
    └── styles/
        └── global.css
```

| 路径 | 说明 |
| --- | --- |
| `src/components/HomePage.vue` | 介绍页主体内容、滚动交互和分区文案 |
| `src/components/BrandLogo.vue` | Lawyance 品牌标识组件 |
| `src/styles/global.css` | 页面布局、响应式样式和动效 |
| `src/pages/index.astro` | Astro 页面入口 |

## 维护原则

- 文案应服务于产品理解，而不是堆砌功能列表。
- 品牌、颜色和排版应与 Lawyance 主应用保持一致。
- 页面应保持静态、快速、易部署，不引入不必要的客户端状态。
- 入口链接指向正式 Lawyance 服务，变更域名时需要同步检查 CTA。

## 许可证

当前仓库尚未声明开源许可证。复用、分发或二次发布前，请先联系维护者确认授权。
