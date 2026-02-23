import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSearchCacheKey,
  getSearchCache,
  setSearchCache,
} from "./search-cache";

describe("search-cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getSearchCacheKey", () => {
    it("同一パラメータ・同一ページなら同じキーになる", () => {
      const params = {
        playDate: "2026-02-24",
        areaCode: "13",
        keyword: "test",
        minPrice: "10000",
        maxPrice: "20000",
        lunchOnly: "1",
        sort: "price",
        startTimeZone: "8",
      };
      expect(getSearchCacheKey(params, 1)).toBe(getSearchCacheKey(params, 1));
    });

    it("ページが違うとキーが異なる", () => {
      const params = {
        playDate: "2026-02-24",
        areaCode: "13",
      };
      expect(getSearchCacheKey(params, 1)).not.toBe(getSearchCacheKey(params, 2));
    });

    it("キーワードの前後空白はトリムされて正規化される", () => {
      const a = getSearchCacheKey(
        { playDate: "2026-02-24", areaCode: "13", keyword: "  abc  " },
        1
      );
      const b = getSearchCacheKey(
        { playDate: "2026-02-24", areaCode: "13", keyword: "abc" },
        1
      );
      expect(a).toBe(b);
    });

    it("未指定は空文字またはデフォルト値でキーに含まれる", () => {
      const key = getSearchCacheKey(
        { playDate: "2026-02-24", areaCode: "13" },
        1
      );
      const parsed = JSON.parse(key);
      expect(parsed.playDate).toBe("2026-02-24");
      expect(parsed.areaCode).toBe("13");
      expect(parsed.keyword).toBe("");
      expect(parsed.sort).toBe("price");
      expect(parsed.page).toBe("1");
    });
  });

  describe("getSearchCache / setSearchCache", () => {
    it("set したデータを get で取得できる", () => {
      const key = getSearchCacheKey(
        { playDate: "2026-02-24", areaCode: "13" },
        1
      );
      const data = { playDate: "2026-02-24", areaCode: "13", total: 10, items: [] };
      setSearchCache(key, data);
      expect(getSearchCache<typeof data>(key)).toEqual(data);
    });

    it("存在しないキーは null", () => {
      expect(getSearchCache("nonexistent")).toBeNull();
    });

    it("TTL 経過後は null を返しエントリは削除される", () => {
      const key = "ttl-test";
      setSearchCache(key, { value: 1 }, 5000);
      expect(getSearchCache(key)).toEqual({ value: 1 });
      vi.advanceTimersByTime(5001);
      expect(getSearchCache(key)).toBeNull();
    });

    it("TTL 内なら取得できる", () => {
      const key = "ttl-ok";
      setSearchCache(key, { value: 2 }, 10000);
      vi.advanceTimersByTime(5000);
      expect(getSearchCache(key)).toEqual({ value: 2 });
    });
  });
});
