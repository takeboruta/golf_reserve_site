import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => false,
}));

describe("GET /api/history", () => {
  it("Cookie がない場合は空配列を返す", async () => {
    const req = new NextRequest("http://localhost/api/history");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ items: [] });
  });

  it("Cookie がある場合は履歴配列を返す", async () => {
    const items = [
      {
        playDate: "2026-02-24",
        areaCode: "13",
        createdAt: new Date().toISOString(),
      },
    ];
    const req = new NextRequest("http://localhost/api/history", {
      headers: {
        Cookie: `golf_search_history=${encodeURIComponent(JSON.stringify(items))}`,
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].playDate).toBe("2026-02-24");
    expect(data.items[0].areaCode).toBe("13");
  });
});

describe("POST /api/history", () => {
  it("playDate と areaCode があれば 200 と Set-Cookie を返す", async () => {
    const req = new NextRequest("http://localhost/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playDate: "2026-02-25",
        areaCode: "13",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ ok: true });
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("golf_search_history=");
  });

  it("playDate が空の場合は 200 で Cookie を設定しない", async () => {
    const req = new NextRequest("http://localhost/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playDate: "", areaCode: "13" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });

  it("body が不正 JSON でも 200 を返す", async () => {
    const req = new NextRequest("http://localhost/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
