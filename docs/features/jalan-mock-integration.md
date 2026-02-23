# 機能設計: じゃらん表示（デモ連携）

## 目的

- 画面上で複数サイト比較体験を成立させるため、じゃらん表示をデモ提供する。

## 対象

- 実装: `src/lib/jalan-api.ts`
- API: `src/app/api/jalan/plans/route.ts`
- 検索統合: `src/app/api/search/route.ts`

## 現行方針

- じゃらんゴルフ向け公式検索 API が公開されていないため、実 API 連携は未実装。
- `RECRUIT_API_KEY` が未設定時:
  - 楽天GORA結果をベースに `source: jalan` のデモデータを生成。
  - 価格に小さい変動を加え、比較表示を可能にする。

## デモ生成ロジック

- 入力: `NormalizedPlan[]`（GORA結果）
- 最大 15 件まで複製
- 価格変動: `-600`〜`+600` 円
- 最低価格下限: `5000` 円
- `reserveUrl`: `https://golf-jalan.net/`

## 制約

- 実在プランではない
- 実予約導線として使えない
- 精度評価や課金連携対象外

## 将来拡張

- 公式仕様公開後に `fetchJalanPlans` を実 API 実装へ差し替え
- 正規化ルールは `NormalizedPlan` を継続利用
