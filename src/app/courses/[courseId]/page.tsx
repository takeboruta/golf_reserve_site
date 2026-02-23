"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface CalendarDay {
  date: string;
  minPrice: number | null;
  reserveUrl: string | null;
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

  if (!courseId) return null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
  };

  const mapQuery = courseName
    ? encodeURIComponent(`${courseName} ゴルフ場`)
    : encodeURIComponent(`ゴルフ場 ${courseId}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const embedMapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/" aria-label="検索に戻る">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate">
              {courseName ?? "価格カレンダー"}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <div className="size-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-medium">価格データを取得しています…</p>
            <p className="text-xs">しばらくお待ちください</p>
          </div>
        ) : (
          <>
            {/* コース名・地図・Googleマップ */}
            <Card className="overflow-hidden border-0 shadow-lg shadow-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPinIcon className="size-5 text-primary" />
                  ゴルフ場・地図
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseName && (
                  <p className="font-medium text-foreground">{courseName}</p>
                )}
                <div className="rounded-xl overflow-hidden border bg-muted/30 aspect-video min-h-[200px]">
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
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <MapPinIcon className="size-4" />
                    Googleマップで開く
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* 価格カレンダー */}
            <Card className="overflow-hidden border-0 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="size-5 text-primary" />
                  向こう{days.length}日間の最安値（税込）
                </CardTitle>
                <p className="text-sm text-muted-foreground font-normal">
                  各日から予約ページへ遷移できます
                </p>
              </CardHeader>
              <CardContent>
                {error && (
                  <p className="text-destructive text-sm mb-4">{error}</p>
                )}
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {days.map(({ date, minPrice, reserveUrl }) => (
                    <li key={date}>
                      <div
                        className={`rounded-xl border bg-card p-4 text-center transition shadow-sm hover:shadow-md ${
                          reserveUrl
                            ? "hover:border-primary/50"
                            : "opacity-90"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatDate(date)}
                        </p>
                        <p className="font-semibold text-lg mb-2">
                          {minPrice != null
                            ? `¥${minPrice.toLocaleString()}`
                            : "—"}
                        </p>
                        {reserveUrl ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full text-xs"
                            asChild
                          >
                            <a
                              href={reserveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1"
                            >
                              予約する
                              <ExternalLinkIcon className="size-3" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            予約不可
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  30日分取得するには、
                  <button
                    type="button"
                    onClick={() => courseId && loadCalendar(courseId, 30)}
                    disabled={loading}
                    className="mx-1 underline font-medium text-primary hover:no-underline focus:outline-none focus:underline"
                  >
                    こちらをクリック
                  </button>
                  。取得に時間がかかります。
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
