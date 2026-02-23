import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * 検索履歴取得（任意: Supabase 連携時のみデータ返却）
 */
export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ items: [] });
  }
  // TODO: Supabase から検索履歴を取得（ユーザー識別は cookie/session 等で実装）
  return Response.json({ items: [] });
}

/**
 * 検索履歴保存（任意: Supabase 連携時のみ保存）
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json({ ok: true });
  }
  await request.json(); // playDate, areaCode 等
  // TODO: Supabase に検索履歴を保存
  return Response.json({ ok: true });
}
