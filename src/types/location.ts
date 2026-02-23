/**
 * 都道府県・市区町村の型定義
 * 都道府県コードは楽天GORAエリアコード（1〜47）に合わせる
 */

/** 都道府県 */
export interface Prefecture {
  /** 楽天GORAエリアコード（1〜47, 0は全地域） */
  code: string;
  /** 都道府県名 */
  name: string;
}

/** 市区町村 */
export interface Municipality {
  /** 市区町村名 */
  name: string;
  /** 所属都道府県のコード（GORAエリアコード） */
  prefectureCode: string;
}

/** 都道府県＋市区町村の選択値（検索条件用） */
export interface AreaSelection {
  /** 都道府県コード（GORA） */
  prefectureCode: string;
  /** 市区町村名（未選択時は空） */
  municipalityName: string;
}
