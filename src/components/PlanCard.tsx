"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { NormalizedPlan } from "@/types/search";
import { ExternalLinkIcon, StarIcon } from "lucide-react";

interface PlanCardProps {
  plan: NormalizedPlan;
}

const SOURCE_LABEL: Record<NormalizedPlan["source"], string> = {
  gora: "楽天GORA",
  jalan: "じゃらん",
};

const SOURCE_COLOR: Record<NormalizedPlan["source"], string> = {
  gora: "bg-red-50 text-red-600 border-red-200",
  jalan: "bg-orange-50 text-orange-600 border-orange-200",
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {plan.imageUrl && (
          <div className="relative w-full sm:w-40 h-40 sm:h-auto sm:min-w-[10rem] bg-muted overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plan.imageUrl}
              alt={plan.courseName}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-2.5 min-w-0">
          {/* ソース・都道府県 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${SOURCE_COLOR[plan.source]}`}
            >
              {SOURCE_LABEL[plan.source]}
            </span>
            {plan.prefecture && (
              <span className="text-xs text-muted-foreground">{plan.prefecture}</span>
            )}
            {plan.evaluation && plan.evaluation > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 ml-auto">
                <StarIcon className="size-3 fill-amber-400" />
                {plan.evaluation.toFixed(1)}
              </span>
            )}
          </div>

          {/* コース名・プラン名 */}
          <div>
            <h3 className="font-bold text-base leading-snug text-foreground">
              {plan.courseName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {plan.planName}
            </p>
          </div>

          {/* 価格・ボタン */}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
            <div>
              <span className="text-2xl font-extrabold text-primary">
                ¥{plan.priceTotal.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground ml-1">税込</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {plan.reserveUrl && (
                <Button asChild size="sm" className="rounded-lg h-8 text-xs px-3">
                  <a
                    href={plan.reserveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    予約する
                    <ExternalLinkIcon className="size-3" />
                  </a>
                </Button>
              )}
              <Button asChild size="sm" variant="outline" className="rounded-lg h-8 text-xs px-3">
                <Link href={`/courses/${plan.courseId}`}>
                  カレンダー
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
