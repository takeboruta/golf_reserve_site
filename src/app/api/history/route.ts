import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getCookieArray,
  buildSetCookieHeader,
  trimToMax,
} from "@/lib/cookie-store";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "golf_search_history";
const MAX_ITEMS = 20;

export interface HistoryItem {
  playDate: string;
  areaCode: string;
  keyword?: string;
  minPrice?: string;
  maxPrice?: string;
  createdAt: string;
}

function sameCondition(a: HistoryItem, b: HistoryItem): boolean {
  return (
    a.playDate === b.playDate &&
    a.areaCode === b.areaCode &&
    (a.keyword ?? "") === (b.keyword ?? "")
  );
}

/**
 * 検索履歴取得（Supabase 未設定時は Cookie から取得）
 */
export async function GET(request: NextRequest) {
  if (isSupabaseConfigured()) {
    // TODO: Supabase から検索履歴を取得（将来実装）
    return Response.json({ items: [] });
  }

  const items = getCookieArray<HistoryItem>(request, COOKIE_NAME);
  return Response.json({ items });
}

/**
 * 検索履歴保存（Supabase 未設定時は Cookie に保存）
 */
export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    // TODO: Supabase に検索履歴を保存（将来実装）
    return Response.json({ ok: true });
  }

  let body: { playDate?: string; areaCode?: string; keyword?: string; minPrice?: string; maxPrice?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: true });
  }

  const playDate = body.playDate ?? "";
  const areaCode = body.areaCode ?? "";
  if (!playDate || !areaCode) return Response.json({ ok: true });

  const newItem: HistoryItem = {
    playDate,
    areaCode,
    keyword: body.keyword,
    minPrice: body.minPrice,
    maxPrice: body.maxPrice,
    createdAt: new Date().toISOString(),
  };

  const items = getCookieArray<HistoryItem>(request, COOKIE_NAME);
  const filtered = items.filter((item) => !sameCondition(item, newItem));
  const updated = trimToMax([newItem, ...filtered], MAX_ITEMS);

  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", buildSetCookieHeader(COOKIE_NAME, updated));
  return res;
}
