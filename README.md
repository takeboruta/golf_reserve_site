# ゴルフ場 最安値比較サイト

楽天GORAのプランを安い順に表示し、**総額（税込）の最安プラン**がすぐわかる Web アプリです。

## 設計ドキュメント

- 全体・機能別設計: [`docs/README.md`](docs/README.md)
- 開発品質ルール: [`docs/quality-rules.md`](docs/quality-rules.md)

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **API**: 楽天GORA API（プラン検索・ゴルフ場検索）、じゃらんゴルフ（スタブ API）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.example .env.local
```

**必須（楽天GORA API）:**

- `RAKUTEN_APP_ID` … アプリケーションID（楽天でアプリ登録して取得）
- `RAKUTEN_APPLICATION_ID` でも同じ値を設定可能（`RAKUTEN_APP_ID` のエイリアス）
- `RAKUTEN_ACCESS_KEY` … アクセスキー（API仕様変更に備えて設定推奨）
- 登録: https://webservice.rakuten.co.jp/app/list

**任意（楽天アフィリエイト）:**

- `RAKUTEN_AFFILIATE_ID` … 楽天アフィリエイトID（成果計測用）。サーバー環境変数のみで保持（フロントに露出しない）。本番は Vercel の Environment Variables に設定
- `NEXT_PUBLIC_APP_URL` … 楽天API呼び出し時の `Referer`/`Origin` に使うアプリURL（例: `http://localhost:3000`）

**任意:**

- `RECRUIT_API_KEY` … じゃらんゴルフ公式API連携用（現状は未使用の予約パラメータ）
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` … 検索履歴・お気に入り用（未設定時は空で動作）

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 主な機能

- **検索**: プレー日・エリア・予算上限・人数で条件指定し、最安値プランを検索
- **比較**: 楽天GORAのプランを総額（税込）の安い順で一覧表示
- **価格カレンダー**: コース詳細ページ（`/courses/[courseId]`）で向こう7〜30日間の最安値を表示
- **モバイルファースト**: スマートフォンでの利用を想定したレイアウト

## Git / GitHub に上げる手順

Vercel デプロイ前に、GitHub にコードをプッシュします。

### 1. GitHub でリポジトリを用意する

1. https://github.com/new を開く
2. Repository name に `golf_reserve_site`（任意）を入力
3. Public のまま「Create repository」をクリック
4. 表示された **リポジトリURL** を控える（例: `https://github.com/ユーザー名/golf_reserve_site.git`）

### 2. ローカルでコミットしてプッシュする

プロジェクト直下で実行します。

```bash
# 変更をすべてステージ
git add .

# コミット
git commit -m "feat: ゴルフ場最安値比較サイト MVP"

# リモートを追加（URL は GitHub で表示されたものに置き換え）
git remote add origin https://github.com/ユーザー名/golf_reserve_site.git

# main ブランチをプッシュ
git push -u origin main
```

- すでに `origin` を追加済みの場合は `git remote add` は不要です。別のURLに差し替える場合は `git remote set-url origin 新しいURL` で変更できます。
- プッシュ時に GitHub の認証（パスワードの代わりに Personal Access Token、または SSH）を求められたら、GitHub の設定に従って入力してください。

---

## Vercel へのデプロイ

**楽天のアプリ登録で「アプリケーションURL」が必須の場合**  
ローカル（localhost）ではURLを登録できないため、**先にVercelへデプロイ**し、発行された本番URL（例: `https://your-app.vercel.app`）を楽天の開発者画面の「アプリケーションURL」に登録する流れを推奨します。

### 手順

1. **上記のとおり GitHub にプッシュ済みであること**
2. **Vercel でプロジェクトをインポート**  
   - https://vercel.com で「New Project」→ 対象リポジトリを選択
3. **環境変数の設定**  
   - Project Settings → Environment Variables で設定:
     - `RAKUTEN_APP_ID`（必須）… 楽天 Web Service のアプリケーションID
     - `RAKUTEN_AFFILIATE_ID`（任意）… 楽天アフィリエイトID
4. **デプロイ**  
   - 初回デプロイ後、`https://〇〇.vercel.app` が発行されます。このURLを楽天ウェブサービス「アプリ登録」のアプリケーションURLに設定
5. **楽天でアプリ登録**  
   - https://webservice.rakuten.co.jp/app/list で新規作成し、アプリケーションURLに Vercel のURLを入力 → **アプリケーションID** を取得し、Vercel の環境変数 `RAKUTEN_APP_ID` に追加（必要なら `RAKUTEN_AFFILIATE_ID` も追加）→ 再デプロイ（「Redeploy」）

## API ルート

| パス | 説明 |
|------|------|
| `GET /api/search` | 検索（playDate, areaCode, keyword, lunchOnly, sort, startTimeZone, minPrice, maxPrice） |
| `GET /api/gora/courses` | 楽天GORA ゴルフ場検索（areaCode / keyword） |
| `GET /api/gora/plans` | 楽天GORA プラン検索（playDate, areaCode 等） |
| `GET /api/jalan/plans` | じゃらん プラン検索（スタブ） |
| `GET /api/courses/[courseId]/calendar` | コース別 日別最安値（?days=7 または 30） |
| `GET/POST /api/history` | 検索履歴（Cookie 永続化。Supabase は将来拡張） |
| `GET/POST /api/favorites` | お気に入り（Cookie 永続化。Supabase は将来拡張） |

## ビルド

```bash
npm run build
npm start
```

## 今後の拡張

- じゃらんゴルフ API の正式連携（仕様公開時）
- Supabase による検索履歴・お気に入りの永続化
- 公式サイトスクレイピング（利用規約・法令に注意）
- AI レコメンド（「このコースが好きなら…」）
