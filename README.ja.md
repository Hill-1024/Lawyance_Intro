# Lawyance Intro

[中文](./README.md) | [English](./README.en.md) | 日本語

Lawyance Intro は、Lawyance の独立した製品紹介サイトです。Astro と Vue 3 で構築され、Lawyance という中国語法律 AI アシスタントの第一印象、主要機能、Agent の作業方式、記憶の境界、信頼に関する説明を伝えます。

このリポジトリは Lawyance のメインアプリではなく、デザインシステムのソースでもありません。初めて製品を知るユーザー向けに作られた、軽量で静的な、単独デプロイ可能な紹介サイトです。

## ページ内容

- **Hero**: Lawyance のブランド、法律 AI アシスタントとしての位置づけ、入口リンク。
- **機能紹介**: 法律検索、判例分析、契約レビュー、相談内容の整理。
- **Agent ワークフロー**: 直接回答から、計画、行動、検証へ進む流れ。
- **注意力と記憶**: 現在の文脈と会話単位の記憶の境界。
- **信頼と境界**: データ境界、検証可能な根拠、慎重な法的表現。

## 技術スタック

- Astro 5 静的サイト。
- Vue 3 コンポーネント。
- TypeScript。
- カスタム CSS と Lawyance ブランドビジュアル。

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

| Path | 説明 |
| --- | --- |
| `src/components/HomePage.vue` | 紹介ページ本体、スクロール操作、各セクションの文言 |
| `src/components/BrandLogo.vue` | Lawyance ブランドマークコンポーネント |
| `src/styles/global.css` | レイアウト、レスポンシブスタイル、モーション |
| `src/pages/index.astro` | Astro ページ入口 |

## メンテナンス方針

- 文言は機能の羅列ではなく、製品理解を助けるために書きます。
- ブランド、色、タイポグラフィは Lawyance メインアプリと揃えます。
- ページは静的で高速、デプロイしやすい状態を保ち、不要なクライアント状態を追加しません。
- CTA リンクは正式な Lawyance サービスへ向けています。ドメイン変更時はこのページも確認してください。

## ライセンス

このリポジトリでは、まだオープンソースライセンスを明示していません。再利用、再配布、再公開の前に、メンテナーへ利用条件を確認してください。
