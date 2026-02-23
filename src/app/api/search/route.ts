import { NextRequest } from "next/server";
import { fetchGoraPlans, RakutenApiError } from "@/lib/rakuten-api";
import { normalizeGoraPlans, type GoraItem } from "@/lib/normalize-gora";
import {
  getSearchCacheKey,
  getSearchCache,
  setSearchCache,
} from "@/lib/search-cache";
import type { NormalizedPlan } from "@/types/search";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 30;

function isValidPlayDate(s: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * 検索API: エリア・日付・人数・予算でフィルタし、総額（税込）でソートした結果を返す
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playDate = searchParams.get("playDate");
  const areaCode = searchParams.get("areaCode") ?? undefined;
  const keyword = searchParams.get("keyword") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const numberOfPeople = searchParams.get("numberOfPeople");
  void numberOfPeople; // 将来の複数サイト比較用（現状は未使用）
  const lunchOnly = searchParams.get("lunchOnly");
  const sort = searchParams.get("sort") === "evaluation" ? "evaluation" : "price";
  const startTimeZoneParam = searchParams.get("startTimeZone") ?? "";
  const startTimeZoneNum = startTimeZoneParam === "" ? undefined : parseInt(startTimeZoneParam, 10);
  const startTimeZone =
    typeof startTimeZoneNum === "number" &&
    !Number.isNaN(startTimeZoneNum) &&
    startTimeZoneNum >= 4 &&
    startTimeZoneNum <= 15
      ? startTimeZoneNum
      : undefined;

  const pageParam = searchParams.get("page");
  const page = Math.max(1, parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const perPageParam = searchParams.get("perPage");
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, parseInt(perPageParam ?? String(DEFAULT_PER_PAGE), 10) || DEFAULT_PER_PAGE)
  );

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
  if (!areaCode) {
    return Response.json(
      { error: "areaCode が必須です" },
      { status: 400 }
    );
  }

  const budgetMax = maxPrice ? parseInt(maxPrice, 10) : undefined;
  const budgetMin = minPrice ? parseInt(minPrice, 10) : undefined;
  let allPlans: NormalizedPlan[] = [];
  let totalCount = 0;

  const planLunch = lunchOnly === "1" ? 1 : undefined;

  const cacheKey = getSearchCacheKey(
    {
      playDate,
      areaCode,
      keyword,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      lunchOnly,
      sort,
      startTimeZone: startTimeZoneParam || undefined,
    },
    page
  );

  const cached = getSearchCache<{ playDate: string; areaCode: string; total: number; items: NormalizedPlan[] }>(cacheKey);
  if (cached) {
    return Response.json(cached);
  }

  // 楽天GORA
  try {
    const goraData = await fetchGoraPlans({
      playDate,
      areaCode,
      keyword: keyword?.trim() || undefined,
      minPrice: budgetMin,
      maxPrice: budgetMax,
      planLunch,
      startTimeZone,
      hits: perPage,
      page,
      sort,
    });
    const goraItems = (goraData as { Items?: GoraItem[]; count?: number }).Items;
    totalCount = (goraData as { count?: number }).count ?? 0;
    allPlans = normalizeGoraPlans(goraItems, playDate);
  } catch (e) {
    if (e instanceof RakutenApiError) {
      return Response.json(
        { error: e.message, code: e.code },
        {
          status:
            e.code === "wrong_parameter" || e.code === "invalid_app_id_format"
              ? 400
              : e.status ?? 502,
        }
      );
    }
    return Response.json(
      { error: "検索に失敗しました" },
      { status: 502 }
    );
  }

  // 予算で再フィルタ（API側で既に min/max を渡しているが、正規化後の端数で念のため）
  if (budgetMax != null) {
    allPlans = allPlans.filter((p) => p.priceTotal <= budgetMax);
  }
  if (budgetMin != null) {
    allPlans = allPlans.filter((p) => p.priceTotal >= budgetMin);
  }
  // 昼食付き指定時はマージ結果も昼食付きで統一
  if (planLunch === 1) {
    allPlans = allPlans.filter((p) => p.lunch === true);
  }

  // 並び順: 価格の安い順 or 評価が高い順（GORA がソート済みのため通常はそのまま）
  if (sort === "evaluation") {
    allPlans.sort((a, b) => (b.evaluation ?? 0) - (a.evaluation ?? 0));
  } else {
    allPlans.sort((a, b) => a.priceTotal - b.priceTotal);
  }

  const payload = {
    playDate,
    areaCode,
    total: totalCount > 0 ? totalCount : allPlans.length,
    items: allPlans,
    page,
    perPage,
  };
  setSearchCache(cacheKey, payload);

  return Response.json(payload);
}
