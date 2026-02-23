# 機能設計: 検索・比較機能

## 目的

- プレー日、エリア、予算、人数などの条件で最安値プランを比較表示する。

## 対象

- 画面: `src/app/page.tsx`
- 入力UI: `src/components/SearchForm.tsx`
- 表示UI: `src/components/PlanCard.tsx`
- API: `src/app/api/search/route.ts`

## 入力仕様

- `playDate`（必須, `YYYY-MM-DD`）
- `areaCode`（必須, 複数時はカンマ区切り）
- `keyword`（任意）
- `lunchOnly`（任意, `1` で昼食付きのみ）
- `sort`（任意, `price` / `evaluation`）
- `startTimeZone`（任意, `4`〜`15`）
- `minPrice`（任意）
- `maxPrice`（任意）
- `numberOfPeople`（任意, 現状はじゃらんデモ側入力として利用）

## 処理フロー

1. 画面で検索実行
2. `/api/search` が入力バリデーション
3. 楽天GORAプラン取得（`keyword/lunchOnly/startTimeZone/sort` を反映）
4. 共通型へ正規化
5. じゃらんデモデータ合成
6. 予算・昼食付きで再フィルタ
7. 並び順に応じてソート（価格昇順 or 評価降順）
8. 結果返却

## 出力仕様

```json
{
  "playDate": "2026-02-24",
  "areaCode": "13,14",
  "total": 20,
  "items": [
    {
      "planId": "gora-123-456",
      "priceTotal": 9800,
      "source": "gora",
      "evaluation": 4.2
    }
  ]
}
```

## 例外時の扱い

- 入力不備: `400`
- 楽天 API パラメータエラー: `400`
- その他外部連携失敗: `502`

## 将来拡張

- `numberOfPeople` の厳密反映
- ページング
- API レスポンスキャッシュ
