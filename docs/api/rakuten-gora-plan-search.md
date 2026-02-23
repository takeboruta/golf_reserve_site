# 楽天GORA プラン検索API仕様（GoraPlanSearch）

- Source: https://webservice.rakuten.co.jp/documentation/gora-plan-search
- Retrieved: 2026-02-23
- API Version (path): `20170623`

## 1. Endpoint

- URL:
  - `https://openapi.rakuten.co.jp/engine/api/Gora/GoraPlanSearch/20170623?format=json&...`
  - `https://openapi.rakuten.co.jp/engine/api/Gora/GoraPlanSearch/20170623?format=xml&...`
- Method: `GET`
- Format: `json` / `xml`（JSONP は `callback` 指定時）

## 2. Authentication

- Required: `applicationId`
- Required: `accessKey`（`Authorization: Bearer {accessKey}` ヘッダー、またはパラメータ）
- Optional: `affiliateId`

## 3. Request Parameters（主要）

### 共通パラメータ

| Name | Required | Type | Description |
|---|---|---|---|
| `applicationId` | Yes | string | 楽天WebサービスのアプリケーションID |
| `accessKey` | Yes | string | アクセスキー |
| `affiliateId` | No | string | 楽天アフィリエイトID |
| `format` | No | string | `json` または `xml`（既定 `json`） |
| `callback` | No | string | JSONP 用関数名 |
| `elements` | No | string | 返却フィールド限定（カンマ区切り） |
| `formatVersion` | No | int | 既定 `1`、`2` で JSON 構造を簡素化 |

### サービス固有パラメータ

| Name | Required | Type | Description |
|---|---|---|---|
| `playDate` | Yes | string | プレー日（`YYYY-MM-DD`、過去日不可） |
| `golfCourseName` | Conditionally required | string | ゴルフ場名（UTF-8 URL encode） |
| `areaCode` | Conditionally required | int / CSV | エリアコード（CSVで複数可） |
| `golfCourseId` | Conditionally required | long / CSV | ゴルフ場ID（CSV最大30件） |
| `hits` | No | int | 1ページ件数（1〜30、既定30） |
| `page` | No | int | ページ番号 |
| `sort` | No | string | 並び順（例: `price`, `evaluation`） |

条件付き必須:

- `golfCourseName` / `areaCode` / `golfCourseId` のいずれか 1 つ以上が必須。

## 4. Response（概要）

- 全体情報: `count`, `page`, `first`, `last`, `hits`, `pageCount`
- ゴルフ場情報:
  - `golfCourseId`, `golfCourseName`, `golfCourseCaption`
  - `areaCode`, `prefecture`, `highway`, `ic`, `icDistance`
  - `golfCourseImageUrl`
- 価格情報:
  - `displayWeekdayMinPrice`, `displayHolidayMinPrice` など
- 在庫・予約導線情報（プラン配下）:
  - `playDate`, `stockStatus`, `stockCount`
  - `reservePageUrlPC`, `reservePageUrlMobile`

## 5. formatVersion の違い

- `formatVersion=1`
  - ネスト構造（`items[0].item.xxx`）
- `formatVersion=2`
  - フラット構造（`items[0].xxx`）

このリポジトリでは `formatVersion=2` を使用する。

## 6. Affiliate URL

- `affiliateId` を指定した場合、予約ページURLはアフィリエイトURLとして返却される。
- PC/mobile どちらの導線でも同様。

## 7. Error Response

| HTTP Status | error | Description |
|---|---|---|
| `400` | `wrong_parameter` | パラメータ不正 / 必須不足 |
| `404` | `not_found` | データなし |
| `429` | `too_many_requests` | レート超過 |
| `500` | `system_error` | 楽天Webサービス内部エラー |
| `503` | `service_unavailable` | メンテナンス / 過負荷 |

例（`applicationId` 不正）:

```json
{
  "error": "wrong_parameter",
  "error_description": "specify valid applicationId"
}
```

## 8. このリポジトリでの利用箇所

- API route: `src/app/api/search/route.ts`
- API route: `src/app/api/gora/plans/route.ts`
- API route: `src/app/api/courses/[courseId]/calendar/route.ts`
- Integration: `src/lib/rakuten-api.ts`
- Normalize: `src/lib/normalize-gora.ts`
- Type: `src/types/gora.ts`

## 9. 実装メモ（現行コードとの差分注意）

- 公式仕様上は `accessKey` が required とされる。
- 現行実装は `applicationId` 中心で動作させているため、将来的に仕様厳密化する場合は `accessKey` の扱いを再確認する。
- `areaCode` は CSV を許容するため、UI の複数都道府県選択との整合が取りやすい。

## 10. 更新方針

楽天公式ドキュメント更新時は本ファイルを更新し、`rakuten-api.ts` と `types/gora.ts` の整合を確認する。
