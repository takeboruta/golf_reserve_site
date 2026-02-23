/**
 * 楽天GORA エリアコード（検索API・検索フォーム用）
 * 参考: https://webservice.rakuten.co.jp/documentation/areacode/golfarea
 * エリアは地域グループ配下で複数選択し、APIにはカンマ区切りで送信
 */
export interface AreaOption {
  value: string;
  label: string;
}

/** 地域グループ（親）＋都道府県（子）の階層 */
export interface AreaGroup {
  label: string;
  areas: AreaOption[];
}

export const GORA_AREA_GROUPS: AreaGroup[] = [
  {
    label: "関東・甲信越",
    areas: [
      { value: "102", label: "関東" },
      { value: "8", label: "茨城県" },
      { value: "9", label: "栃木県" },
      { value: "10", label: "群馬県" },
      { value: "11", label: "埼玉県" },
      { value: "12", label: "千葉県" },
      { value: "13", label: "東京都" },
      { value: "14", label: "神奈川県" },
      { value: "19", label: "山梨県" },
      { value: "20", label: "長野県" },
      { value: "22", label: "静岡県" },
    ],
  },
  {
    label: "関西",
    areas: [
      { value: "105", label: "関西" },
      { value: "25", label: "滋賀県" },
      { value: "26", label: "京都府" },
      { value: "27", label: "大阪府" },
      { value: "28", label: "兵庫県" },
      { value: "29", label: "奈良県" },
      { value: "30", label: "和歌山県" },
    ],
  },
];

/** フラット一覧（従来互換） */
export const GORA_AREA_OPTIONS: AreaOption[] = GORA_AREA_GROUPS.flatMap(
  (g) => g.areas
);
