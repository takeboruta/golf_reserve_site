# 機能設計: 価格カレンダー機能

## 目的

- 特定コースの向こう N 日の最安値を日次で可視化する。

## 対象

- 画面: `src/app/courses/[courseId]/page.tsx`
- API: `src/app/api/courses/[courseId]/calendar/route.ts`

## 入力仕様

- Path: `courseId`（必須, 数値）
- Query: `days`（任意, 1〜30, デフォルト 7）

## 処理フロー

1. 画面ロード時に `days=14` で API 呼び出し
2. API で対象日リスト生成
3. 日ごとに楽天GORAプラン検索
4. 日ごとの最安値を算出
5. 日付と最安値配列を返却

## 出力仕様

```json
{
  "courseId": 12345,
  "days": [
    { "date": "2026-02-24", "minPrice": 9900 },
    { "date": "2026-02-25", "minPrice": null }
  ]
}
```

## 非機能要件

- 楽天 API レート制限対策で 1.1 秒待機を挿入
- 日数増加で応答時間が線形に増加

## エラー方針

- `courseId` 不正: `400`
- 特定日取得失敗: 当該日の `minPrice: null` で継続
- システム失敗: `502`

## 将来拡張

- 並列取得 + レート制御キュー
- キャッシュ（courseId + date）
