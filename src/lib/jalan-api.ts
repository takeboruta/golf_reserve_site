/**
 * じゃらんゴルフ API 連携（スタブ）
 * リクルートのじゃらんゴルフ向け公式検索APIは現時点で公開仕様が無いため、
 * 共通の正規化型で空配列を返す。将来 RECRUIT_API_KEY 等で実装する想定。
 */

import type { NormalizedPlan } from "@/types/search";

export async function fetchJalanPlans(_params: {
  playDate: string;
  areaCode?: string;
  minPrice?: number;
  maxPrice?: number;
  numberOfPeople?: number;
}): Promise<NormalizedPlan[]> {
  const _key = process.env.RECRUIT_API_KEY;
  // 現時点ではAPI仕様が公開されていないため空配列を返す
  return [];
}
