/**
 * 検索結果の共通正規化型
 * 楽天GORA・じゃらん等のレスポンスをこの形に揃えてマージ・ソートする
 */

export type PriceSource = "gora" | "jalan";

export interface NormalizedPlan {
  /** プランID（サイト内） */
  planId: string;
  /** プラン名 */
  planName: string;
  /** 総額（税込・利用税込） */
  priceTotal: number;
  /** ゴルフ場ID（サイト内） */
  courseId: string;
  /** ゴルフ場名 */
  courseName: string;
  /** 都道府県など */
  prefecture?: string;
  /** 画像URL */
  imageUrl?: string;
  /** 予約ページURL */
  reserveUrl?: string;
  /** データ取得元 */
  source: PriceSource;
  /** プレー日 YYYY-MM-DD */
  playDate: string;
  /** スタート時間帯（表示用） */
  startTimeZone?: string;
  /** 昼食付き等 */
  lunch?: boolean;
}

export interface NormalizedCourse {
  courseId: string;
  courseName: string;
  prefecture?: string;
  address?: string;
  imageUrl?: string;
  source: PriceSource;
}
