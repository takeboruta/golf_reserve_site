import { NextRequest } from "next/server";
import { fetchGoraPlans } from "@/lib/rakuten-api";
import { RakutenApiError } from "@/lib/rakuten-api";

export const dynamic = "force-dynamic";

/** 日付 YYYY-MM-DD の簡易チェック */
function isValidPlayDate(s: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playDate = searchParams.get("playDate");
  const areaCode = searchParams.get("areaCode") ?? undefined;
  const golfCourseId = searchParams.get("golfCourseId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const hits = searchParams.get("hits");
  const page = searchParams.get("page");
  const sort = searchParams.get("sort") ?? "price";

  if (!playDate) {
    return Response.json(
      { error: "playDate (YYYY-MM-DD) が必須です" },
      { status: 400 }
    );
  }
  if (!isValidPlayDate(playDate)) {
    return Response.json(
      { error: "playDate は YYYY-MM-DD 形式で指定してください" },
      { status: 400 }
    );
  }
  if (!areaCode && !golfCourseId) {
    return Response.json(
      { error: "areaCode または golfCourseId のいずれかが必要です" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchGoraPlans({
      playDate,
      areaCode: areaCode ?? undefined,
      golfCourseId: golfCourseId ? parseInt(golfCourseId, 10) : undefined,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      hits: hits ? parseInt(hits, 10) : 30,
      page: page ? parseInt(page, 10) : 1,
      sort,
    });
    return Response.json(data);
  } catch (e) {
    if (e instanceof RakutenApiError) {
      const status =
        e.code === "wrong_parameter" || e.code === "invalid_app_id_format"
          ? 400
          : e.code === "not_found"
            ? 404
            : e.code === "too_many_requests"
              ? 429
              : e.status ?? 502;
      return Response.json(
        { error: e.message, code: e.code },
        { status }
      );
    }
    return Response.json(
      { error: "プラン検索に失敗しました" },
      { status: 502 }
    );
  }
}
