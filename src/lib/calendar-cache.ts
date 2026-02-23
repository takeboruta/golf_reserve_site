/**
 * 価格カレンダーAPI用のメモリキャッシュ（TTL付き）
 * 同一コース・同一日数で短時間の再取得をキャッシュして GORA 呼び出しを削減する
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10分

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCalendarCacheKey(courseId: string, days: number): string {
  return `calendar:${courseId}:${days}`;
}

export function getCalendarCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCalendarCache<T>(
  key: string,
  data: T,
  ttlMs: number = CACHE_TTL_MS
): void {
  store.set(key, {
    expiresAt: Date.now() + ttlMs,
    data,
  });
}
