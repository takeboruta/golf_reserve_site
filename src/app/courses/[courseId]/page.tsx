"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
  SearchIcon,
} from "lucide-react";

interface CalendarDay {
  date: string;
  minPrice: number | null;
  reserveUrl: string | null;
}

/** 日付文字列から曜日インデックスを返す（0=日, 6=土）ローカル時間で処理 */
function getDayOfWeek(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** 日付を MM/DD（曜）形式に整形 */
function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

/** 曜日に応じたスタイル */
function getDayStyle(dow: number) {
  if (dow === 0)
    return {
      card: "border-red-200 bg-red-50/60",
      day: "text-red-500",
    };
  if (dow === 6)
    return {
      card: "border-blue-200 bg-blue-50/60",
      day: "text-blue-500",
    };
  return {
    card: "border-border bg-card",
    day: "text-muted-foreground",
  };
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nearbySearchWord, setNearbySearchWord] = useState("最寄り駅");
  const [nearbySummary, setNearbySummary] = useState<string | null>(null);
  const [nearbyCitations, setNearbyCitations] = useState<{ uri?: string; title?: string }[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  const loadCalendar = useCallback(async (id: string, dayCount: number = 14) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(id)}/calendar?days=${dayCount}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "取得に失敗しました");
      setCourseName(data.courseName ?? null);
      setDays(data.days ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) loadCalendar(courseId);
  }, [courseId, loadCalendar]);

  const loadNearby = useCallback(async () => {
    if (!courseId || !courseName) return;
    const q = nearbySearchWord.trim() || "最寄り駅";
    setNearbyLoading(true);
    setNearbyError(null);
    setNearbySummary(null);
    setNearbyCitations([]);
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseId)}/nearby?courseName=${encodeURIComponent(courseName)}&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索に失敗しました");
      setNearbySummary(data.summary ?? "");
      setNearbyCitations(data.citations ?? []);
    } catch (e) {
      setNearbyError(e instanceof Error ? e.message : "検索に失敗しました");
    } finally {
      setNearbyLoading(false);
    }
  }, [courseId, courseName, nearbySearchWord]);

  if (!courseId) return null;

  const mapQuery = courseName
    ? encodeURIComponent(`${courseName} ゴルフ場`)
    : encodeURIComponent(`ゴルフ場 ${courseId}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const embedMapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 max-w-4xl">
          <Button variant="ghost" size="icon" asChild className="shrink-0 text-muted-foreground hover:text-foreground">
            <Link href="/" aria-label="検索に戻る">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold truncate">
              {courseName ?? "価格カレンダー"}
            </h1>
            {courseName && (
              <p className="text-xs text-muted-foreground">価格カレンダー・周辺情報</p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-5 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
            <div className="size-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium">価格データを取得しています…</p>
              <p className="text-xs mt-1 text-muted-foreground/70">しばらくお待ちください</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── 地図セクション ── */}
            <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPinIcon className="size-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">ゴルフ場・地図</h2>
                  {courseName && (
                    <p className="text-xs text-muted-foreground">{courseName}</p>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-xl overflow-hidden border border-border/40 aspect-video min-h-[200px] bg-muted/20">
                  <iframe
                    title="ゴルフ場の地図"
                    src={embedMapUrl}
                    width="100%"
                    height="100%"
                    className="border-0 w-full h-full min-h-[200px]"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" asChild>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    <MapPinIcon className="size-3.5" />
                    Googleマップで開く
                    <ExternalLinkIcon className="size-3" />
                  </a>
                </Button>
              </div>
            </section>

            {/* ── 周辺検索セクション ── */}
            <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SearchIcon className="size-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">周辺検索</h2>
                  <p className="text-xs text-muted-foreground">
                    最寄り駅・ホテル・飲食店などを AI で検索
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    value={nearbySearchWord}
                    onChange={(e) => setNearbySearchWord(e.target.value)}
                    placeholder="最寄り駅"
                    className="sm:max-w-[240px] rounded-lg"
                    disabled={!courseName}
                    onKeyDown={(e) => e.key === "Enter" && loadNearby()}
                  />
                  <Button
                    onClick={loadNearby}
                    disabled={!courseName || nearbyLoading}
                    size="sm"
                    className="rounded-lg shrink-0"
                  >
                    <SearchIcon className="size-3.5 mr-1.5" />
                    {nearbyLoading ? "検索中…" : "検索する"}
                  </Button>
                </div>

                {nearbyLoading && (
                  <div className="flex items-center gap-3 text-muted-foreground py-2">
                    <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">AI が周辺情報を検索中…</span>
                  </div>
                )}

                {nearbyError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    {nearbyError}
                  </div>
                )}

                {nearbySummary && !nearbyLoading && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm whitespace-pre-line leading-relaxed text-foreground/90">
                      {nearbySummary}
                    </div>
                    {nearbyCitations.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">参考リンク</p>
                        <div className="flex flex-wrap gap-2">
                          {nearbyCitations.map((c, i) =>
                            c.uri ? (
                              <a
                                key={i}
                                href={c.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 transition-colors"
                              >
                                {c.title ?? `リンク${i + 1}`}
                                <ExternalLinkIcon className="size-2.5 shrink-0" />
                              </a>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ── 価格カレンダーセクション ── */}
            <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="size-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">
                      向こう {days.length} 日間の最安値
                    </h2>
                    <p className="text-xs text-muted-foreground">税込・各日から予約ページへ遷移</p>
                  </div>
                </div>
                {/* 凡例 */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-blue-400 inline-block" />
                    土
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-red-400 inline-block" />
                    日
                  </span>
                </div>
              </div>

              <div className="p-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive mb-4">
                    {error}
                  </div>
                )}

                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {days.map(({ date, minPrice, reserveUrl }) => {
                    const dow = getDayOfWeek(date);
                    const style = getDayStyle(dow);
                    return (
                      <li key={date}>
                        <div
                          className={`rounded-xl border p-3.5 text-center transition-all duration-150 ${style.card} ${
                            reserveUrl
                              ? "hover:shadow-md hover:scale-[1.02] cursor-pointer"
                              : "opacity-75"
                          }`}
                        >
                          <p className={`text-xs font-medium mb-1.5 ${style.day}`}>
                            {formatDate(date)}
                          </p>
                          <p className="font-bold text-lg text-foreground mb-2.5 tabular-nums">
                            {minPrice != null
                              ? `¥${minPrice.toLocaleString()}`
                              : "—"}
                          </p>
                          {reserveUrl ? (
                            <a
                              href={reserveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold py-1.5 hover:bg-primary/90 transition-colors"
                            >
                              予約する
                              <ExternalLinkIcon className="size-2.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/70">
                              予約不可
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  30日分を表示するには
                  <button
                    type="button"
                    onClick={() => courseId && loadCalendar(courseId, 30)}
                    disabled={loading}
                    className="mx-1 underline font-medium text-primary hover:no-underline focus:outline-none"
                  >
                    こちら
                  </button>
                  をクリック（取得に時間がかかります）
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
