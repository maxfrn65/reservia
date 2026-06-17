"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HomeSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (date) params.set("date", date);
    const qs = params.toString();
    router.push(qs ? `/destinations?${qs}` : "/destinations");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl bg-background/95 p-3 text-foreground shadow-2xl backdrop-blur sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="home-search" className="text-xs">
          Destination
        </Label>
        <Input
          id="home-search"
          name="search"
          placeholder="Bali, Lisbonne, Kyoto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-1.5 sm:w-44">
        <Label htmlFor="home-date" className="text-xs">
          Date de départ
        </Label>
        <Input
          id="home-date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="sm:w-auto">
        <Search className="h-4 w-4" />
        Rechercher
      </Button>
    </form>
  );
}
