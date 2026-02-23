import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => false,
}));

describe("GET /api/favorites", () => {
  it("Cookie がない場合は空配列を返す", async () => {
    const req = new NextRequest("http://localhost/api/favorites");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ items: [] });
  });

  it("Cookie がある場合はお気に入り配列を返す", async () => {
    const items = [
      {
        courseId: "130001",
        courseName: "テストゴルフ",
        addedAt: new Date().toISOString(),
      },
    ];
    const req = new NextRequest("http://localhost/api/favorites", {
      headers: {
        Cookie: `golf_favorites=${encodeURIComponent(JSON.stringify(items))}`,
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].courseId).toBe("130001");
    expect(data.items[0].courseName).toBe("テストゴルフ");
  });
});

describe("POST /api/favorites", () => {
  it("action add で courseId を送ると 200 と Set-Cookie を返す", async () => {
    const req = new NextRequest("http://localhost/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: "130002",
        courseName: "追加コース",
        action: "add",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ ok: true });
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("golf_favorites=");
  });

  it("action remove で courseId を送ると 200 を返す", async () => {
    const items = [
      { courseId: "130003", courseName: "削除対象", addedAt: new Date().toISOString() },
    ];
    const req = new NextRequest("http://localhost/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `golf_favorites=${encodeURIComponent(JSON.stringify(items))}`,
      },
      body: JSON.stringify({ courseId: "130003", action: "remove" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toBeTruthy();
  });

  it("courseId が空の場合は 200 で Cookie を更新しない", async () => {
    const req = new NextRequest("http://localhost/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: "", action: "add" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });
});
