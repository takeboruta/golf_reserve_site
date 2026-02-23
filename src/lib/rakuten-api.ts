/**
 * 楽天GORA API 呼び出しヘルパー
 * 環境変数 RAKUTEN_APP_ID 必須
 */

const GORA_COURSE_SEARCH_URL =
  "https://app.rakuten.co.jp/services/api/Gora/GoraGolfCourseSearch/20170623";
const GORA_PLAN_SEARCH_URL =
  "https://app.rakuten.co.jp/services/api/Gora/GoraPlanSearch/20170623";

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

function getAppId(): string {
  const id = process.env.RAKUTEN_APP_ID;
  if (!id) {
    throw new RakutenApiError(
      "RAKUTEN_APP_ID が設定されていません",
      "missing_app_id"
    );
  }
  return id;
}

/** ゴルフ場検索（エリア・キーワード等） */
export async function fetchGoraCourses(params: {
  areaCode?: string;
  keyword?: string;
  hits?: number;
  page?: number;
}) {
  const appId = getAppId();
  const searchParams = new URLSearchParams({
    applicationId: appId,
    format: "json",
    formatVersion: "2",
    ...(params.areaCode && { areaCode: params.areaCode }),
    ...(params.keyword && { keyword: params.keyword }),
    ...(params.hits && { hits: String(params.hits) }),
    ...(params.page && { page: String(params.page) }),
  });

  const url = `${GORA_COURSE_SEARCH_URL}?${searchParams.toString()}`;
  const res = await fetch(url);

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
  const appId = getAppId();
  const searchParams = new URLSearchParams({
    applicationId: appId,
    format: "json",
    formatVersion: "2",
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
  const res = await fetch(url);

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
