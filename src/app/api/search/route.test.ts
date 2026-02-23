import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { fetchGoraPlans, RakutenApiError } from "@/lib/rakuten-api";
import { normalizeGoraPlans } from "@/lib/normalize-gora";
import {
  getSearchCacheKey,
  getSearchCache,
  setSearchCache,
} from "@/lib/search-cache";
import type { NormalizedPlan } from "@/types/search";

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

vi.mock("@/lib/search-cache", () => ({
  getSearchCacheKey: vi.fn((params: Record<string, unknown>, page: number) =>
    JSON.stringify({ ...params, page })
  ),
  getSearchCache: vi.fn(),
  setSearchCache: vi.fn(),
}));

const fetchGoraPlansMock = vi.mocked(fetchGoraPlans);
const normalizeGoraPlansMock = vi.mocked(normalizeGoraPlans);
const getSearchCacheMock = vi.mocked(getSearchCache);
const setSearchCacheMock = vi.mocked(setSearchCache);

function request(url: string) {
  return new NextRequest(url);
}

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSearchCacheMock.mockReturnValue(null);
  });

  it("playDate がない場合は 400", async () => {
    const res = await GET(request("http://localhost/api/search?areaCode=13"));
    expect(res.status).toBe(400);
  });

  it("areaCode がない場合は 400", async () => {
    const res = await GET(
      request("http://localhost/api/search?playDate=2026-02-24")
    );
    expect(res.status).toBe(400);
  });

  it("楽天APIの wrong_parameter は 400 にマッピング", async () => {
    fetchGoraPlansMock.mockRejectedValueOnce(
      new RakutenApiError("bad", "wrong_parameter", 400)
    );

    const res = await GET(
      request("http://localhost/api/search?playDate=2026-02-24&areaCode=13")
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("wrong_parameter");
  });

  it("通常エラーは 502 を返す", async () => {
    fetchGoraPlansMock.mockRejectedValueOnce(new Error("unexpected"));

    const res = await GET(
      request("http://localhost/api/search?playDate=2026-02-24&areaCode=13")
    );
    expect(res.status).toBe(502);
  });

  it("価格と昼食でフィルタし、価格昇順で返す", async () => {
    const plans: NormalizedPlan[] = [
      {
        planId: "a",
        planName: "A",
        priceTotal: 12000,
        courseId: "1",
        courseName: "C1",
        source: "gora",
        playDate: "2026-02-24",
        lunch: true,
      },
      {
        planId: "b",
        planName: "B",
        priceTotal: 8000,
        courseId: "2",
        courseName: "C2",
        source: "gora",
        playDate: "2026-02-24",
        lunch: false,
      },
      {
        planId: "c",
        planName: "C",
        priceTotal: 9000,
        courseId: "3",
        courseName: "C3",
        source: "gora",
        playDate: "2026-02-24",
        lunch: true,
      },
    ];

    fetchGoraPlansMock.mockResolvedValueOnce({ Items: [] });
    normalizeGoraPlansMock.mockReturnValueOnce(plans);

    const res = await GET(
      request(
        "http://localhost/api/search?playDate=2026-02-24&areaCode=13&minPrice=8500&maxPrice=13000&lunchOnly=1"
      )
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.items.map((x: { planId: string }) => x.planId)).toEqual([
      "c",
      "a",
    ]);
  });

  it("sort=evaluation 指定時は評価降順", async () => {
    const plans: NormalizedPlan[] = [
      {
        planId: "low",
        planName: "Low",
        priceTotal: 7000,
        courseId: "1",
        courseName: "C1",
        source: "gora",
        playDate: "2026-02-24",
        evaluation: 3.5,
      },
      {
        planId: "high",
        planName: "High",
        priceTotal: 10000,
        courseId: "2",
        courseName: "C2",
        source: "gora",
        playDate: "2026-02-24",
        evaluation: 4.8,
      },
    ];

    fetchGoraPlansMock.mockResolvedValueOnce({ Items: [] });
    normalizeGoraPlansMock.mockReturnValueOnce(plans);

    const res = await GET(
      request(
        "http://localhost/api/search?playDate=2026-02-24&areaCode=13&sort=evaluation&startTimeZone=99&keyword=%20abc%20"
      )
    );

    const body = await res.json();
    expect(body.items.map((x: { planId: string }) => x.planId)).toEqual([
      "high",
      "low",
    ]);
    expect(fetchGoraPlansMock).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: "abc",
        startTimeZone: undefined,
        sort: "evaluation",
      })
    );
  });

  it("page と perPage を渡すと fetchGoraPlans に渡る", async () => {
    fetchGoraPlansMock.mockResolvedValueOnce({ Items: [], count: 50 });
    normalizeGoraPlansMock.mockReturnValueOnce([]);

    await GET(
      request(
        "http://localhost/api/search?playDate=2026-02-24&areaCode=13&page=2&perPage=15"
      )
    );

    expect(fetchGoraPlansMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        hits: 15,
      })
    );
  });

  it("page/perPage 未指定時はデフォルト 1 と 20", async () => {
    fetchGoraPlansMock.mockResolvedValueOnce({ Items: [], count: 0 });
    normalizeGoraPlansMock.mockReturnValueOnce([]);

    await GET(
      request("http://localhost/api/search?playDate=2026-02-24&areaCode=13")
    );

    expect(fetchGoraPlansMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        hits: 20,
      })
    );
  });

  it("キャッシュヒット時は fetchGoraPlans を呼ばずキャッシュを返す", async () => {
    const cached = {
      playDate: "2026-02-24",
      areaCode: "13",
      total: 100,
      items: [],
      page: 1,
      perPage: 20,
    };
    getSearchCacheMock.mockReturnValueOnce(cached);

    const res = await GET(
      request("http://localhost/api/search?playDate=2026-02-24&areaCode=13")
    );

    expect(fetchGoraPlansMock).not.toHaveBeenCalled();
    expect(setSearchCacheMock).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.total).toBe(100);
    expect(body.items).toEqual([]);
  });

  it("レスポンスに total と page, perPage を含む", async () => {
    fetchGoraPlansMock.mockResolvedValueOnce({
      Items: [],
      count: 45,
    });
    normalizeGoraPlansMock.mockReturnValueOnce([]);

    const res = await GET(
      request(
        "http://localhost/api/search?playDate=2026-02-24&areaCode=13&page=1&perPage=20"
      )
    );

    const body = await res.json();
    expect(body.total).toBe(45);
    expect(body.page).toBe(1);
    expect(body.perPage).toBe(20);
    expect(body.items).toEqual([]);
  });
});
