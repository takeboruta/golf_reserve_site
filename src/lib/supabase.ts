/**
 * Supabase クライアント（任意）
 * 環境変数が設定されている場合のみ利用可能。
 * 検索履歴・お気に入り保存用。
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * ブラウザ用 Supabase クライアント取得
 * 未設定時は null（呼び出し側で isSupabaseConfigured() を確認すること）
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  // 実際の実装時: import { createClient } from '@supabase/supabase-js'
  // return createClient(supabaseUrl!, supabaseAnonKey!);
  return null;
}
