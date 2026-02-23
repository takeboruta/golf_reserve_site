# ゴルフ場 最安値比較サイト

複数予約サイト（楽天GORA・じゃらんゴルフ等）の料金をまとめて比較し、**総額（税込）の安い順**で表示する Web アプリです。

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **API**: 楽天GORA API（プラン検索・ゴルフ場検索）、じゃらんゴルフ（スタブ・将来連携用）

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

**必須:**

- `RAKUTEN_APP_ID` … 楽天ウェブサービスでアプリ登録して取得した Application ID  
  - 登録: https://webservice.rakuten.co.jp/app/list

**任意:**

- `RECRUIT_API_KEY` … じゃらんゴルフ API 連携用（現状は未使用・将来用）
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
     - `RAKUTEN_APP_ID` … いったん空でもデプロイは可能。後から楽天でアプリ作成し、発行された Application ID をここに追加
4. **デプロイ**  
   - 初回デプロイ後、`https://〇〇.vercel.app` が発行されます。このURLを楽天ウェブサービス「アプリ登録」のアプリケーションURLに設定
5. **楽天でアプリ登録**  
   - https://webservice.rakuten.co.jp/app/list で新規作成し、アプリケーションURLに Vercel のURLを入力 → Application ID を取得し、Vercel の環境変数 `RAKUTEN_APP_ID` に追加 → 再デプロイ（または「Redeploy」）

## API ルート

| パス | 説明 |
|------|------|
| `GET /api/search` | 検索（playDate, areaCode, maxPrice, numberOfPeople） |
| `GET /api/gora/courses` | 楽天GORA ゴルフ場検索（areaCode / keyword） |
| `GET /api/gora/plans` | 楽天GORA プラン検索（playDate, areaCode 等） |
| `GET /api/jalan/plans` | じゃらん プラン検索（スタブ） |
| `GET /api/courses/[courseId]/calendar` | コース別 日別最安値（?days=7 または 30） |
| `GET/POST /api/history` | 検索履歴（Supabase 連携時） |
| `GET/POST /api/favorites` | お気に入り（Supabase 連携時） |

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
