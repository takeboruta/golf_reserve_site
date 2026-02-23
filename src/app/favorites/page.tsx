"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, HeartIcon } from "lucide-react";

interface FavoriteItem {
  courseId: string;
  courseName?: string;
  source?: string;
  addedAt: string;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 max-w-4xl">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/" aria-label="検索に戻る">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <HeartIcon className="size-5 text-red-500 fill-red-500" />
            お気に入り
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm">読み込み中…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border bg-card py-16 text-center text-muted-foreground">
            <HeartIcon className="size-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">お気に入りはまだありません</p>
            <p className="text-sm mt-1">コース詳細ページでハートをタップして追加できます</p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/">検索へ</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.courseId}>
                <Link
                  href={`/courses/${item.courseId}`}
                  className="flex rounded-xl border bg-card p-4 hover:bg-muted/30 transition"
                >
                  <span className="font-medium truncate">
                    {item.courseName ?? `コース ${item.courseId}`}
                  </span>
                  <span className="ml-2 text-muted-foreground text-sm shrink-0">
                    価格カレンダー →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
