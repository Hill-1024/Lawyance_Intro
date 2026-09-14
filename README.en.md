# Lawver Intro

[中文](./README.md) | English | [日本語](./README.ja.md)

Lawver Intro is the standalone product introduction site for Lawver. Built with Astro and Vue 3, it presents the first brand impression, core capabilities, application workbenches, working modes, memory boundaries, and trust statements for the Lawver Chinese legal AI workspace.

This repository is not the main Lawver application and not the source of the design system. It is a lightweight, static, independently deployable introduction site for users encountering the product for the first time.

## Page Content

- **Hero**: Lawver branding, Chinese legal AI workspace positioning, and entry link.
- **Capabilities**: legal and case retrieval, company information lookup, dossier processing, mock court, and output review.
- **Application workbenches**: separates the legal consultation workspace from the mock court workspace, including files, memory, court roles, review paths, and the mcps tool entry.
- **Working modes**: default consultation, Plan-and-Solve, and OCP output review.
- **Attention and memory**: the boundary between current context, conversation-level memory, and court role memory.
- **Trust boundary**: browser-first persistence, workspace isolation, authentication/audit controls, and careful legal expression.
- **Design**: overall topology and the MCPS tool gateway, dual-track orchestration with OCP review, the mock court FSM, multi-route memory recall, and sandbox boundaries.
- **Download center**: the web entry point plus the Android client, showing the version, package size, and publish date resolved at build time.

## Stack

- Astro 6 static site.
- Vue 3 components. Only the home page, which needs scroll-driven state, is hydrated; the design and download pages render to plain static HTML and ship no framework runtime.
- TypeScript.
- Custom CSS and Lawver brand visuals.

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
│   ├── _headers
│   └── favicon.svg
└── src/
    ├── components/
    │   ├── BrandLogo.vue
    │   ├── DesignPage.vue
    │   ├── DownloadPage.vue
    │   ├── HomePage.vue
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
        ├── github.ts
        └── scrollEffects.ts
```

| Path | Purpose |
| --- | --- |
| `src/components/HomePage.vue` | Home page content, scroll interaction, and section copy; the only hydrated Vue island |
| `src/components/DesignPage.vue` | Architecture and product design page content; no client state |
| `src/components/DownloadPage.vue` | Download center content and build-time release metadata |
| `src/components/SiteHeader.vue` | Fixed top navigation, active page highlight, and mobile fallback |
| `src/components/BrandLogo.vue` | Lawver brand mark component |
| `src/layouts/BaseLayout.astro` | HTML shell, fonts, metadata, and the reveal boot script |
| `src/utils/github.ts` | Build-time fetch of the latest Android release with layered fallbacks |
| `src/utils/scrollEffects.ts` | Progressive-enhancement reveal and hash scrolling shared by all three pages |
| `src/styles/global.css` | Layout, shared component styles, responsive styles, and motion |
| `src/pages/*.astro` | The three page entries |

## Maintenance Principles

- Copy should help users understand the product instead of listing features mechanically.
- Brand, color, and typography should stay aligned with the main Lawver application.
- The page should remain static, fast, and easy to deploy without unnecessary client state. `client:load` is reserved for the home page, which genuinely needs scroll state.
- Scroll reveal is progressive enhancement: the hidden state only applies after the boot script in `BaseLayout.astro` runs, so the content stays readable when JavaScript is disabled or fails to load.
- Styles shared across pages (buttons, CTA groups, section eyebrows) belong in `global.css`; do not copy them into per-page `<style scoped>` blocks.
- The site domain lives in `site` in `astro.config.mjs`; canonical and `og:url` are derived from it, so a domain change must be made there.
- CTA links point to the live Lawver service; domain changes should be checked here as well.

## License

This repository does not declare an open-source license yet. Please contact the maintainer before reuse, redistribution, or republishing.
