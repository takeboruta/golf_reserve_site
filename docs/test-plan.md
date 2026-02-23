# テスト計画（2026-02-23 更新）

## 目的

- 既存機能の回帰防止を強化し、API仕様変更時の不具合を早期検知する。

## 対象範囲

- API ルート
  - `src/app/api/search/route.ts`
  - `src/app/api/courses/[courseId]/calendar/route.ts`
  - `src/app/api/history/route.ts`
  - `src/app/api/favorites/route.ts`
- ドメインロジック
  - `src/lib/normalize-gora.ts`
  - `src/lib/cookie-store.ts`

## テスト観点

1. 入力バリデーション
- 必須パラメータ不足時の `400`
- 型不正（例: 日付フォーマット不正、数値でない courseId）の拒否

2. 外部APIエラーのマッピング
- `RakutenApiError` のコード/ステータスに応じたHTTPレスポンス
- 予期しない例外時の `502`

3. 業務ロジック
- 予算・昼食条件のフィルタ
- 価格/評価ソート
- カレンダー最安値算出と日次失敗時の継続
- GORAレスポンス新旧形式の正規化

4. 永続化（Cookie）
- 履歴/お気に入りの読み書き
- 上限件数トリム
- 不正Cookie値の安全な取り扱い

## テスト実装一覧

- 既存
  - `src/lib/cookie-store.test.ts`
  - `src/app/api/history/route.test.ts`
  - `src/app/api/favorites/route.test.ts`
- 追加（今回）
  - `src/app/api/search/route.test.ts`
  - `src/app/api/courses/[courseId]/calendar/route.test.ts`
  - `src/lib/normalize-gora.test.ts`

## 実行手順

1. `npm test`
2. `npm run lint`
3. `npm run build`

## 未カバー（次フェーズ）

- 画面導線のE2E（検索実行、詳細遷移、履歴復元）
- 外部API契約テスト（Rakuten APIレスポンス差分検知）
- `/api/jalan/plans` の将来実API連携ケース
