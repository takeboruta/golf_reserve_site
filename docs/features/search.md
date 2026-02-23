# 機能設計: 検索・比較機能

## 目的

- プレー日、エリア、予算、人数を条件に最安値プランを一覧表示する。

## 対象

- 画面: `src/app/page.tsx`
- 入力UI: `src/components/SearchForm.tsx`
- 表示UI: `src/components/PlanCard.tsx`
- API: `src/app/api/search/route.ts`

## 入力仕様

- `playDate`（必須, `YYYY-MM-DD`）
- `areaCode`（必須, 複数時はカンマ区切り）
- `minPrice`（任意）
- `maxPrice`（任意）
- `numberOfPeople`（任意, 現状は参照のみ）

## 処理フロー

1. 画面で検索実行
2. `/api/search` が入力バリデーション
3. 楽天GORAプラン取得
4. 共通型へ正規化
5. じゃらんデモデータ合成
6. 予算フィルタ
7. 総額（税込）昇順ソート
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
      "source": "gora"
    }
  ]
}
```

## 例外時の扱い

- 入力不備: `400`
- 楽天 API パラメータエラー: `400`
- その他外部連携失敗: `502`

## 将来拡張

- 人数条件の厳密反映
- ページング
- 並び替え条件追加（例: スタート時間、評価）
