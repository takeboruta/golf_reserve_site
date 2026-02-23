import { describe, it, expect } from "vitest";
import { normalizeGoraPlans, type GoraItem } from "./normalize-gora";

describe("normalizeGoraPlans", () => {
  it("items がない場合は空配列", () => {
    expect(normalizeGoraPlans(undefined, "2026-02-24")).toEqual([]);
  });

  it("新API planInfo を正規化できる", () => {
    const items: GoraItem[] = [
      {
        golfCourseId: 130001,
        golfCourseName: "テストコース",
        prefecture: "東京都",
        golfCourseImageUrl: "https://example.com/image.jpg",
        reserveCalUrlPC: "https://example.com/fallback",
        evaluation: 4.2,
        planInfo: [
          {
            planId: 1,
            planName: "早朝プラン",
            price: 9800,
            startTimeZone: "7時台",
            lunch: 1,
            callInfo: {
              reservePageUrlPC: "https://example.com/reserve",
            },
          },
        ],
      } as GoraItem,
    ];

    const result = normalizeGoraPlans(items, "2026-02-24");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      planId: "gora-130001-1",
      planName: "早朝プラン",
      priceTotal: 9800,
      courseId: "130001",
      courseName: "テストコース",
      prefecture: "東京都",
      reserveUrl: "https://example.com/reserve",
      source: "gora",
      playDate: "2026-02-24",
      lunch: true,
      evaluation: 4.2,
    });
  });

  it("旧API互換の単一プランも正規化できる", () => {
    const items: GoraItem[] = [
      {
        golfCourseId: 130002,
        golfCourseName: "互換コース",
        planId: 10,
        planName: "午後スルー",
        price: 12000,
        startTimeZone: "13時台",
        lunch: 0,
        reserveCalUrlMobile: "https://example.com/mobile",
      } as GoraItem,
    ];

    const result = normalizeGoraPlans(items, "2026-03-01");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      planId: "gora-130002-10",
      priceTotal: 12000,
      reserveUrl: "https://example.com/mobile",
      lunch: false,
      playDate: "2026-03-01",
    });
  });
});
