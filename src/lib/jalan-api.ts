/**
 * じゃらんゴルフ 検索
 * リクルートのじゃらんゴルフ向け公式検索APIは非公開のため、
 * RECRUIT_API_KEY 未設定時は楽天GORA結果を流用したデモ用「じゃらん」データを返します。
 * 同一コースでサイト別の価格差があるように見せる比較用です。
 */

import type { NormalizedPlan } from "@/types/search";

/**
 * 楽天GORAの結果の一部をじゃらん風に複製し、価格を少し変えて返す（デモ用）
 */
function buildMockJalanFromGora(
  goraPlans: NormalizedPlan[],
  playDate: string
): NormalizedPlan[] {
  const maxMock = 15;
  const plans = goraPlans.slice(0, maxMock);
  return plans.map((p, i) => {
    const priceVariation = (i % 5) * 300 - 600;
    const newPrice = Math.max(5000, p.priceTotal + priceVariation);
    return {
      ...p,
      planId: `jalan-${p.courseId}-${i}-${p.planId}`,
      planName: p.planName ? `${p.planName}（じゃらん）` : "じゃらんプラン",
      priceTotal: newPrice,
      source: "jalan" as const,
      playDate,
      reserveUrl: "https://golf-jalan.net/",
    };
  });
}

export async function fetchJalanPlans(
  params: {
    playDate: string;
    areaCode?: string;
    minPrice?: number;
    maxPrice?: number;
    numberOfPeople?: number;
  },
  goraPlansForMock?: NormalizedPlan[]
): Promise<NormalizedPlan[]> {
  const key = process.env.RECRUIT_API_KEY;
  if (key) {
    // 将来リクルート側でゴルフAPIが公開されたらここで実APIを叩く
    return [];
  }
  if (goraPlansForMock && goraPlansForMock.length > 0) {
    return buildMockJalanFromGora(goraPlansForMock, params.playDate);
  }
  return [];
}
