# Documentation Index

このディレクトリは、`golf_reserve_site` の実装ベース設計書です。

## 全体設計

- [アーキテクチャ一覧](./architecture.md)
- [API仕様: 楽天GORA ゴルフ場検索](./api/rakuten-gora-golf-course-search.md)
- [API仕様: 楽天GORA ゴルフ場詳細](./api/rakuten-gora-golf-course-detail.md)
- [API仕様: 楽天GORA プラン検索](./api/rakuten-gora-plan-search.md)

## 機能設計

- [検索・比較機能](./features/search.md)
- [価格カレンダー機能](./features/course-calendar.md)
- [楽天GORA連携](./features/gora-integration.md)
- [じゃらん表示（デモ連携）](./features/jalan-mock-integration.md)
- [都道府県選択UI](./features/location-selection.md)
- [履歴・お気に入り（Supabase拡張枠）](./features/history-favorites.md)

## 開発運用ルール

- [開発品質ルール（テスト・デグレチェック）](./quality-rules.md)
- [テスト計画](./test-plan.md)

## 対象コード

- `src/app`
- `src/components`
- `src/lib`
- `src/types`
- `src/data`
