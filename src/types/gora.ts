/**
 * 楽天GORA API 用型定義
 * 参考: https://webservice.rakuten.co.jp/documentation/gora-golf-course-search
 *       https://webservice.rakuten.co.jp/documentation/gora-plan-search
 */

/** 楽天GORA ゴルフ場検索API レスポンス (formatVersion=2) */
export interface GoraGolfCourseSearchResponse {
  count: number;
  page: number;
  first: number;
  last: number;
  hits: number;
  carrier: number;
  pageCount: number;
  items?: GoraGolfCourseItem[];
}

export interface GoraGolfCourseItem {
  golfCourseId: number;
  golfCourseName: string;
  golfCourseAbbr?: string;
  golfCourseNameKana?: string;
  golfCourseCaption?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  highway?: string;
  golfCourseDetailUrl?: string;
  reserveCalUrl?: string;
  ratingUrl?: string;
  golfCourseImageUrl?: string;
  evaluation?: number;
}

/** 楽天GORA プラン検索API レスポンス (formatVersion=2) */
export interface GoraPlanSearchResponse {
  count: number;
  page: number;
  first: number;
  last: number;
  hits: number;
  pageCount: number;
  items?: GoraPlanItem[];
}

export interface GoraPlanItem {
  golfCourseId: number;
  golfCourseName: string;
  golfCourseCaption?: string;
  golfCourseRsvType?: number;
  areaCode?: number;
  prefecture?: string;
  highwayCode?: number;
  highway?: string;
  ic?: string;
  icDistance?: number;
  golfCourseImageUrl?: string;
  displayWeekdayMinPrice?: number;
  displayWeekdayMinBasePrice?: number;
  displayHolidayMinPrice?: number;
  displayHolidayMinBasePrice?: number;
  cancelFeeFlag?: number;
  cancelFee?: string;
  ratingNum?: number;
  evaluation?: number;
  reserveCalUrlPC?: string;
  reserveCalUrlMobile?: string;
  ratingUrlPC?: string;
  ratingUrlMobile?: string;
  plans?: GoraPlanDetail[];
}

export interface GoraPlanDetail {
  planId: number;
  planName: string;
  planType?: number;
  limitedTimeFlag?: number;
  /** プラン料金（総額・税込） */
  price: number;
  basePrice?: number;
  salesTax?: number;
  courseUseTax?: number;
  otherTax?: number;
  playerNumMin?: number;
  playerNumMax?: number;
  startTimeZone?: string;
  round?: number;
  caddie?: number;
  cart?: number;
  lunch?: number;
  [key: string]: unknown;
}

/** API エラーレスポンス */
export interface GoraApiError {
  error: string;
  error_description: string;
}
