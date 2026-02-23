# 機能設計: 履歴・お気に入り（Cookie 永続化）

## 目的

- 検索履歴とお気に入りを同一ブラウザ内で永続化し、再訪時の操作性を向上する。DB を使わず Cookie のみで実装する。

## 対象

- API: `src/app/api/history/route.ts`
- API: `src/app/api/favorites/route.ts`
- 共通: `src/lib/cookie-store.ts`
- 設定判定: `src/lib/supabase.ts`（Supabase 設定時は将来実装枠）

## Cookie 永続化（Supabase 未設定時）

| 項目     | 検索履歴              | お気に入り        |
| -------- | --------------------- | ----------------- |
| Cookie 名 | `golf_search_history` | `golf_favorites`  |
| 件数上限 | 20 件（古いものから削除） | 50 件             |
| 有効期限 | 1 年（Max-Age=31536000） | 1 年              |
| オプション | Path=/; SameSite=Lax; HttpOnly | 同上              |

- Supabase が未設定のときは、上記 Cookie で GET/POST を読み書きする。
- Supabase が設定されているときは、従来どおり GET は空配列・POST は `ok: true` のまま（TODO: 将来 Supabase から取得/保存を実装）。

## データ形

- **検索履歴 1 件**: `{ playDate, areaCode, keyword?, minPrice?, maxPrice?, createdAt }`
- **お気に入り 1 件**: `{ courseId, courseName?, source?, addedAt }`

## インターフェース

- `GET /api/history` → `{ items: HistoryItem[] }`
- `POST /api/history` → body: `{ playDate, areaCode, keyword?, minPrice?, maxPrice? }` → `{ ok: true }`
- `GET /api/favorites` → `{ items: FavoriteItem[] }`
- `POST /api/favorites` → body: `{ courseId, courseName?, source?, action: "add" | "remove" }` → `{ ok: true }`

## UI

- **検索履歴**: トップページに「最近の検索」を表示。クリックで検索条件を復元して再検索。
- **お気に入り**: コース詳細ページのヘッダーにハートボタンで追加/削除。`/favorites` で一覧表示し、コース名クリックでコース詳細へ遷移。

## 非機能要件

- 失敗時も検索本体機能に影響を与えない
- Cookie は同一オリジンのみ送信。デバイス・ブラウザを変えると履歴・お気に入りは共有されない
