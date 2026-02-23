"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CalendarIcon } from "lucide-react";

interface CalendarDay {
  date: string;
  minPrice: number | null;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  const loadCalendar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(id)}/calendar?days=14`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "取得に失敗しました");
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold">価格カレンダー</h1>
            <p className="text-sm text-muted-foreground">
              コースID: {courseId}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              向こう14日間の最安値（税込）
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-destructive text-sm mb-4">{error}</p>
            )}
            {loading ? (
              <p className="text-muted-foreground py-8 text-center">
                読み込み中…
              </p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {days.map(({ date, minPrice }) => (
                  <li
                    key={date}
                    className="rounded-lg border p-3 text-center bg-muted/30"
                  >
                    <p className="text-xs text-muted-foreground">
                      {formatDate(date)}
                    </p>
                    <p className="font-semibold mt-1">
                      {minPrice != null
                        ? `¥${minPrice.toLocaleString()}`
                        : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              30日分は
              /api/courses/{courseId}/calendar?days=30
              で取得できます（取得に時間がかかります）。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
