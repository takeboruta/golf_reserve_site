import type { GoraPlanItem, GoraPlanDetail } from "@/types/gora";
import type { NormalizedPlan } from "@/types/search";

type PlanInfoItem = {
  planId: number;
  planName?: string;
  price?: number;
  startTimeZone?: string;
  lunch?: number;
  callInfo?: {
    reservePageUrlPC?: string;
    reservePageUrlMobile?: string;
  };
};

/** 楽天GORA プラン検索API 1件 */
export type GoraItem = GoraPlanItem & {
  planInfo?: PlanInfoItem[];
  /** 旧API互換 */
  plans?: GoraPlanDetail[];
  planId?: number;
  planName?: string;
  price?: number;
  startTimeZone?: string;
  lunch?: number;
};

/**
 * 楽天GORA プラン検索APIのレスポンスを共通正規化型に変換
 * 新API: Items[].planInfo[]
 * 旧API: items[].plans[] / items[]がプラン
 */
export function normalizeGoraPlans(
  items: GoraItem[] | undefined,
  playDate: string
): NormalizedPlan[] {
  if (!items || !Array.isArray(items)) return [];

  const result: NormalizedPlan[] = [];

  for (const course of items) {
    const plans: PlanInfoItem[] = course.planInfo ?? (course.plans as PlanInfoItem[] | undefined) ?? [];
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
          reserveUrl:
            p.callInfo?.reservePageUrlPC ??
            p.callInfo?.reservePageUrlMobile ??
            course.reserveCalUrlPC ??
            course.reserveCalUrlMobile,
          source: "gora",
          playDate,
          startTimeZone: p.startTimeZone,
          lunch: p.lunch === 1,
        });
      }
    } else if (course.planId != null && course.price != null) {
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
