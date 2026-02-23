# 楽天GORA ゴルフ場検索API仕様（GoraGolfCourseSearch）

- Source: https://webservice.rakuten.co.jp/documentation/gora-golf-course-search
- Retrieved: 2026-02-23
- API Version (path): `20170623`

## 1. Endpoint

- URL: `https://app.rakuten.co.jp/services/api/Gora/GoraGolfCourseSearch/20170623`
- Method: `GET`
- Format: `json`（`formatVersion=2` 推奨）

## 2. Authentication

- Required: `applicationId`
- Optional: `affiliateId`

実装上はサーバー環境変数で管理する。

- `RAKUTEN_APP_ID`（または `RAKUTEN_APPLICATION_ID`）
- `RAKUTEN_AFFILIATE_ID`（任意）

## 3. Request Parameters（主要）

| Name | Required | Type | Description |
|---|---|---|---|
| `applicationId` | Yes | string | 楽天WebサービスのアプリケーションID |
| `affiliateId` | No | string | 楽天アフィリエイトID |
| `format` | No | string | `json` を使用 |
| `formatVersion` | No | number/string | `2` を指定するとフラットなJSON形式 |
| `areaCode` | No | number/string | 地域コード（都道府県コード） |
| `keyword` | No | string | ゴルフ場名などの検索キーワード |
| `hits` | No | number | 1ページあたり件数 |
| `page` | No | number | ページ番号 |

このアプリでは `areaCode` または `keyword` のどちらかを必須として扱う（`/api/gora/courses`）。

## 4. Response（formatVersion=2 の例）

```json
{
  "count": 100,
  "page": 1,
  "first": 1,
  "last": 30,
  "hits": 30,
  "pageCount": 4,
  "items": [
    {
      "golfCourseId": 12345,
      "golfCourseName": "サンプルゴルフクラブ",
      "address": "...",
      "golfCourseImageUrl": "https://..."
    }
  ]
}
```

## 5. 主なレスポンス項目

| Field | Type | Description |
|---|---|---|
| `count` | number | 総件数 |
| `page` | number | 現在ページ |
| `hits` | number | 取得件数 |
| `pageCount` | number | 総ページ数 |
| `items[]` | array | ゴルフ場配列 |
| `items[].golfCourseId` | number | ゴルフ場ID |
| `items[].golfCourseName` | string | ゴルフ場名 |
| `items[].address` | string | 住所 |
| `items[].golfCourseImageUrl` | string | コース画像URL |
| `items[].evaluation` | number | 評価 |

アプリ側の型定義は `src/types/gora.ts` を参照。

## 6. Error Response

エラー時は `error` / `error_description` が返る。

```json
{
  "error": "wrong_parameter",
  "error_description": "specify valid applicationId"
}
```

## 7. このリポジトリでの利用箇所

- API route: `src/app/api/gora/courses/route.ts`
- Integration: `src/lib/rakuten-api.ts`
- Type: `src/types/gora.ts`

## 8. 実装メモ

- `applicationId` は UUID ではなく、楽天Webサービス発行のアプリケーションIDを設定する。
- 外部APIエラーは `RakutenApiError` に変換し、Route層でHTTPステータスにマッピングする。

## 9. 更新方針

楽天公式ドキュメント更新時はこのファイルを更新し、必要なら `src/types/gora.ts` と `src/lib/rakuten-api.ts` の整合を取る。
