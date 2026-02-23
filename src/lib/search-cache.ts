/**
 * 検索API用のメモリキャッシュ（TTL付き）
 * サーバーレスではインスタンスごとのため、同一リクエストの短時間の再検索で効果を発揮する
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const store = new Map<string, CacheEntry<unknown>>();

/** 検索パラメータとページからキャッシュキーを生成 */
export function getSearchCacheKey(
  params: {
    playDate: string;
    areaCode?: string;
    keyword?: string;
    minPrice?: string;
    maxPrice?: string;
    lunchOnly?: string;
    sort?: string;
    startTimeZone?: string;
    page?: number;
  },
  page: number
): string {
  const normalized = {
    playDate: params.playDate ?? "",
    areaCode: params.areaCode ?? "",
    keyword: (params.keyword ?? "").trim(),
    minPrice: params.minPrice ?? "",
    maxPrice: params.maxPrice ?? "",
    lunchOnly: params.lunchOnly ?? "0",
    sort: params.sort ?? "price",
    startTimeZone: params.startTimeZone ?? "",
    page: String(page),
  };
  return JSON.stringify(normalized);
}

export function getSearchCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setSearchCache<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  store.set(key, {
    expiresAt: Date.now() + ttlMs,
    data,
  });
}
