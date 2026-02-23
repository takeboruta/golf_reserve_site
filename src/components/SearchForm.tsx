"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefectureCitySelect } from "@/components/PrefectureCitySelect";
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
  /** 復元する検索条件（コース詳細から戻ったときなど） */
  initialParams?: SearchParams | null;
}

export function SearchForm({
  onSearch,
  isLoading = false,
  initialParams,
}: SearchFormProps) {
  const [playDate, setPlayDate] = useState(tomorrow());
  const [prefectureCodes, setPrefectureCodes] = useState<string[]>(["13"]);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [numberOfPeople, setNumberOfPeople] = useState("4");

  useEffect(() => {
    if (!initialParams) return;
    setPlayDate(initialParams.playDate || tomorrow());
    setPrefectureCodes(
      initialParams.areaCode
        ? initialParams.areaCode.split(",").filter(Boolean)
        : ["13"]
    );
    setMinPrice(initialParams.minPrice || DEFAULT_MIN_PRICE);
    setMaxPrice(initialParams.maxPrice || DEFAULT_MAX_PRICE);
    setNumberOfPeople(initialParams.numberOfPeople || "4");
  }, [initialParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prefectureCodes.length === 0) return;
    onSearch({
      playDate,
      areaCode: prefectureCodes.join(","),
      minPrice: minPrice.trim() || DEFAULT_MIN_PRICE,
      maxPrice: maxPrice.trim() || DEFAULT_MAX_PRICE,
      numberOfPeople: numberOfPeople.trim() || "4",
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-lg shadow-primary/5 rounded-2xl overflow-hidden">
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
          <PrefectureCitySelect
            value={prefectureCodes}
            onChange={setPrefectureCodes}
          />
          <div className="grid gap-2">
            <span className="text-sm font-medium">
              プレー料金 ※総額（円）
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="minPrice"
                type="number"
                min={0}
                placeholder="指定なし"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28"
              />
              <span className="text-sm text-muted-foreground">円から</span>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                placeholder="指定なし"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28"
              />
              <span className="text-sm text-muted-foreground">円</span>
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
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || prefectureCodes.length === 0}
          >
            <SearchIcon className="size-4" />
            {isLoading ? "検索中…" : "最安値を検索"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
