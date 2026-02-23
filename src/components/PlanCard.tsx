"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NormalizedPlan } from "@/types/search";
import { ExternalLinkIcon } from "lucide-react";

interface PlanCardProps {
  plan: NormalizedPlan;
}

const SOURCE_LABEL: Record<NormalizedPlan["source"], string> = {
  gora: "楽天GORA",
  jalan: "じゃらん",
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {plan.imageUrl && (
            <div className="relative w-full sm:w-36 h-36 sm:h-auto sm:min-w-[9rem] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={plan.imageUrl}
                alt={plan.courseName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {plan.prefecture} · {SOURCE_LABEL[plan.source]}
            </p>
            <h3 className="font-semibold text-base leading-tight">
              {plan.courseName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {plan.planName}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
              <span className="text-xl font-bold text-primary">
                ¥{plan.priceTotal.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  税込
                </span>
              </span>
              {plan.reserveUrl && (
                <Button asChild size="sm" variant="outline" className="ml-auto rounded-lg">
                  <a
                    href={plan.reserveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    予約
                    <ExternalLinkIcon className="size-3" />
                  </a>
                </Button>
              )}
              <Button asChild size="sm" variant="secondary" className="rounded-lg">
                <Link href={`/courses/${plan.courseId}`} className="inline-flex items-center gap-1">
                  詳細・カレンダー
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
