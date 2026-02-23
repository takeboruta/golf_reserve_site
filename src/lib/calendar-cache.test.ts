import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCalendarCacheKey,
  getCalendarCache,
  setCalendarCache,
} from "./calendar-cache";

describe("calendar-cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getCalendarCacheKey は courseId と days で一意なキーを返す", () => {
    expect(getCalendarCacheKey("130001", 7)).toBe("calendar:130001:7");
    expect(getCalendarCacheKey("130001", 14)).not.toBe(
      getCalendarCacheKey("130001", 7)
    );
    expect(getCalendarCacheKey("999", 1)).toBe("calendar:999:1");
  });

  it("set したデータを get で取得できる", () => {
    const key = getCalendarCacheKey("130001", 7);
    const data = {
      courseId: 130001,
      courseName: "テスト",
      days: [{ date: "2026-02-24", minPrice: 9000, reserveUrl: null }],
    };
    setCalendarCache(key, data);
    expect(getCalendarCache(key)).toEqual(data);
  });

  it("存在しないキーは null", () => {
    expect(getCalendarCache("calendar:0:1")).toBeNull();
  });

  it("TTL 経過後は null を返す", () => {
    const key = getCalendarCacheKey("1", 1);
    setCalendarCache(key, { courseId: 1, courseName: null, days: [] }, 5000);
    expect(getCalendarCache(key)).not.toBeNull();
    vi.advanceTimersByTime(5001);
    expect(getCalendarCache(key)).toBeNull();
  });
});
