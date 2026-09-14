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
- **Download center**: the web entry point plus the Android client, showing the version, package size, and publish date resolved at build time. The installer is hosted by this site, so it does not depend on GitHub being reachable.
- **Footer**: shared closing block for all three pages, grouping product anchors, page entries, and external destinations.

The sub-pages put either a section index (design page) or a release metadata row (download center) directly under the hero, so navigable anchors and build-time metadata occupy visible space instead of leaving the first screen empty.

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

The build runs in three steps: `scripts/fetch-apk.mjs` mirrors the newest upstream release installer into `public/apk/`, then `astro check` runs, then the static site is written to `dist/`.

Refresh the mirror without building:

```bash
pnpm run fetch:apk
```

Preview the build:

```bash
pnpm preview
```

## Release Sync and APK Mirror

When the upstream application repository (`Hill-1024/Lawyance`) publishes a release, the site updates through two paths:

1. **Primary**: the upstream `.github/workflows/rebuild-intro-page.yml` POSTs a Cloudflare Pages deploy hook on `release: published`, which rebuilds this repository on Pages.
2. **Safety net**: this repository's `.github/workflows/rebuild-on-release.yml` compares the newest upstream tag with the `tagName` in the live `/apk/version.json` every 6 hours. On a mismatch it triggers a rebuild — through the deploy hook when a `CF_PAGES_DEPLOY_HOOK` secret is configured, otherwise by pushing an empty commit for Pages to pick up. It also accepts `repository_dispatch` (type `upstream-release`) and manual `workflow_dispatch`.

The installer is mirrored at build time by `scripts/fetch-apk.mjs`:

- Downloads the `.apk` from the newest upstream release, verifies its sha256 and ZIP container header, writes `public/apk/Lawver-<version>.apk`, and prunes superseded versions.
- Writes `public/apk/version.json`: the manifest for the installer this deployment hosts, and the basis for the release comparison.
- Pages prefer the local mirror. When it is missing they fall back to the application's APK endpoint and then the GitHub release, so a failed mirror only warns instead of breaking the build.

| Variable | Default | Purpose |
| --- | --- | --- |
| `LAWVER_UPSTREAM_REPO` | `Hill-1024/Lawyance` | Upstream application repository |
| `GITHUB_TOKEN` / `GH_TOKEN` | empty | Optional; avoids GitHub API rate limits on the build machine |
| `LAWVER_SITE_ORIGIN` | `site` from `astro.config.mjs` | Origin used for `apkUrl` in the manifest |
| `LAWVER_SKIP_APK_MIRROR` | empty | Set to `1` to skip the mirror, for offline builds |

`public/apk/` is build output and is not tracked.

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── rebuild-on-release.yml
├── astro.config.mjs
├── public/
│   ├── _headers
│   ├── apk/                 # generated at build time, not tracked
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

| Path | Purpose |
| --- | --- |
| `src/components/HomePage.vue` | Home page content, scroll interaction, and section copy; the only hydrated Vue island |
| `src/components/DesignPage.vue` | Architecture and product design page content; no client state |
| `src/components/DownloadPage.vue` | Download center content and build-time release metadata |
| `src/components/SiteHeader.vue` | Fixed top navigation, active page highlight, and mobile fallback |
| `src/components/SiteFooter.vue` | Footer shared by all three pages; sits outside `<main>` so the contentinfo landmark stays valid |
| `src/components/BrandLogo.vue` | Lawver brand mark component |
| `src/layouts/BaseLayout.astro` | HTML shell, fonts, metadata, and the reveal boot script |
| `scripts/fetch-apk.mjs` | Build-time mirror of the newest upstream release APK into `public/apk/`, plus its `version.json` manifest |
| `src/utils/apkMirror.ts` | Reads the mirror manifest so pages prefer the installer this deployment hosts |
| `src/utils/github.ts` | Build-time fetch of the latest Android release with layered fallbacks |
| `src/utils/scrollEffects.ts` | Progressive-enhancement reveal and hash scrolling shared by all three pages |
| `src/styles/global.css` | Layout, shared component styles, responsive styles, and motion |
| `.github/workflows/rebuild-on-release.yml` | Periodically compares the upstream release with the live version and rebuilds when they drift |
| `src/pages/*.astro` | The three page entries |

## Maintenance Principles

- Copy should help users understand the product instead of listing features mechanically.
- Brand, color, and typography should stay aligned with the main Lawver application.
- The page should remain static, fast, and easy to deploy without unnecessary client state. `client:load` is reserved for the home page, which genuinely needs scroll state.
- Scroll reveal is progressive enhancement: the hidden state only applies after the boot script in `BaseLayout.astro` runs, so the content stays readable when JavaScript is disabled or fails to load.
- Styles shared across pages (buttons, CTA groups, section eyebrows, footer, dark band, spec rows) belong in `global.css`; do not copy them into per-page `<style scoped>` blocks.
- Section headlines keep `text-wrap: balance`: Chinese wraps between any two characters, so an unbalanced narrow column strands a two-character last line.
- The dark band (`.band--dark`) is the only light/dark switch on a page. Use it at most once per page and keep its top and bottom edges transparent.
- The site domain lives in `site` in `astro.config.mjs`; canonical and `og:url` are derived from it, so a domain change must be made there. The mirror manifest takes its `apkUrl` from the same setting.
- CTA links point to the live Lawver service; domain changes should be checked here as well.
- The path layout under `/apk/` is shared by `public/_headers`, the mirror script, and the release comparison workflow; change the directory or file naming in all three together.

## License

This repository does not declare an open-source license yet. Please contact the maintainer before reuse, redistribution, or republishing.
