import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import {
  COOKIE_MAX_AGE,
  getCookieArray,
  buildSetCookieHeader,
  trimToMax,
} from "./cookie-store";

describe("trimToMax", () => {
  it("指定件数以下はそのまま返す", () => {
    const items = [1, 2, 3];
    expect(trimToMax(items, 5)).toEqual([1, 2, 3]);
  });

  it("指定件数を超えると先頭から maxItems 件に切り詰める", () => {
    const items = [1, 2, 3, 4, 5];
    expect(trimToMax(items, 2)).toEqual([1, 2]);
  });

  it("0 件指定で空配列を返す", () => {
    const items = [1, 2, 3];
    expect(trimToMax(items, 0)).toEqual([]);
  });

  it("空配列はそのまま返す", () => {
    expect(trimToMax([], 10)).toEqual([]);
  });
});

describe("buildSetCookieHeader", () => {
  it("Cookie 名と配列から Set-Cookie 形式の文字列を返す", () => {
    const header = buildSetCookieHeader("test_cookie", [{ a: 1 }]);
    expect(header).toContain("test_cookie=");
    expect(header).toContain("Max-Age=" + COOKIE_MAX_AGE);
    expect(header).toContain("Path=/");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("HttpOnly");
  });

  it("maxAge を指定するとその値が使われる", () => {
    const header = buildSetCookieHeader("x", [], 3600);
    expect(header).toContain("Max-Age=3600");
  });

  it("配列を JSON でエンコードして含める", () => {
    const items = [{ playDate: "2026-02-24", areaCode: "13" }];
    const header = buildSetCookieHeader("golf_search_history", items);
    const valueMatch = header.match(/golf_search_history=([^;]+)/);
    expect(valueMatch).toBeTruthy();
    const decoded = decodeURIComponent(valueMatch![1]);
    expect(JSON.parse(decoded)).toEqual(items);
  });
});

describe("getCookieArray", () => {
  it("Cookie がない場合は空配列を返す", () => {
    const req = new NextRequest("http://localhost/");
    expect(getCookieArray(req, "golf_search_history")).toEqual([]);
  });

  it("Cookie の値を JSON 配列としてパースして返す", () => {
    const items = [{ playDate: "2026-02-24", areaCode: "13" }];
    const cookieValue = encodeURIComponent(JSON.stringify(items));
    const req = new NextRequest("http://localhost/", {
      headers: { Cookie: `golf_search_history=${cookieValue}` },
    });
    expect(getCookieArray(req, "golf_search_history")).toEqual(items);
  });

  it("不正な JSON の場合は空配列を返す", () => {
    const req = new NextRequest("http://localhost/", {
      headers: { Cookie: "golf_search_history=not-json" },
    });
    expect(getCookieArray(req, "golf_search_history")).toEqual([]);
  });

  it("配列でない JSON の場合は空配列を返す", () => {
    const req = new NextRequest("http://localhost/", {
      headers: {
        Cookie: "golf_search_history=" + encodeURIComponent('{"a":1}'),
      },
    });
    expect(getCookieArray(req, "golf_search_history")).toEqual([]);
  });
});
