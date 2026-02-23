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
  keyword: string;
  lunchOnly: string;
  sort: string;
  startTimeZone: string;
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
  const [keyword, setKeyword] = useState("");
  const [lunchOnly, setLunchOnly] = useState(false);
  const [sort, setSort] = useState<"price" | "evaluation">("price");
  const [startTimeZone, setStartTimeZone] = useState<string>("");
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
    setKeyword(initialParams.keyword ?? "");
    setLunchOnly(initialParams.lunchOnly === "1");
    setSort(initialParams.sort === "evaluation" ? "evaluation" : "price");
    const tz = initialParams.startTimeZone ?? "";
    setStartTimeZone(tz === "0" ? "" : /^([4-9]|1[0-5])$/.test(tz) ? tz : "");
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
      keyword: keyword.trim(),
      lunchOnly: lunchOnly ? "1" : "0",
      sort,
      startTimeZone,
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
            <label htmlFor="keyword" className="text-sm font-medium">
              キーワード（ゴルフ場名）
            </label>
            <Input
              id="keyword"
              type="text"
              placeholder="例: 〇〇カントリー"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="lunchOnly"
              type="checkbox"
              checked={lunchOnly}
              onChange={(e) => setLunchOnly(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="lunchOnly" className="text-sm font-medium cursor-pointer">
              昼食付きのみ
            </label>
          </div>
          <div className="grid gap-2">
            <label htmlFor="sort" className="text-sm font-medium">
              並び順
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as "price" | "evaluation")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="price">価格の安い順</option>
              <option value="evaluation">評価が高い順</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="startTimeZone" className="text-sm font-medium">
              開始時間帯
            </label>
            <select
              id="startTimeZone"
              value={startTimeZone}
              onChange={(e) => setStartTimeZone(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">指定しない</option>
              <option value="4">4時台</option>
              <option value="5">5時台</option>
              <option value="6">6時台</option>
              <option value="7">7時台</option>
              <option value="8">8時台</option>
              <option value="9">9時台</option>
              <option value="10">10時台</option>
              <option value="11">11時台</option>
              <option value="12">12時台</option>
              <option value="13">13時台</option>
              <option value="14">14時台</option>
              <option value="15">15時台以降</option>
            </select>
          </div>
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
