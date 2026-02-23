"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchForm, type SearchParams } from "@/components/SearchForm";
import { PlanCard } from "@/components/PlanCard";
import type { NormalizedPlan } from "@/types/search";

const SEARCH_PARAMS_STORAGE_KEY = "golf_search_params";

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
    const parsed = JSON.parse(raw) as SearchParams;
    return parsed && parsed.playDate && parsed.areaCode ? parsed : null;
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
  const [restoredParams] = useState<SearchParams | null>(() =>
    typeof window === "undefined" ? null : loadStoredParams()
  );

  const runSearch = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const q = new URLSearchParams({
        playDate: params.playDate,
        areaCode: params.areaCode,
        ...(params.minPrice && { minPrice: params.minPrice }),
        ...(params.maxPrice && { maxPrice: params.maxPrice }),
        ...(params.numberOfPeople && { numberOfPeople: params.numberOfPeople }),
      });
      const res = await fetch(`/api/search?${q.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索に失敗しました");
      setResult(data);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              ゴルフ場 最安値比較
            </h1>
            <span
              className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
              aria-label="ベータ版"
            >
              β版
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            複数サイトの料金をまとめて比較
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <section className="mb-8">
          <SearchForm
            onSearch={handleSearch}
            isLoading={loading}
            initialParams={restoredParams}
          />
        </section>

        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              検索結果（{result.total}件）・総額税込の安い順
            </h2>
            <ul className="grid gap-4 sm:gap-5">
              {result.items.length === 0 ? (
                <li className="rounded-xl border bg-card py-12 text-center text-muted-foreground">
                  該当するプランがありません。日付や予算を変えて再検索してください。
                </li>
              ) : (
                result.items.map((plan) => (
                  <li key={plan.planId}>
                    <PlanCard plan={plan} />
                  </li>
                ))
              )}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t bg-card/50 py-4 text-center text-sm text-muted-foreground">
        楽天GORA・じゃらんの料金を比較表示しています。じゃらんは公式API非公開のためデモ用表示です。予約は各サイトで行ってください。
      </footer>
    </div>
  );
}
