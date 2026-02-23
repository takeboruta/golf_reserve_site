import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getCookieArray,
  buildSetCookieHeader,
  trimToMax,
} from "@/lib/cookie-store";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "golf_favorites";
const MAX_ITEMS = 50;

export interface FavoriteItem {
  courseId: string;
  courseName?: string;
  source?: string;
  addedAt: string;
}

/**
 * お気に入り一覧取得（Supabase 未設定時は Cookie から取得）
 */
export async function GET(request: NextRequest) {
  if (isSupabaseConfigured()) {
    // TODO: Supabase からお気に入りコースを取得（将来実装）
    return Response.json({ items: [] });
  }

  const items = getCookieArray<FavoriteItem>(request, COOKIE_NAME);
  return Response.json({ items });
}

/**
 * お気に入り追加・削除（Supabase 未設定時は Cookie に保存）
 */
export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    // TODO: Supabase にお気に入りを保存（将来実装）
    return Response.json({ ok: true });
  }

  let body: {
    courseId?: string;
    courseName?: string;
    source?: string;
    action?: "add" | "remove";
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: true });
  }

  const courseId = body.courseId ?? "";
  const action = body.action ?? "add";
  if (!courseId) return Response.json({ ok: true });

  let items = getCookieArray<FavoriteItem>(request, COOKIE_NAME);

  if (action === "remove") {
    items = items.filter((item) => item.courseId !== courseId);
  } else {
    if (items.some((item) => item.courseId === courseId)) {
      return Response.json({ ok: true });
    }
    const newItem: FavoriteItem = {
      courseId,
      courseName: body.courseName,
      source: body.source,
      addedAt: new Date().toISOString(),
    };
    items = trimToMax([...items, newItem], MAX_ITEMS);
  }

  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", buildSetCookieHeader(COOKIE_NAME, items));
  return res;
}
