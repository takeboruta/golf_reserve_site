import { NextRequest } from "next/server";
import { fetchJalanPlans } from "@/lib/jalan-api";

export const dynamic = "force-dynamic";

function isValidPlayDate(s: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * じゃらんゴルフ プラン検索API（スタブ）
 * 現時点ではリクルート側の公式API仕様が非公開のため空配列を返す。
 * 環境変数 RECRUIT_API_KEY は将来の連携用に予約。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playDate = searchParams.get("playDate");
  const areaCode = searchParams.get("areaCode") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const numberOfPeople = searchParams.get("numberOfPeople");

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

  const plans = await fetchJalanPlans({
    playDate,
    areaCode,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    numberOfPeople: numberOfPeople ? parseInt(numberOfPeople, 10) : undefined,
  });

  return Response.json({
    source: "jalan",
    playDate,
    count: plans.length,
    items: plans,
  });
}
