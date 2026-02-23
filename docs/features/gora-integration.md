# 機能設計: 楽天GORA連携

## 目的

- 楽天GORA API からコース・プラン情報を取得し、アプリ内で利用する。

## 対象

- 実装: `src/lib/rakuten-api.ts`
- 型: `src/types/gora.ts`
- 利用 API:
  - `GET /api/gora/courses`
  - `GET /api/gora/plans`
  - `GET /api/search`
  - `GET /api/courses/[courseId]/calendar`

## 認証・設定

- 必須: `RAKUTEN_APP_ID`（または `RAKUTEN_APPLICATION_ID`）
- 任意: `RAKUTEN_AFFILIATE_ID`
- バリデーション:
  - 未設定は `missing_app_id`
  - UUID形式は `invalid_app_id_format`

## プラン検索仕様

- エンドポイント: `GoraPlanSearch/20170623`
- 主なパラメータ:
  - `applicationId`
  - `playDate`
  - `areaCode` または `golfCourseId`
  - `minPrice` / `maxPrice`
  - `hits` / `page` / `sort`

## コース検索仕様

- エンドポイント: `GoraGolfCourseSearch/20170623`
- 主なパラメータ:
  - `applicationId`
  - `areaCode` / `keyword`
  - `hits` / `page`

## エラー処理

- HTTP 非 2xx は `RakutenApiError` に変換
- API レスポンスに `error` が含まれる場合も例外化
- 上位 Route で `400/404/429/502` にマッピング

## 将来拡張

- リトライ制御
- API レスポンスキャッシュ
- ログの構造化（requestId, latency）
