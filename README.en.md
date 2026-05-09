# Lawyance Intro

[中文](./README.md) | English | [日本語](./README.ja.md)

Lawyance Intro is the standalone product introduction site for Lawyance. Built with Astro and Vue 3, it presents the first brand impression, core capabilities, agent workflow, memory boundaries, and trust statements for the Lawyance Chinese legal AI assistant.

This repository is not the main Lawyance application and not the source of the design system. It is a lightweight, static, independently deployable introduction site for users encountering the product for the first time.

## Page Content

- **Hero**: Lawyance branding, Chinese legal AI assistant positioning, and entry link.
- **Capabilities**: legal retrieval, case analysis, contract review, and consultation structuring.
- **Agent workflow**: from direct answer to planning, action, and verification.
- **Attention and memory**: the boundary between current context and conversation-level memory.
- **Trust boundary**: data boundaries, verifiable sources, and careful legal expression.

## Stack

- Astro 5 static site.
- Vue 3 components.
- TypeScript.
- Custom CSS and Lawyance brand visuals.

## Quick Start

```bash
pnpm install
pnpm dev
```

The Astro development server listens on `0.0.0.0`, which makes previewing from a LAN or remote environment easier.

## Build

```bash
pnpm build
```

The build runs `astro check` first and then writes the static site to `dist/`.

Preview the build:

```bash
pnpm preview
```

## Project Structure

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

| Path | Purpose |
| --- | --- |
| `src/components/HomePage.vue` | Main page content, scroll interaction, and section copy |
| `src/components/BrandLogo.vue` | Lawyance brand mark component |
| `src/styles/global.css` | Layout, responsive styles, and motion |
| `src/pages/index.astro` | Astro page entry |

## Maintenance Principles

- Copy should help users understand the product instead of listing features mechanically.
- Brand, color, and typography should stay aligned with the main Lawyance application.
- The page should remain static, fast, and easy to deploy without unnecessary client state.
- CTA links point to the live Lawyance service; domain changes should be checked here as well.

## License

This repository does not declare an open-source license yet. Please contact the maintainer before reuse, redistribution, or republishing.
