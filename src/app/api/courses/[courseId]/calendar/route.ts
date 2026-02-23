import { NextRequest } from "next/server";
import { fetchGoraPlans } from "@/lib/rakuten-api";
import { normalizeGoraPlans, type GoraItem } from "@/lib/normalize-gora";
import { RakutenApiError } from "@/lib/rakuten-api";
import {
  getCalendarCacheKey,
  getCalendarCache,
  setCalendarCache,
} from "@/lib/calendar-cache";

export const dynamic = "force-dynamic";

/**
 * 向こう N 日間の日付リストを生成（YYYY-MM-DD）
 */
function getNextDays(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * 特定ゴルフ場の向こう N 日間の最安値（税込）を返す
 * 楽天GORAのみ対応。days 未指定時は7日（応答速度のため）。30日は ?days=30 で取得可能（要時間）。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days");
  const dayCount = Math.min(
    30,
    Math.max(1, daysParam ? parseInt(daysParam, 10) : 7)
  );

  const courseIdNum = parseInt(courseId, 10);
  if (Number.isNaN(courseIdNum)) {
    return Response.json({ error: "無効なコースIDです" }, { status: 400 });
  }

  const cacheKey = getCalendarCacheKey(courseId, dayCount);
  const cached = getCalendarCache<{
    courseId: number;
    courseName: string | null;
    days: { date: string; minPrice: number | null; reserveUrl: string | null }[];
  }>(cacheKey);
  if (cached) {
    return Response.json(cached);
  }

  const dates = getNextDays(dayCount);
  const results: { date: string; minPrice: number | null; reserveUrl: string | null }[] = [];
  let courseName: string | null = null;

  for (const playDate of dates) {
    try {
      const goraData = await fetchGoraPlans({
        playDate,
        golfCourseId: courseIdNum,
        hits: 30,
        sort: "price",
      });
      const goraItems = (goraData as { Items?: GoraItem[] }).Items;
      const plans = normalizeGoraPlans(goraItems, playDate);
      const minPrice =
        plans.length > 0
          ? Math.min(...plans.map((p) => p.priceTotal))
          : null;
      const cheapest = plans.length > 0
        ? plans.reduce((a, b) => (a.priceTotal <= b.priceTotal ? a : b))
        : null;
      const reserveUrl = cheapest?.reserveUrl ?? null;
      if (plans.length > 0 && !courseName) {
        courseName = plans[0].courseName ?? null;
      }
      results.push({ date: playDate, minPrice, reserveUrl });
    } catch (e) {
      if (e instanceof RakutenApiError) {
        results.push({ date: playDate, minPrice: null, reserveUrl: null });
      } else {
        return Response.json(
          { error: "カレンダー取得に失敗しました" },
          { status: 502 }
        );
      }
    }
    await new Promise((r) => setTimeout(r, 1100));
  }

  const payload = {
    courseId: courseIdNum,
    courseName,
    days: results,
  };
  setCalendarCache(cacheKey, payload);
  return Response.json(payload);
}
