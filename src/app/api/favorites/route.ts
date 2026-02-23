import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * お気に入り一覧取得（任意: Supabase 連携時のみデータ返却）
 */
export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ items: [] });
  }
  // TODO: Supabase からお気に入りコースを取得
  return Response.json({ items: [] });
}

/**
 * お気に入り追加・削除（任意: Supabase 連携時のみ保存）
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ ok: true });
  }
  await request.json(); // courseId, source 等
  // TODO: Supabase にお気に入りを保存
  return Response.json({ ok: true });
}
