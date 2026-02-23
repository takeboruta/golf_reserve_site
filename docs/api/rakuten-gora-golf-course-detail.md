# 楽天GORA ゴルフ場詳細API仕様（GoraGolfCourseDetail）

- Source: https://webservice.rakuten.co.jp/documentation/gora-golf-course-detail
- Retrieved: 2026-02-23
- API Version (path): `20170623`

## 1. Endpoint

- URL:
  - `https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseDetail/20170623?format=json&...`
  - `https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseDetail/20170623?format=xml&...`
- Method: `GET`
- Format: `json` / `xml`（JSONP は `callback` 指定時）

## 2. Authentication

- Required: `applicationId`
- Required: `accessKey`（ヘッダー `Authorization: Bearer {accessKey}` もしくはパラメータ）
- Optional: `affiliateId`

## 3. Request Parameters（主要）

| Name | Required | Type | Description |
|---|---|---|---|
| `applicationId` | Yes | string | 楽天WebサービスのアプリケーションID |
| `accessKey` | Yes | string | アクセスキー |
| `affiliateId` | No | string | 楽天アフィリエイトID |
| `format` | No | string | `json` または `xml`（既定 `json`） |
| `callback` | No | string | JSONP のコールバック名 |
| `elements` | No | string | 返却フィールド限定（カンマ区切り） |
| `formatVersion` | No | int | 既定 `1`。`2` で JSON 形式を簡素化 |
| `golfCourseId` | No | long | ゴルフ場ID（検索APIの結果に含まれるID） |
| `carrier` | No | int | `0`: PC / `1`: mobile（既定 `0`） |

## 4. Response（概要）

レスポンスには以下カテゴリが含まれる。

- 全体情報（`carrier`）
- ゴルフ場基本情報
  - `golfCourseId`, `golfCourseName`, `golfCourseNameKana`
  - `address`, `telephoneNo`, `faxNo`
  - `highway`, `ic`, `icDistance`
  - `golfCourseImageUrl1`〜`golfCourseImageUrl5`
- 価格情報
  - `weekdayMinPrice`, `baseWeekdayMinPrice`
  - `holidayMinPrice`, `baseHolidayMinPrice`
- コース情報
  - `courseType`, `holeCount`, `parCount`, `courseDistance`
- 評価情報
  - `ratingNum`, `evaluation`, `staff`, `facility`, `meal`, `course`
- URL情報
  - `reserveCalUrl`, `voiceUrl`, `layoutUrl`, `routeMapUrl`
- 追加配列情報
  - 最新プラン（`newPlans`）
  - 口コミ（`ratings`）

## 5. formatVersion の違い

- `formatVersion=1`
  - ネストされた配列構造（例: `items[0].item.field`）
- `formatVersion=2`
  - フラット化された配列構造（例: `items[0].field`）

## 6. Affiliate URL

- `affiliateId` を指定すると、返却される `reserveCalUrl` はアフィリエイトURLになる。
- PC/mobile いずれの `carrier` 指定でも同様に適用される。

## 7. Error Response

| HTTP Status | error | Description |
|---|---|---|
| `400` | `wrong_parameter` | パラメータ不正 / 必須不足 |
| `404` | `not_found` | 該当データなし |

例（`applicationId` 不正）:

```json
{
  "error": "wrong_parameter",
  "error_description": "specify valid applicationId"
}
```

## 8. 実装メモ（このリポジトリ向け）

- 現状コードでは `GoraGolfCourseDetail` は未実装（`/api/gora/courses` は検索APIを利用）。
- 詳細画面強化時に本APIを導入し、コース説明・設備・口コミを拡張表示する。
- 認証方式（`accessKey` 必須）を既存 `rakuten-api.ts` の設計と分離して実装する。

## 9. 更新方針

楽天公式ドキュメント更新時はこのファイルを更新し、実装導入時に型定義と API クライアントを合わせて更新する。
