"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { SearchForm, type SearchParams } from "@/components/SearchForm";
import { PlanCard } from "@/components/PlanCard";
import type { NormalizedPlan } from "@/types/search";

const INITIAL_PAGE_SIZE = 10;
const LOAD_MORE_SIZE = 10;

const SEARCH_PARAMS_STORAGE_KEY = "golf_search_params";

interface HistoryItem {
  playDate: string;
  areaCode: string;
  keyword?: string;
  minPrice?: string;
  maxPrice?: string;
  createdAt: string;
}

interface SearchResult {
  playDate: string;
  areaCode: string;
  total: number;
  items: NormalizedPlan[];
}

function loadStoredParams(): SearchParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SEARCH_PARAMS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SearchParams>;
    if (!parsed?.playDate || !parsed?.areaCode) return null;
    return {
      ...parsed,
      playDate: parsed.playDate,
      areaCode: parsed.areaCode,
      keyword: parsed.keyword ?? "",
      lunchOnly: parsed.lunchOnly ?? "0",
      sort: parsed.sort === "evaluation" ? "evaluation" : "price",
      startTimeZone: parsed.startTimeZone ?? "",
      minPrice: parsed.minPrice ?? "10000",
      maxPrice: parsed.maxPrice ?? "20000",
      numberOfPeople: parsed.numberOfPeople ?? "4",
    } as SearchParams;
  } catch {
    return null;
  }
}

function saveStoredParams(params: SearchParams) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SEARCH_PARAMS_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore
  }
}

export default function Home() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [restoredParams] = useState<SearchParams | null>(() =>
    typeof window === "undefined" ? null : loadStoredParams()
  );
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) setHistoryItems(data.items);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const runSearch = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setDisplayCount(INITIAL_PAGE_SIZE);
    try {
      const q = new URLSearchParams({
        playDate: params.playDate,
        areaCode: params.areaCode,
        keyword: params.keyword ?? "",
        lunchOnly: params.lunchOnly === "1" ? "1" : "0",
        sort: params.sort === "evaluation" ? "evaluation" : "price",
        startTimeZone: params.startTimeZone ?? "",
        ...(params.minPrice && { minPrice: params.minPrice }),
        ...(params.maxPrice && { maxPrice: params.maxPrice }),
        ...(params.numberOfPeople && { numberOfPeople: params.numberOfPeople }),
      });
      const res = await fetch(`/api/search?${q.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索に失敗しました");
      setResult(data);
      fetch("/api/history", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playDate: params.playDate,
          areaCode: params.areaCode,
          keyword: params.keyword ?? "",
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
        }),
      }).then(() => loadHistory()).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (restoredParams) runSearch(restoredParams);
  }, [restoredParams, runSearch]);

  const handleSearch = async (params: SearchParams) => {
    saveStoredParams(params);
    await runSearch(params);
  };

  const applyHistoryItem = (item: HistoryItem) => {
    const params: SearchParams = {
      playDate: item.playDate,
      areaCode: item.areaCode,
      keyword: item.keyword ?? "",
      lunchOnly: "0",
      sort: "price",
      startTimeZone: "",
      minPrice: item.minPrice ?? "10000",
      maxPrice: item.maxPrice ?? "20000",
      numberOfPeople: "4",
    };
    saveStoredParams(params);
    runSearch(params);
  };

  useEffect(() => {
    if (!result?.items.length || result.items.length <= INITIAL_PAGE_SIZE) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setDisplayCount((prev) =>
          Math.min(prev + LOAD_MORE_SIZE, result.items.length)
        );
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [result?.items.length]);

  const visibleItems = result?.items.slice(0, displayCount) ?? [];
  const hasMore = result ? displayCount < result.items.length : false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.30 0.14 145) 0%, oklch(0.22 0.10 145) 100%)",
        }}
      >
        {/* 背景装飾 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, oklch(0.70 0.16 145) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.60 0.20 100) 0%, transparent 40%)",
          }}
        />
        <div className="relative container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ⛳ ゴルフ場 最安値比較
            </h1>
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white/90 border border-white/30">
              β版
            </span>
          </div>
          <p className="text-sm sm:text-base text-white/75 mt-1">
            楽天GORAのプランを安い順に表示。最安プランがすぐわかります。
          </p>
          <Link
            href="/favorites"
            className="inline-block mt-3 text-sm text-white/80 hover:text-white underline"
          >
            お気に入り
          </Link>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 max-w-4xl">
        {/* 検索フォーム：ヒーローと重なるように配置 */}
        <div className="-mt-4 mb-8">
          <SearchForm
            onSearch={handleSearch}
            isLoading={loading}
            initialParams={restoredParams}
          />
        </div>

        {historyItems.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              最近の検索
            </h2>
            <ul className="flex flex-wrap gap-2">
              {historyItems.map((item, i) => (
                <li key={`${item.playDate}-${item.areaCode}-${item.keyword ?? ""}-${i}`}>
                  <button
                    type="button"
                    onClick={() => applyHistoryItem(item)}
                    className="rounded-lg border bg-card px-3 py-2 text-left text-sm hover:bg-muted/50 transition"
                  >
                    <span className="text-foreground font-medium">
                      {item.playDate}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {item.areaCode}
                      {item.keyword ? ` · ${item.keyword}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/8 text-destructive px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <section className="space-y-4 pb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground/80">
                検索結果
                <span className="ml-2 text-primary font-bold text-lg">
                  {result.total}件
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  · 総額税込の安い順
                </span>
              </h2>
            </div>
            <ul className="grid gap-4 sm:gap-5">
              {result.items.length === 0 ? (
                <li className="rounded-2xl border bg-card py-14 text-center text-muted-foreground">
                  <p className="text-3xl mb-3">⛳</p>
                  <p className="font-medium">該当するプランがありません</p>
                  <p className="text-sm mt-1">日付や予算を変えて再検索してください</p>
                </li>
              ) : (
                visibleItems.map((plan) => (
                  <li key={plan.planId}>
                    <PlanCard plan={plan} />
                  </li>
                ))
              )}
            </ul>
            {result.items.length > 0 && hasMore && (
              <div
                ref={loadMoreRef}
                className="flex justify-center py-6"
                aria-hidden
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  読み込み中…
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t bg-card/60 py-5 text-center text-xs text-muted-foreground">
        楽天GORAの料金を表示しています。予約は各サイトで行ってください。
      </footer>
    </div>
  );
}
