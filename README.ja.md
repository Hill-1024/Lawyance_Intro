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
- **ダウンロードセンター**: Web 版の入口と Android クライアント。ビルド時に解決したバージョン、容量、公開日を表示します。インストーラーはこのサイトが配信するため、GitHub への到達性に依存しません。
- **フッター**: 3 ページ共通の締めくくりで、製品アンカー、ページ入口、外部リンクをまとめます。

サブページは Hero の直下にセクション索引（製品設計ページ）またはリリース情報の行（ダウンロードセンター）を置き、遷移できるアンカーとビルド時のメタデータをファーストビュー内に収めます。

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

ビルドは 3 段階です。まず `scripts/fetch-apk.mjs` が上流の最新リリースのインストーラーを `public/apk/` にミラーし、次に `astro check` を実行し、最後に静的サイトを `dist/` へ出力します。

ビルドせずにミラーだけ更新する場合：

```bash
pnpm run fetch:apk
```

ビルド結果のプレビュー：

```bash
pnpm preview
```

## リリース同期と APK ミラー

上流のアプリケーションリポジトリ（`Hill-1024/Lawyance`）がリリースを公開すると、サイトは 2 つの経路で更新されます。

1. **主経路**：上流の `.github/workflows/rebuild-intro-page.yml` が `release: published` で Cloudflare Pages の deploy hook を POST し、Pages がこのリポジトリを再ビルドします。
2. **予備経路**：このリポジトリの `.github/workflows/rebuild-on-release.yml` が 6 時間ごとに、上流の最新タグと公開中の `/apk/version.json` の `tagName` を比較します。不一致なら再ビルドを起動します。`CF_PAGES_DEPLOY_HOOK` secret があれば deploy hook を送り、なければ空コミットを push して Pages に拾わせます。`repository_dispatch`（タイプ `upstream-release`）と手動 `workflow_dispatch` も受け付けます。

インストーラーのミラーはビルド時に `scripts/fetch-apk.mjs` が行います。

- 上流の最新リリースから `.apk` を取得し、sha256 と ZIP コンテナのヘッダーを検証して `public/apk/Lawver-<バージョン>.apk` に書き出し、古いバージョンのファイルを削除します。
- `public/apk/version.json` を書き出します。これはこのデプロイが配信するインストーラーのマニフェストであり、リリース比較の基準でもあります。
- ページはこのローカルミラーを優先します。ミラーがない場合はアプリの APK エンドポイント、次に GitHub リリースへフォールバックするため、ミラーの失敗は警告のみでビルドを止めません。

| 環境変数 | 既定値 | 説明 |
| --- | --- | --- |
| `LAWVER_UPSTREAM_REPO` | `Hill-1024/Lawyance` | 上流のアプリケーションリポジトリ |
| `GITHUB_TOKEN` / `GH_TOKEN` | 空 | 任意。ビルドマシンの GitHub API レート制限を避けます |
| `LAWVER_SITE_ORIGIN` | `astro.config.mjs` の `site` | マニフェストの `apkUrl` に使うオリジン |
| `LAWVER_SKIP_APK_MIRROR` | 空 | `1` でミラーをスキップ。オフラインビルド用 |

`public/apk/` はビルド成果物であり、バージョン管理には含めません。

## プロジェクト構成

```text
.
├── .github/
│   └── workflows/
│       └── rebuild-on-release.yml
├── astro.config.mjs
├── public/
│   ├── _headers
│   ├── apk/                 # ビルド時に生成、追跡しない
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

| Path | 説明 |
| --- | --- |
| `src/components/HomePage.vue` | ホームページ本体、スクロール操作、各セクションの文言。唯一ハイドレートする Vue アイランド |
| `src/components/DesignPage.vue` | 製品設計・システム構成ページの内容。クライアント状態なし |
| `src/components/DownloadPage.vue` | ダウンロードセンターの内容とビルド時に解決したリリース情報 |
| `src/components/SiteHeader.vue` | 固定トップナビ、現在ページのハイライト、モバイル向けフォールバック |
| `src/components/SiteFooter.vue` | 3 ページ共通のフッター。`<main>` の外に置き、contentinfo ランドマークを保ちます |
| `src/components/BrandLogo.vue` | Lawver ブランドマークコンポーネント |
| `src/layouts/BaseLayout.astro` | HTML シェル、フォント、メタ情報、リビール用ブートスクリプト |
| `scripts/fetch-apk.mjs` | ビルド時に上流の最新リリース APK を `public/apk/` へミラーし、`version.json` を書き出します |
| `src/utils/apkMirror.ts` | ミラーのマニフェストを読み、ページがこのデプロイで配信するインストーラーを優先するようにします |
| `src/utils/github.ts` | 最新 Android リリースをビルド時に取得し、段階的にフォールバック |
| `src/utils/scrollEffects.ts` | 3 ページ共通のスクロールリビールとアンカー移動のプログレッシブエンハンスメント |
| `src/styles/global.css` | レイアウト、共通コンポーネントスタイル、レスポンシブスタイル、モーション |
| `.github/workflows/rebuild-on-release.yml` | 上流リリースと公開中のバージョンを定期的に比較し、ずれていれば再ビルドします |
| `src/pages/*.astro` | 3 つのページ入口 |

## メンテナンス方針

- 文言は機能の羅列ではなく、製品理解を助けるために書きます。
- ブランド、色、タイポグラフィは Lawver メインアプリと揃えます。
- ページは静的で高速、デプロイしやすい状態を保ち、不要なクライアント状態を追加しません。`client:load` はスクロール状態が本当に必要なホームページだけに使います。
- スクロールリビールはプログレッシブエンハンスメントです。非表示スタイルは `BaseLayout.astro` のブートスクリプト実行後にのみ有効になるため、JavaScript が無効・失敗しても内容は読めます。
- ページ間で共有するスタイル（ボタン、CTA グループ、セクションラベル、フッター、ダークバンド、スペック行）は `global.css` に置き、各ページの `<style scoped>` に複製しません。
- セクション見出しは `text-wrap: balance` を保ちます。中国語は任意の文字間で折り返すため、狭い列では最後の 2 文字だけが孤立します。
- ダークバンド（`.band--dark`）は 1 ページ内で唯一の明暗切り替えです。1 ページに 1 回まで、上下の端は透明のグラデーションにします。
- サイトのドメインは `astro.config.mjs` の `site` で設定し、canonical と `og:url` はそこから生成されます。ドメイン変更時はここも更新してください。ミラーのマニフェストの `apkUrl` も同じ設定から取ります。
- CTA リンクは正式な Lawver サービスへ向けています。ドメイン変更時はこのページも確認してください。
- `/apk/` 配下のパス構成は `public/_headers`、ミラースクリプト、リリース比較ワークフローが共有しています。ディレクトリやファイル名を変えるときは 3 つを同時に更新してください。

## ライセンス

このリポジトリでは、まだオープンソースライセンスを明示していません。再利用、再配布、再公開の前に、メンテナーへ利用条件を確認してください。
