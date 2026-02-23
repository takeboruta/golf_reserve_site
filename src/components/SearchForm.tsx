"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GORA_AREA_OPTIONS } from "@/lib/constants";
import { SearchIcon } from "lucide-react";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const DEFAULT_MIN_PRICE = "10000";
const DEFAULT_MAX_PRICE = "20000";

export interface SearchParams {
  playDate: string;
  areaCode: string;
  minPrice: string;
  maxPrice: string;
  numberOfPeople: string;
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [playDate, setPlayDate] = useState(tomorrow());
  const [areaCodes, setAreaCodes] = useState<string[]>(["102"]);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [numberOfPeople, setNumberOfPeople] = useState("4");

  const toggleArea = (value: string) => {
    setAreaCodes((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const areaCode = areaCodes.length > 0 ? areaCodes.join(",") : "102";
    onSearch({
      playDate,
      areaCode,
      minPrice: minPrice.trim() || DEFAULT_MIN_PRICE,
      maxPrice: maxPrice.trim() || DEFAULT_MAX_PRICE,
      numberOfPeople: numberOfPeople.trim() || "4",
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">条件で検索</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label htmlFor="playDate" className="text-sm font-medium">
              プレー日
            </label>
            <Input
              id="playDate"
              type="date"
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
              min={tomorrow()}
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">エリア（複数選択可）</span>
            <div className="max-h-40 overflow-y-auto rounded-md border border-input p-3 space-y-2 bg-transparent">
              {GORA_AREA_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={areaCodes.includes(opt.value)}
                    onChange={() => toggleArea(opt.value)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="minPrice" className="text-sm font-medium">
                予算下限（円）
              </label>
              <Input
                id="minPrice"
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="maxPrice" className="text-sm font-medium">
                予算上限（円）
              </label>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="numberOfPeople" className="text-sm font-medium">
              人数
            </label>
            <Input
              id="numberOfPeople"
              type="number"
              min={1}
              max={8}
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <SearchIcon className="size-4" />
            {isLoading ? "検索中…" : "最安値を検索"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
