"use client";

import { useState } from "react";
import { SearchForm, type SearchParams } from "@/components/SearchForm";
import { PlanCard } from "@/components/PlanCard";
import type { NormalizedPlan } from "@/types/search";

interface SearchResult {
  playDate: string;
  areaCode: string;
  total: number;
  items: NormalizedPlan[];
}

export default function Home() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold">
            ゴルフ場 最安値比較
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            複数サイトの料金をまとめて比較
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <section className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={loading} />
        </section>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              検索結果（{result.total}件）・総額税込の安い順
            </h2>
            <ul className="grid gap-4 sm:gap-6">
              {result.items.length === 0 ? (
                <li className="text-muted-foreground py-8 text-center">
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

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        楽天GORA・じゃらんの料金を比較表示しています。じゃらんは公式API非公開のためデモ用表示です。予約は各サイトで行ってください。
      </footer>
    </div>
  );
}
