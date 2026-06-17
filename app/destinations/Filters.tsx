"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_COUNTRIES = "Tous";

export default function DestinationFilters({ countries }: { countries: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const country = searchParams.get("country") ?? ALL_COUNTRIES;

  const hasFilters =
    !!searchParams.get("search") ||
    !!searchParams.get("country") ||
    !!searchParams.get("minPrice") ||
    !!searchParams.get("maxPrice");

  const isUserInput = useRef(false);

  function pushQuery(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  useEffect(() => {
    if (!isUserInput.current) return;
    const timeout = setTimeout(() => {
      pushQuery((p) => {
        if (search.trim()) p.set("search", search.trim());
        else p.delete("search");
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function onCountryChange(value: string | null) {
    pushQuery((p) => {
      if (!value || value === ALL_COUNTRIES) p.delete("country");
      else p.set("country", value);
    });
  }

  function commitPrice(key: "minPrice" | "maxPrice", value: string) {
    pushQuery((p) => {
      if (value && Number(value) >= 0) p.set(key, value);
      else p.delete(key);
    });
  }

  function clearAll() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    isUserInput.current = false;
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div className="space-y-1.5 lg:col-span-4">
          <Label htmlFor="filter-search" className="text-xs">
            Recherche
          </Label>
          <Input
            id="filter-search"
            placeholder="Bali, Lisbonne, Kyoto…"
            value={search}
            onChange={(e) => {
              isUserInput.current = true;
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="space-y-1.5 lg:col-span-3">
          <Label htmlFor="filter-country" className="text-xs">
            Pays
          </Label>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger id="filter-country" className="h-8 w-full m-0">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_COUNTRIES}>Tous</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="filter-min" className="text-xs">
            Prix min €
          </Label>
          <Input
            id="filter-min"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => commitPrice("minPrice", minPrice)}
          />
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="filter-max" className="text-xs">
            Prix max €
          </Label>
          <Input
            id="filter-max"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => commitPrice("maxPrice", maxPrice)}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1 lg:flex lg:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={clearAll}
            disabled={!hasFilters}
            className="w-full lg:w-auto"
          >
            <X className="h-4 w-4" />
            Effacer
          </Button>
        </div>
      </div>
    </div>
  );
}
