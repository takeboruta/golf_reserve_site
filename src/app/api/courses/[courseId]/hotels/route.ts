import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const GORA_DETAIL_URL =
  "https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseDetail/20170623";
const TRAVEL_HOTEL_URL =
  "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";

const LOG_PREFIX = "[hotels]";

interface HotelBasicInfo {
  hotelNo?: number;
  hotelName?: string;
  hotelInformationUrl?: string;
  hotelImageUrl?: string;
  reviewAverage?: number;
  reviewCount?: number;
  hotelMinCharge?: number;
  nearestStation?: string;
  address1?: string;
  address2?: string;
}

/** 日本語住所からエリアキーワードを抽出（都道府県 + 市区町村） */
function extractArea(address: string): string {
  if (!address) return "";
  // 都道府県（東京都・北海道・大阪府・京都府・〇〇県）+ 市区町村を抽出
  const m = address.match(
    /^((?:東京都|北海道|(?:大阪|京都)府|.{2,3}県)(?:.{1,6}?[市区町村]))/
  );
  return m?.[1] ?? address.slice(0, 8);
}

/**
 * コースIDからゴルフ場の住所を取得し、周辺ホテルを返す
 * GET /api/courses/[courseId]/hotels
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  void request;

  const appId =
    process.env.RAKUTEN_APPLICATION_ID ?? process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const referer =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!appId || !accessKey) {
    return Response.json(
      { error: "RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が設定されていません" },
      { status: 503 }
    );
  }

  // ── Step 1: GoraGolfCourseDetail でゴルフ場住所を取得 ──
  let area = "";
  try {
    const detailQ = new URLSearchParams({
      applicationId: appId,
      accessKey,
      golfCourseId: courseId,
      format: "json",
      formatVersion: "2",
      ...(affiliateId && { affiliateId }),
    });
    const detailRes = await fetch(`${GORA_DETAIL_URL}?${detailQ}`, {
      headers: { Referer: referer },
    });
    if (detailRes.ok) {
      const d = await detailRes.json();
      // formatVersion=2: フラット / formatVersion=1: Item に入る場合も考慮
      const address: string =
        d?.address ??
        d?.Item?.address ??
        d?.Item?.[0]?.GolfCourseBasicInfo?.[0]?.address ??
        "";
      console.log(LOG_PREFIX, "courseDetail", { courseId, address });
      area = extractArea(address);
    }
  } catch (e) {
    console.warn(LOG_PREFIX, "courseDetail fetch failed", e);
  }

  if (!area) {
    return Response.json(
      { error: "ゴルフ場の位置情報を取得できませんでした" },
      { status: 404 }
    );
  }

  // ── Step 2: 楽天トラベル SimpleHotelSearch でホテルを検索 ──
  const hotelQ = new URLSearchParams({
    applicationId: appId,
    format: "json",
    formatVersion: "2",
    keyword: area,
    hits: "6",
    ...(affiliateId && { affiliateId }),
  });
  console.log(LOG_PREFIX, "hotelSearch", { area });

  try {
    const hotelRes = await fetch(`${TRAVEL_HOTEL_URL}?${hotelQ}`, {
      headers: { Referer: referer },
    });

    if (!hotelRes.ok) {
      const body = await hotelRes.json().catch(() => ({}));
      const msg =
        (body as { error_description?: string }).error_description ??
        `HTTP ${hotelRes.status}`;
      console.error(LOG_PREFIX, "hotelSearch error", { status: hotelRes.status, body });
      return Response.json({ error: msg }, { status: 502 });
    }

    const hotelData = await hotelRes.json();

    // formatVersion=2: hotels は HotelBasicInfo を含むオブジェクト配列
    // formatVersion=1: hotels は [[{hotelBasicInfo:...},...], ...] の二重配列
    type RawHotel = { hotelBasicInfo?: HotelBasicInfo } | HotelBasicInfo[];
    const rawHotels: RawHotel[] = hotelData?.hotels ?? [];

    const hotels = rawHotels
      .map((h) => {
        const info: HotelBasicInfo | undefined = Array.isArray(h)
          ? (h[0] as { hotelBasicInfo?: HotelBasicInfo })?.hotelBasicInfo
          : (h as { hotelBasicInfo?: HotelBasicInfo }).hotelBasicInfo;
        if (!info) return null;
        return {
          hotelNo: info.hotelNo,
          hotelName: info.hotelName,
          hotelUrl: info.hotelInformationUrl,
          imageUrl: info.hotelImageUrl,
          reviewAverage: info.reviewAverage,
          reviewCount: info.reviewCount,
          minCharge: info.hotelMinCharge,
          nearestStation: info.nearestStation,
          address: [info.address1, info.address2].filter(Boolean).join(""),
        };
      })
      .filter(Boolean);

    console.log(LOG_PREFIX, "success", { area, count: hotels.length });
    return Response.json({ courseId, area, hotels });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "ホテル検索に失敗しました";
    console.error(LOG_PREFIX, "exception", { message });
    return Response.json({ error: message }, { status: 502 });
  }
}
