/**
 * 楽天GORA API 呼び出しヘルパー
 * 環境変数 RAKUTEN_APP_ID（または RAKUTEN_APPLICATION_ID）と RAKUTEN_ACCESS_KEY が必須です。
 * affiliateId がある場合は RAKUTEN_AFFILIATE_ID に設定してください（任意）。
 * ※ 2026-02-10 の API 移行により openapi.rakuten.co.jp に変更。
 */

const GORA_COURSE_SEARCH_URL =
  "https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623";
const GORA_PLAN_SEARCH_URL =
  "https://openapi.rakuten.co.jp/engine/api/Gora/GoraPlanSearch/20170623";

export class RakutenApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = "RakutenApiError";
  }
}

function getRakutenCreds(): { applicationId: string; accessKey?: string; affiliateId?: string; referer: string } {
  const applicationId =
    process.env.RAKUTEN_APPLICATION_ID ?? process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const referer = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!applicationId) {
    throw new RakutenApiError(
      "RAKUTEN_APP_ID（または RAKUTEN_APPLICATION_ID）が設定されていません",
      "missing_app_id"
    );
  }

  return { applicationId, accessKey, affiliateId, referer };
}

/** ゴルフ場検索（エリア・キーワード等） */
export async function fetchGoraCourses(params: {
  areaCode?: string;
  keyword?: string;
  hits?: number;
  page?: number;
}) {
  const { applicationId, accessKey, affiliateId, referer } = getRakutenCreds();
  const searchParams = new URLSearchParams({
    applicationId,
    format: "json",
    formatVersion: "2",
    ...(accessKey && { accessKey }),
    ...(affiliateId && { affiliateId }),
    ...(params.areaCode && { areaCode: params.areaCode }),
    ...(params.keyword && { keyword: params.keyword }),
    ...(params.hits && { hits: String(params.hits) }),
    ...(params.page && { page: String(params.page) }),
  });

  const url = `${GORA_COURSE_SEARCH_URL}?${searchParams.toString()}`;
  const res = await fetch(url, { headers: { Referer: referer } });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new RakutenApiError(
      (body as { error_description?: string }).error_description ??
        `HTTP ${res.status}`,
      (body as { error?: string }).error,
      res.status
    );
  }

  const data = await res.json();
  if ("error" in data) {
    throw new RakutenApiError(
      (data as { error_description?: string }).error_description ?? data.error,
      (data as { error?: string }).error
    );
  }
  return data;
}

/** プラン検索（プレー日・エリア・予算） */
export async function fetchGoraPlans(params: {
  playDate: string;
  areaCode?: string;
  golfCourseId?: number;
  minPrice?: number;
  maxPrice?: number;
  hits?: number;
  page?: number;
  sort?: string;
}) {
  const { applicationId, accessKey, affiliateId, referer } = getRakutenCreds();
  const searchParams = new URLSearchParams({
    applicationId,
    format: "json",
    formatVersion: "2",
    ...(accessKey && { accessKey }),
    ...(affiliateId && { affiliateId }),
    playDate: params.playDate,
    ...(params.areaCode && { areaCode: params.areaCode }),
    ...(params.golfCourseId != null && {
      golfCourseId: String(params.golfCourseId),
    }),
    ...(params.minPrice != null && { minPrice: String(params.minPrice) }),
    ...(params.maxPrice != null && { maxPrice: String(params.maxPrice) }),
    ...(params.hits && { hits: String(params.hits) }),
    ...(params.page && { page: String(params.page) }),
    ...(params.sort && { sort: params.sort }),
  });

  const url = `${GORA_PLAN_SEARCH_URL}?${searchParams.toString()}`;
  const res = await fetch(url, { headers: { Referer: referer, Origin: referer } });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new RakutenApiError(
      (body as { error_description?: string }).error_description ??
        `HTTP ${res.status}`,
      (body as { error?: string }).error,
      res.status
    );
  }

  const data = await res.json();
  if ("error" in data) {
    throw new RakutenApiError(
      (data as { error_description?: string }).error_description ?? data.error,
      (data as { error?: string }).error
    );
  }
  return data;
}
