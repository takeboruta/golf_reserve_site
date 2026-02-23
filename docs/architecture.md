# アーキテクチャ一覧

## 1. システム構成

- フロントエンド: Next.js App Router（Client Component 中心）
- API層: Next.js Route Handler（`src/app/api/**`）
- 外部連携: 楽天GORA API、将来のじゃらん公式API（現状はデモ実装）
- データ永続化: Supabase（現状は接続判定のみ。保存処理は TODO）

## 2. レイヤー一覧

### Presentation Layer

- `src/app/page.tsx`
  - 検索条件入力、URLクエリ同期、結果一覧表示
- `src/app/courses/[courseId]/page.tsx`
  - 価格カレンダー、予約リンク、Googleマップ表示
- `src/components/SearchForm.tsx`
  - 検索フォーム（キーワード・昼食付き・並び順・開始時間帯を含む）
- `src/components/PlanCard.tsx`
  - プランカード表示（価格/評価/予約導線）
- `src/components/PrefectureCitySelect.tsx`
  - 都道府県複数選択 UI

### API Layer

- `GET /api/search`
  - 楽天GORA取得 + 正規化 + じゃらんデモ合成 + 条件フィルタ + ソート
- `GET /api/gora/plans`
  - 楽天GORAプラン検索の透過 API
- `GET /api/gora/courses`
  - 楽天GORAコース検索の透過 API
- `GET /api/courses/[courseId]/calendar`
  - 日次最安値・予約URL・コース名を返却
- `GET /api/jalan/plans`
  - じゃらん向けスタブ API
- `GET/POST /api/history`
  - 検索履歴（未実装枠）
- `GET/POST /api/favorites`
  - お気に入り（未実装枠）

### Domain / Integration Layer

- `src/lib/rakuten-api.ts`
  - 楽天GORA API 呼び出し（`openapi.rakuten.co.jp`）
  - 環境変数ロード（`RAKUTEN_APP_ID`/`RAKUTEN_ACCESS_KEY`/`RAKUTEN_AFFILIATE_ID`）
  - `Referer`/`Origin` ヘッダー付与
- `src/lib/normalize-gora.ts`
  - GORAレスポンスを `NormalizedPlan` へ変換
- `src/lib/jalan-api.ts`
  - GORA結果からのじゃらんデモデータ生成
- `src/lib/supabase.ts`
  - Supabase 設定有無判定

### Data / Type Layer

- `src/types/search.ts`（画面共通モデル）
- `src/types/gora.ts`（外部 API 型）
- `src/types/jalan.ts`（将来拡張用）
- `src/data/locations.ts`（都道府県マスタ）

## 3. 主要データフロー

1. ユーザーが `SearchForm` で条件を入力
2. `src/app/page.tsx` が URL クエリを更新し、`GET /api/search` を呼び出し
3. `fetchGoraPlans` が楽天 API からプラン取得
4. `normalizeGoraPlans` で共通モデル化
5. `fetchJalanPlans` がデモ用じゃらんデータを合成
6. API で条件フィルタ（予算/昼食付き）とソート（価格/評価）
7. UI で `PlanCard` 一覧表示

## 4. 非機能・運用上のポイント

- 外部 API 失敗時は `RakutenApiError` を通じて HTTP ステータスにマッピング
- 価格カレンダー API はレート制御のため 1.1 秒間隔で逐次取得
- 検索条件は URL クエリに保持され、戻る操作でも復元可能
- じゃらんは現状モック表示であり、実課金・実予約連携ではない

## 5. 既知の制約

- `numberOfPeople` は API レベルで厳密反映していない（将来対応）
- 履歴・お気に入りはエンドポイント枠のみで、DB 永続化未実装
- 外部 API 仕様変更時に `RAKUTEN_ACCESS_KEY` 必須性の再確認が必要
