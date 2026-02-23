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

export interface SearchParams {
  playDate: string;
  areaCode: string;
  maxPrice: string;
  numberOfPeople: string;
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [playDate, setPlayDate] = useState(tomorrow());
  const [areaCode, setAreaCode] = useState("102");
  const [maxPrice, setMaxPrice] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("4");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      playDate,
      areaCode,
      maxPrice: maxPrice.trim() || "",
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
            <label htmlFor="areaCode" className="text-sm font-medium">
              エリア
            </label>
            <select
              id="areaCode"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            >
              {GORA_AREA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="maxPrice" className="text-sm font-medium">
              予算上限（円）
            </label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="例: 15000"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
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
