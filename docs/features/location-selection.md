# 機能設計: 都道府県選択UI

## 目的

- 検索条件として都道府県（楽天エリアコード）を複数指定できるようにする。

## 対象

- UI: `src/components/PrefectureCitySelect.tsx`
- マスタ: `src/data/locations.ts`
- 利用元: `src/components/SearchForm.tsx`

## 仕様

- ドロップダウンで未選択都道府県を追加
- タグ表示で選択済みを可視化
- タグの削除ボタンで個別解除
- 出力形式は `string[]`（例: `["13", "14"]`）

## API 受け渡し

- `SearchForm` で `,` 区切りに変換して `areaCode` として送信
- 例: `["13", "14"]` → `"13,14"`

## バリデーション

- 選択 0 件では検索ボタンを無効化
- 重複追加は不可

## 今後の改善案

- 市区町村の絞り込み（`MUNICIPALITIES` の活用）
- 入力補助（検索付きセレクト）
