import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { fetchGoraPlans, RakutenApiError } from "@/lib/rakuten-api";
import { normalizeGoraPlans } from "@/lib/normalize-gora";
import {
  getCalendarCacheKey,
  getCalendarCache,
  setCalendarCache,
} from "@/lib/calendar-cache";
import type { NormalizedPlan } from "@/types/search";

vi.mock("@/lib/calendar-cache", () => ({
  getCalendarCacheKey: vi.fn((courseId: string, days: number) =>
    `calendar:${courseId}:${days}`
  ),
  getCalendarCache: vi.fn(),
  setCalendarCache: vi.fn(),
}));

vi.mock("@/lib/rakuten-api", () => {
  class MockRakutenApiError extends Error {
    constructor(
      message: string,
      public code?: string,
      public status?: number
    ) {
      super(message);
      this.name = "RakutenApiError";
    }
  }

  return {
    fetchGoraPlans: vi.fn(),
    RakutenApiError: MockRakutenApiError,
  };
});

vi.mock("@/lib/normalize-gora", () => ({
  normalizeGoraPlans: vi.fn(),
}));

const fetchGoraPlansMock = vi.mocked(fetchGoraPlans);
const normalizeGoraPlansMock = vi.mocked(normalizeGoraPlans);
const getCalendarCacheMock = vi.mocked(getCalendarCache);

describe("GET /api/courses/[courseId]/calendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCalendarCacheMock.mockReturnValue(null);
    vi.spyOn(global, "setTimeout").mockImplementation((cb: TimerHandler) => {
      if (typeof cb === "function") cb();
      return 0 as unknown as NodeJS.Timeout;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("courseId が数値でない場合は 400", async () => {
    const req = new NextRequest(
      "http://localhost/api/courses/not-number/calendar?days=2"
    );
    const res = await GET(req, { params: Promise.resolve({ courseId: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("days 未指定時は 7 日分を返し、最安値と予約URLを算出する", async () => {
    fetchGoraPlansMock.mockResolvedValue({ Items: [] });
    normalizeGoraPlansMock.mockImplementation((_items, playDate) => {
      const plans: NormalizedPlan[] = [
        {
          planId: `p1-${playDate}`,
          planName: "Plan1",
          priceTotal: 9500,
          courseId: "130001",
          courseName: "テストコース",
          reserveUrl: "https://example.com/high",
          source: "gora",
          playDate,
        },
        {
          planId: `p2-${playDate}`,
          planName: "Plan2",
          priceTotal: 9000,
          courseId: "130001",
          courseName: "テストコース",
          reserveUrl: "https://example.com/cheap",
          source: "gora",
          playDate,
        },
      ];
      return plans;
    });

    const req = new NextRequest("http://localhost/api/courses/130001/calendar");
    const res = await GET(req, {
      params: Promise.resolve({ courseId: "130001" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.courseId).toBe(130001);
    expect(body.courseName).toBe("テストコース");
    expect(body.days).toHaveLength(7);
    expect(body.days[0].minPrice).toBe(9000);
    expect(body.days[0].reserveUrl).toBe("https://example.com/cheap");
  });

  it("楽天APIエラーが出ても当該日を null にして継続する", async () => {
    fetchGoraPlansMock
      .mockRejectedValueOnce(new RakutenApiError("rate limited", "x", 429))
      .mockResolvedValueOnce({ Items: [] });
    normalizeGoraPlansMock.mockReturnValue([
      {
        planId: "ok-1",
        planName: "ok",
        priceTotal: 8800,
        courseId: "130001",
        courseName: "テストコース",
        reserveUrl: "https://example.com/ok",
        source: "gora",
        playDate: "2026-02-24",
      },
    ]);

    const req = new NextRequest(
      "http://localhost/api/courses/130001/calendar?days=2"
    );
    const res = await GET(req, {
      params: Promise.resolve({ courseId: "130001" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.days).toHaveLength(2);
    expect(body.days[0].minPrice).toBeNull();
    expect(body.days[0].reserveUrl).toBeNull();
    expect(body.days[1].minPrice).toBe(8800);
  });

  it("未知エラー時は 502", async () => {
    fetchGoraPlansMock.mockRejectedValueOnce(new Error("boom"));

    const req = new NextRequest(
      "http://localhost/api/courses/130001/calendar?days=1"
    );
    const res = await GET(req, {
      params: Promise.resolve({ courseId: "130001" }),
    });
    expect(res.status).toBe(502);
  });

  it("days は最大 30 に丸める", async () => {
    fetchGoraPlansMock.mockResolvedValue({ Items: [] });
    normalizeGoraPlansMock.mockReturnValue([]);

    const req = new NextRequest(
      "http://localhost/api/courses/130001/calendar?days=99"
    );
    const res = await GET(req, {
      params: Promise.resolve({ courseId: "130001" }),
    });

    expect(res.status).toBe(200);
    expect(fetchGoraPlansMock).toHaveBeenCalledTimes(30);
  });

  it("キャッシュヒット時は fetchGoraPlans を呼ばずキャッシュを返す", async () => {
    const cached = {
      courseId: 130001,
      courseName: "キャッシュコース",
      days: [
        { date: "2026-02-24", minPrice: 8500, reserveUrl: "https://example.com" },
      ],
    };
    getCalendarCacheMock.mockReturnValueOnce(cached);

    const req = new NextRequest(
      "http://localhost/api/courses/130001/calendar?days=7"
    );
    const res = await GET(req, {
      params: Promise.resolve({ courseId: "130001" }),
    });

    expect(fetchGoraPlansMock).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.courseName).toBe("キャッシュコース");
    expect(body.days).toHaveLength(1);
    expect(body.days[0].minPrice).toBe(8500);
  });
});
