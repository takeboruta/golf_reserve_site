import { NextRequest } from "next/server";
import { fetchGoraCourses } from "@/lib/rakuten-api";
import { RakutenApiError } from "@/lib/rakuten-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const areaCode = searchParams.get("areaCode") ?? undefined;
  const keyword = searchParams.get("keyword") ?? undefined;
  const hits = searchParams.get("hits");
  const page = searchParams.get("page");

  if (!areaCode && !keyword) {
    return Response.json(
      { error: "areaCode または keyword のいずれかが必要です" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchGoraCourses({
      areaCode: areaCode ?? undefined,
      keyword: keyword ?? undefined,
      hits: hits ? parseInt(hits, 10) : 30,
      page: page ? parseInt(page, 10) : 1,
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
      { error: "ゴルフ場検索に失敗しました" },
      { status: 502 }
    );
  }
}
