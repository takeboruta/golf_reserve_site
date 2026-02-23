import type { GoraPlanItem, GoraPlanDetail } from "@/types/gora";
import type { NormalizedPlan } from "@/types/search";

/** 楽天GORA プラン検索API 1件（ネスト/フラット両対応） */
export type GoraItem = GoraPlanItem & {
  plans?: GoraPlanDetail[];
  planId?: number;
  planName?: string;
  price?: number;
  startTimeZone?: string;
  lunch?: number;
};

/**
 * 楽天GORA プラン検索APIのレスポンスを共通正規化型に変換
 * ネスト形式（items[].plans[]）とフラット形式（items[]がプラン）の両方に対応
 */
export function normalizeGoraPlans(
  items: GoraItem[] | undefined,
  playDate: string
): NormalizedPlan[] {
  if (!items || !Array.isArray(items)) return [];

  const result: NormalizedPlan[] = [];

  for (const course of items) {
    const plans = course.plans ?? [];
    if (plans.length > 0) {
      for (const p of plans) {
        result.push({
          planId: `gora-${course.golfCourseId}-${p.planId}`,
          planName: p.planName ?? "",
          priceTotal: p.price ?? 0,
          courseId: String(course.golfCourseId),
          courseName: course.golfCourseName ?? "",
          prefecture: course.prefecture,
          imageUrl: course.golfCourseImageUrl,
          reserveUrl: course.reserveCalUrlPC ?? course.reserveCalUrlMobile,
          source: "gora",
          playDate,
          startTimeZone: p.startTimeZone,
          lunch: p.lunch === 1,
        });
      }
    } else if (
      course.planId != null &&
      course.price != null
    ) {
      result.push({
        planId: `gora-${course.golfCourseId}-${course.planId}`,
        planName: (course.planName as string) ?? "",
        priceTotal: course.price,
        courseId: String(course.golfCourseId),
        courseName: course.golfCourseName ?? "",
        prefecture: course.prefecture,
        imageUrl: course.golfCourseImageUrl,
        reserveUrl: course.reserveCalUrlPC ?? course.reserveCalUrlMobile,
        source: "gora",
        playDate,
        startTimeZone: course.startTimeZone,
        lunch: course.lunch === 1,
      });
    }
  }

  return result;
}
