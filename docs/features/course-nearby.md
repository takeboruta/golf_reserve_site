# 機能設計: 周辺情報検索（Gemini）

## 目的

- 価格カレンダー画面で、ゴルフ場近くの**最寄り駅**・**ホテル**・**飲食店**を Gemini の Google 検索グラウンディングで調べ、表示する。

## 対象

- 画面: `src/app/courses/[courseId]/page.tsx`（「周辺情報」カード）
- API: `src/app/api/courses/[courseId]/nearby/route.ts`

## 入力仕様

- Path: `courseId`（必須）
- Query: `courseName`（必須）— 検索に使うゴルフ場名（カレンダーAPIで取得した名前を渡す）

## 処理フロー

1. ユーザーが「周辺を調べる」をクリック
2. フロントが `GET /api/courses/:courseId/nearby?courseName=...` を呼び出し
3. API で `@google/genai` の Gemini 2.0 Flash を利用し、`googleSearch` ツールでグラウンディング
4. プロンプトで「最寄り駅」「近くのホテル」「近くの飲食店」を箇条書きで依頼（モデル: gemini-2.5-flash）
5. レスポンスのテキストと `groundingMetadata.groundingChunks`（引用元URL）を返却

## 出力仕様

```json
{
  "courseId": "12345",
  "courseName": "サンプルゴルフクラブ",
  "summary": "## 最寄り駅\n- ○○駅...",
  "citations": [
    { "uri": "https://...", "title": "..." }
  ]
}
```

## 環境変数

- `GEMINI_API_KEY`: Google AI Studio で発行した API キー。未設定時は 503 を返す。

## エラー方針

- `courseName` 未指定: `400`
- `GEMINI_API_KEY` 未設定: `503`
- Gemini API 失敗: `502`
