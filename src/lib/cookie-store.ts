import { NextRequest } from "next/server";

/** Cookie 有効期限: 1年（秒） */
export const COOKIE_MAX_AGE = 31536000;

const COOKIE_OPTS = "Path=/; SameSite=Lax; HttpOnly";

/**
 * リクエストの Cookie から指定名の値を JSON 配列として読み取る
 */
export function getCookieArray<T = unknown>(
  request: NextRequest,
  cookieName: string
): T[] {
  const value = request.cookies.get(cookieName)?.value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * 配列を Cookie 用の Set-Cookie ヘッダー値に変換する
 */
export function buildSetCookieHeader(
  cookieName: string,
  items: unknown[],
  maxAge: number = COOKIE_MAX_AGE
): string {
  const value = encodeURIComponent(JSON.stringify(items));
  return `${cookieName}=${value}; Max-Age=${maxAge}; ${COOKIE_OPTS}`;
}

/**
 * 配列を先頭から最大 maxItems 件に制限（古いものから削除）
 */
export function trimToMax<T>(items: T[], maxItems: number): T[] {
  return items.slice(0, maxItems);
}
