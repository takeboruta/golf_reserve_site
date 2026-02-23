# 機能設計: 履歴・お気に入り（Supabase拡張枠）

## 目的

- 将来的に検索履歴とお気に入りを永続化し、再訪時の操作性を向上する。

## 対象

- API: `src/app/api/history/route.ts`
- API: `src/app/api/favorites/route.ts`
- 設定判定: `src/lib/supabase.ts`

## 現状実装

- `isSupabaseConfigured()` が `false` の場合:
  - `GET` は空配列を返却
  - `POST` は `ok: true` を返却（no-op）
- `true` の場合も DB I/O は未実装（TODO）

## インターフェース（現状）

- `GET /api/history` → `{ items: [] }`
- `POST /api/history` → `{ ok: true }`
- `GET /api/favorites` → `{ items: [] }`
- `POST /api/favorites` → `{ ok: true }`

## 実装予定

- Supabase テーブル設計
  - `search_history`
  - `favorites`
- ユーザー識別
  - cookie/session 連携
- API 認可
  - ユーザー単位アクセス制御

## 非機能要件

- 失敗時も検索本体機能に影響を与えない
- 書き込み失敗の監視ログを追加
