# アーキテクチャ一覧

## 1. システム構成

- フロントエンド: Next.js App Router（Client Component 中心）
- API層: Next.js Route Handler（`src/app/api/**`）
- 外部連携: 楽天GORA API、将来のじゃらん公式API（現状はデモ実装）
- データ永続化: Supabase（現状は接続判定のみ。保存処理は TODO）

## 2. レイヤー一覧

### Presentation Layer

- `src/app/page.tsx`
  - 検索条件入力と結果表示のメイン画面
- `src/app/courses/[courseId]/page.tsx`
  - コース別価格カレンダー画面
- `src/components/SearchForm.tsx`
  - 検索フォーム
- `src/components/PlanCard.tsx`
  - プランカード表示
- `src/components/PrefectureCitySelect.tsx`
  - 都道府県複数選択 UI

### API Layer

- `GET /api/search`
  - 楽天GORA取得 + 正規化 + じゃらんデモ合成 + 価格ソート
- `GET /api/gora/plans`
  - 楽天GORAプラン検索の透過 API
- `GET /api/gora/courses`
  - 楽天GORAコース検索の透過 API
- `GET /api/courses/[courseId]/calendar`
  - 日次最安値カレンダー生成
- `GET /api/jalan/plans`
  - じゃらん向けスタブ API
- `GET/POST /api/history`
  - 検索履歴（未実装枠）
- `GET/POST /api/favorites`
  - お気に入り（未実装枠）

### Domain / Integration Layer

- `src/lib/rakuten-api.ts`
  - 楽天GORA API 呼び出し
  - `RAKUTEN_APP_ID` バリデーション
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
2. `src/app/page.tsx` から `GET /api/search` を呼び出し
3. `fetchGoraPlans` が楽天 API からプラン取得
4. `normalizeGoraPlans` で共通モデル化
5. `fetchJalanPlans` がデモ用じゃらんデータを合成
6. API で価格フィルタ・価格昇順ソート
7. UI で `PlanCard` 一覧表示

## 4. 非機能・運用上のポイント

- 外部 API 失敗時は `RakutenApiError` を通じて HTTP ステータスにマッピング
- 価格カレンダー API はレート制御のため 1.1 秒間隔で逐次取得
- 楽天 API 認証は `RAKUTEN_APP_ID` を必須とし、UUID形式誤設定を検出
- じゃらんは現状モック表示であり、実課金・実予約連携ではない

## 5. 既知の制約

- `numberOfPeople` は API レベルで厳密反映していない（将来対応）
- `/api/courses/[courseId]/calendar` と `/api/search` で GORA `Items/items` の参照揺れが残る
- 履歴・お気に入りはエンドポイント枠のみで、DB 永続化未実装
