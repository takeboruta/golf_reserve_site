# 機能設計: 周辺検索（Google Custom Search）

## 目的

- 価格カレンダー画面で、ゴルフ場名＋**検索ワード**により Google 検索結果を表示する。デフォルトは「最寄り駅」、任意でホテル・飲食店など任意ワードを指定可能。

## 対象

- 画面: `src/app/courses/[courseId]/page.tsx`（「周辺検索」カード）
- API: `src/app/api/courses/[courseId]/nearby/route.ts`

## 入力仕様

- Path: `courseId`（必須）
- Query: `courseName`（必須）, `q`（任意・デフォルト「最寄り駅」）
- 実際の検索クエリ: `${courseName} ${q}`

## 処理フロー

1. ユーザーが検索ワード（デフォルト「最寄り駅」）を入力し「検索する」をクリック
2. フロントが `GET /api/courses/:courseId/nearby?courseName=...&q=...` を呼び出し
3. API で Google Custom Search JSON API を呼び出し（1日100クエリ無料）
4. 検索結果のタイトル・スニペット・リンクを整形して返却

## 出力仕様

```json
{
  "courseId": "12345",
  "courseName": "サンプルゴルフクラブ",
  "query": "最寄り駅",
  "fullQuery": "サンプルゴルフクラブ 最寄り駅",
  "summary": "検索: 「...」\n\n1. タイトル\n   スニペット...",
  "citations": [
    { "uri": "https://...", "title": "..." }
  ]
}
```

## 環境変数

- `GOOGLE_CSE_API_KEY`: Google Cloud の API キー（Custom Search JSON API を有効化）
- `GOOGLE_CSE_CX`: Programmable Search Engine で作成した検索エンジンID（ウェブ全体で作成）

## エラー方針

- `courseName` 未指定: `400`
- `GOOGLE_CSE_API_KEY` または `GOOGLE_CSE_CX` 未設定: `503`
- Custom Search API 失敗: `502`
