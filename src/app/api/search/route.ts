import { NextRequest } from "next/server";
import { fetchGoraPlans } from "@/lib/rakuten-api";
import { fetchJalanPlans } from "@/lib/jalan-api";
import { normalizeGoraPlans, type GoraItem } from "@/lib/normalize-gora";
import type { NormalizedPlan } from "@/types/search";
import { RakutenApiError } from "@/lib/rakuten-api";

export const dynamic = "force-dynamic";

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
  if (!areaCode) {
    return Response.json(
      { error: "areaCode が必須です" },
      { status: 400 }
    );
  }

  const budgetMax = maxPrice ? parseInt(maxPrice, 10) : undefined;
  const budgetMin = minPrice ? parseInt(minPrice, 10) : undefined;
  const people = numberOfPeople ? parseInt(numberOfPeople, 10) : undefined;

  let allPlans: NormalizedPlan[] = [];

  // 楽天GORA
  try {
    const goraData = await fetchGoraPlans({
      playDate,
      areaCode,
      minPrice: budgetMin,
      maxPrice: budgetMax,
      hits: 30,
      sort: "price",
    });
    const goraItems = (goraData as { Items?: GoraItem[] }).Items;
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

  // じゃらん（公式API非公開のため、GORA結果を流用したデモ用データをマージ）
  const jalanPlans = await fetchJalanPlans(
    {
      playDate,
      areaCode,
      minPrice: budgetMin,
      maxPrice: budgetMax,
      numberOfPeople: people,
    },
    allPlans
  );
  allPlans = allPlans.concat(jalanPlans);

  // 人数フィルタ（GORAの playerNumMin/Max はプラン単位のため、ここでは簡易に予算のみ）
  // 予算で再フィルタ（API側で既に min/max を渡しているが、正規化後の端数で念のため）
  if (budgetMax != null) {
    allPlans = allPlans.filter((p) => p.priceTotal <= budgetMax);
  }
  if (budgetMin != null) {
    allPlans = allPlans.filter((p) => p.priceTotal >= budgetMin);
  }

  // 総額（税込）昇順
  allPlans.sort((a, b) => a.priceTotal - b.priceTotal);

  return Response.json({
    playDate,
    areaCode,
    total: allPlans.length,
    items: allPlans,
  });
}
