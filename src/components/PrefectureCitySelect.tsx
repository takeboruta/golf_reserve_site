"use client";

import { PREFECTURES } from "@/data/locations";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm";

interface PrefectureSelectProps {
  /** 選択中の都道府県コードの配列（GORAエリアコード） */
  value: string[];
  onChange: (prefectureCodes: string[]) => void;
  className?: string;
}

/** 都道府県を複数選択（ドロップダウンで追加・タグで削除） */
export function PrefectureCitySelect({
  value,
  onChange,
  className,
}: PrefectureSelectProps) {
  const addPrefecture = (code: string) => {
    if (code && !value.includes(code)) {
      onChange([...value, code]);
    }
  };

  const removePrefecture = (code: string) => {
    onChange(value.filter((c) => c !== code));
  };

  const codeToName = (code: string) =>
    PREFECTURES.find((p) => p.code === code)?.name ?? code;
  const unselected = PREFECTURES.filter((p) => !value.includes(p.code));

  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor="prefecture-select" className="text-sm font-medium">
        エリア（都道府県・複数選択可）
      </label>
      <select
        id="prefecture-select"
        value=""
        onChange={(e) => addPrefecture(e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">都道府県を追加</option>
        {unselected.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
            >
              {codeToName(code)}
              <button
                type="button"
                onClick={() => removePrefecture(code)}
                className="rounded hover:bg-muted p-0.5"
                aria-label={`${codeToName(code)}を解除`}
              >
                <XIcon className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
