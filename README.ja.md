# Lawver Intro

[中文](./README.md) | [English](./README.en.md) | 日本語

Lawver Intro は、Lawver の独立した製品紹介サイトです。Astro と Vue 3 で構築され、Lawver という中国語法律 AI ワークスペースの第一印象、主要機能、アプリケーション作業台、作業方式、記憶の境界、信頼に関する説明を伝えます。

このリポジトリは Lawver のメインアプリではなく、デザインシステムのソースでもありません。初めて製品を知るユーザー向けに作られた、軽量で静的な、単独デプロイ可能な紹介サイトです。

## ページ内容

- **Hero**: Lawver のブランド、中国語法律 AI ワークスペースとしての位置づけ、入口リンク。
- **機能紹介**: 法律・判例検索、企業情報の検索、事件記録処理、模擬法廷、出力レビュー。
- **アプリケーション作業台**: 法律相談ワークスペースと模擬法廷ワークスペースを分け、ファイル、記憶、法廷ロール、復盤経路、mcps ツール入口を説明。
- **作業方式**: デフォルト相談、Plan-and-Solve、OCP 出力レビュー。
- **注意力と記憶**: 現在の文脈、会話単位の記憶、法廷ロール記憶の境界。
- **信頼と境界**: ブラウザ優先の永続化、ワークスペース隔離、認証・監査、慎重な法的表現。
- **製品設計**: 全体トポロジーと MCPS ツールゲートウェイ、二系統のオーケストレーションと OCP レビュー、模擬法廷 FSM、多経路の記憶リコール、サンドボックス境界。
- **ダウンロードセンター**: Web 版の入口と Android クライアント。ビルド時に解決したバージョン、容量、公開日を表示します。

## 技術スタック

- Astro 6 静的サイト。
- Vue 3 コンポーネント。スクロール操作が必要なホームページのみハイドレートし、製品設計ページとダウンロードセンターはビルド時に純粋な静的 HTML として描画され、フレームワークのランタイムを配信しません。
- TypeScript。
- カスタム CSS と Lawver ブランドビジュアル。

## クイックスタート

```bash
pnpm install
pnpm dev
```

Astro の開発サーバーは `0.0.0.0` で待ち受けるため、LAN やリモート環境からのプレビューがしやすくなっています。

## ビルド

```bash
pnpm build
```

ビルドでは先に `astro check` を実行し、その後 `dist/` に静的サイトを出力します。

ビルド結果のプレビュー：

```bash
pnpm preview
```

## プロジェクト構成

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

| Path | 説明 |
| --- | --- |
| `src/components/HomePage.vue` | ホームページ本体、スクロール操作、各セクションの文言。唯一ハイドレートする Vue アイランド |
| `src/components/DesignPage.vue` | 製品設計・システム構成ページの内容。クライアント状態なし |
| `src/components/DownloadPage.vue` | ダウンロードセンターの内容とビルド時に解決したリリース情報 |
| `src/components/SiteHeader.vue` | 固定トップナビ、現在ページのハイライト、モバイル向けフォールバック |
| `src/components/BrandLogo.vue` | Lawver ブランドマークコンポーネント |
| `src/layouts/BaseLayout.astro` | HTML シェル、フォント、メタ情報、リビール用ブートスクリプト |
| `src/utils/github.ts` | 最新 Android リリースをビルド時に取得し、段階的にフォールバック |
| `src/utils/scrollEffects.ts` | 3 ページ共通のスクロールリビールとアンカー移動のプログレッシブエンハンスメント |
| `src/styles/global.css` | レイアウト、共通コンポーネントスタイル、レスポンシブスタイル、モーション |
| `src/pages/*.astro` | 3 つのページ入口 |

## メンテナンス方針

- 文言は機能の羅列ではなく、製品理解を助けるために書きます。
- ブランド、色、タイポグラフィは Lawver メインアプリと揃えます。
- ページは静的で高速、デプロイしやすい状態を保ち、不要なクライアント状態を追加しません。`client:load` はスクロール状態が本当に必要なホームページだけに使います。
- スクロールリビールはプログレッシブエンハンスメントです。非表示スタイルは `BaseLayout.astro` のブートスクリプト実行後にのみ有効になるため、JavaScript が無効・失敗しても内容は読めます。
- ページ間で共有するスタイル（ボタン、CTA グループ、セクションラベル）は `global.css` に置き、各ページの `<style scoped>` に複製しません。
- サイトのドメインは `astro.config.mjs` の `site` で設定し、canonical と `og:url` はそこから生成されます。ドメイン変更時はここも更新してください。
- CTA リンクは正式な Lawver サービスへ向けています。ドメイン変更時はこのページも確認してください。

## ライセンス

このリポジトリでは、まだオープンソースライセンスを明示していません。再利用、再配布、再公開の前に、メンテナーへ利用条件を確認してください。
