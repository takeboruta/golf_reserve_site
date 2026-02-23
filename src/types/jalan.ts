/**
 * じゃらんゴルフ API 用型定義（将来の連携用）
 * 現時点ではリクルート側の公式ゴルフ検索APIの公開仕様が不明なため、
 * 正規化後の型（NormalizedPlan）で返すスタブを実装する。
 */

export interface JalanPlanSearchParams {
  playDate: string;
  areaCode?: string;
  minPrice?: number;
  maxPrice?: number;
  numberOfPeople?: number;
}
