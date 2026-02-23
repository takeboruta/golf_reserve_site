# 将来機能メモ: 価格アラート・比較強化・検索高速化

**方針: DB が必要な実装は後回しとする。Cookie・メモリキャッシュ・取得後フィルタなど DB なしで実現できるものから着手する。**

---

## 1. 価格アラート（お気に入りコースの値下がり通知）

### 概要
お気に入り登録したコースについて「○円以下になったら知らせる」を設定し、条件を満たしたら通知する。

### 必要な要素
- **登録ストア**: アラート条件（courseId, 目標価格 or 「前回より安い」）の保存。Cookie では cron から参照できないため、**DB（Supabase 等）または Vercel KV** が現実的。
- **価格チェック**: 定期的に GORA プラン検索でお気に入りコースの最安値を取得。**Vercel Cron** や外部 cron で API を叩く。
- **通知手段**: メール（Resend / SendGrid 等）、または「次回アクセス時にお知らせバッジ」のみ（DB に「未読アラート」を保存）。

### 実装パターン
- **A. フル通知**: DB + Cron + メール送信。**→ 後回し（DB 必須）**
- **B. 簡易版**: お気に入り一覧やトップで「お気に入りコースの今日の最安値」を表示し、「前回閲覧時より安い」があればバッジ表示。Cookie に「前回の最安値」を保存すれば **DB なしで実施可**。

### 対象コード案
- 新規: `src/app/api/alerts/`（登録・一覧）、cron 用 API（`src/app/api/cron/check-price-alerts/` 等）
- 既存: お気に入りは Cookie/将来 Supabase

---

## 2. 比較条件の強化

### 2.1 キャンセル条件
- **現状**: GORA API の `cancelFeeFlag`, `cancelFee` は型にはあるが正規化・表示していない。
- **対応**: `NormalizedPlan` に `cancelFee?: string` 等を追加し、`normalize-gora.ts` で GoraPlanItem から設定。検索結果カードとコース詳細で表示。**フィルタ**（「キャンセル料なし」等）は取得後フロント or API で `filter`。

### 2.2 スタート時間帯
- **現状**: 検索パラメータ `startTimeZone`（4〜15時台）は API に渡しており、`NormalizedPlan.startTimeZone` で表示あり。
- **強化**: 複数時台の指定（例: 7〜9時台のみ）、または「早朝」「午前」「午後」などの区分を UI で選べるようにする。

### 2.3 評価しきい値
- **現状**: `sort=evaluation` で評価順ソートのみ。評価で「○以上」の絞り込みはなし。
- **対応**: API に `minEvaluation`（例: 4.0）を追加し、取得後の `allPlans.filter(p => (p.evaluation ?? 0) >= minEvaluation)` で適用。SearchForm に評価スライダー or セレクトを追加。

### 2.4 移動時間
- **概要**: 出発地からゴルフ場までの所要時間でソート or フィルタ。
- **必要**: 出発地（住所 or 緯度経度）、ゴルフ場の緯度経度（GORA ゴルフ場検索 API に `latitude`/`longitude` あり）、距離/時間計算（直線距離で近似 or Google Distance Matrix API 等）。データが揃えば `NormalizedPlan` に `travelMinutes?: number` を足し、検索 API でソート・フィルタ用に利用。

### 対象コード案
- `src/types/search.ts`（NormalizedPlan 拡張）
- `src/lib/normalize-gora.ts`（cancelFee, 必要なら緯度経度）
- `src/app/api/search/route.ts`（minEvaluation 等のクエリとフィルタ）
- `src/components/SearchForm.tsx`（評価・キャンセル条件・時間帯の UI）
- `src/components/PlanCard.tsx`（キャンセル料・評価の表示）

---

## 3. 検索高速化（API キャッシュ + ページング）

### 3.1 API キャッシュ
- **目的**: 同一条件（playDate, areaCode, keyword, minPrice, maxPrice, sort 等）の検索結果を一定時間再利用し、GORA API 呼び出しと応答時間を削減。
- **方式**: 
  - **メモリキャッシュ**: Node の Map や lru-cache。**DB 不要。** サーバーレスではインスタンスごとで効果は限定的だが実装可能。
  - **Vercel KV / Redis**: DB に近いストアのため **後回し** でも可。使う場合はキャッシュキー + TTL で実施。
- **無効化**: キャッシュキーに `playDate` を含めておけば日付が変われば自動で別キー。手動のキャッシュクリアは管理用 API を用意するか、TTL のみで運用。

### 3.2 ページング
- **現状**: `hits=30` で 1 リクエスト、全件返却。フロントで「もっと見る」で表示件数を増やしている（全件取得済み）。
- **強化案**:
  - **A. バックエンドページング**: 検索 API に `page`（例: 1, 2, 3）と `perPage`（例: 20）を追加。GORA の `page` パラメータを利用し、`items` をそのページ分だけ返す。フロントは「次へ」で `page=2` を要求。**キャッシュはキーに page を含める**。
  - **B. 現状維持 + キャッシュのみ**: 30 件のまま、同一条件の 1 ページ目だけキャッシュして高速化。

### 対象コード案
- 新規: `src/lib/search-cache.ts`（キャッシュキー生成・get/set、TTL）
- `src/app/api/search/route.ts`: 冒頭でキャッシュ取得、取得時は GORA 呼び出しをスキップ。返却前にキャッシュ set。オプションで `page`/`perPage` を解釈し、GORA の `page` に渡す。
- フロント: `page` 対応時は「もっと見る」で `page` をインクリメントして再取得。

---

## 4. 価格カレンダー高速化（メモリキャッシュ）※実施済み

- **目的**: コース詳細の「向こう N 日間の最安値」取得で、同一コース・同一日数の再表示時に GORA を叩かずに済ませる。
- **方式**: `src/lib/calendar-cache.ts` で TTL 10 分のメモリキャッシュ。キーは `courseId` + `days`。
- **対象**: `src/app/api/courses/[courseId]/calendar/route.ts` でキャッシュヒット時はループ・GORA 呼び出しをスキップしてキャッシュを返却。

---

## 優先度の目安（DB ありは後回し）

| 機能 | 実装コスト | DB | おすすめ順 |
|------|------------|-----|------------|
| 比較条件の強化（キャンセル・評価しきい値） | 小 | 不要 | 1 |
| 検索キャッシュ（メモリ） + ページング | 中 | 不要 | 2 |
| 価格アラート（簡易版＝Cookie + 訪問時バッジ） | 中 | 不要 | 3 |
| 移動時間（緯度経度・距離計算） | 中〜大 | 不要 | 4 |
| 価格アラート（メール通知） | 大 | **必要** | 後回し |
| 検索キャッシュ（Vercel KV/Redis） | 中 | ストア必要 | 任意・後回し可 |
