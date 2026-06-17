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

const STATUSES = ["ALL", "CONFIRMED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  ALL: "Tous",
  CONFIRMED: "Confirmées",
  CANCELLED: "Annulées",
};

export default function ReservationFilters({
  status,
  search,
}: {
  status: Status;
  search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(search);
  const isUserInput = useRef(false);

  function pushQuery(updater: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "reservations");
    updater(params);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  useEffect(() => {
    if (!isUserInput.current) return;
    const timeout = setTimeout(() => {
      pushQuery((p) => {
        if (searchValue.trim()) p.set("search", searchValue.trim());
        else p.delete("search");
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  function onStatusChange(value: string | null) {
    pushQuery((p) => {
      if (!value || value === "ALL") p.delete("status");
      else p.set("status", value);
    });
  }

  function clearAll() {
    setSearchValue("");
    isUserInput.current = false;
    const params = new URLSearchParams();
    params.set("tab", "reservations");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const hasFilters = status !== "ALL" || !!search;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="res-search" className="text-xs">
            Recherche (email, nom, destination)
          </Label>
          <Input
            id="res-search"
            placeholder="user@…, Bali, Test User…"
            value={searchValue}
            onChange={(e) => {
              isUserInput.current = true;
              setSearchValue(e.target.value);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="res-status" className="text-xs">
            Statut
          </Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="res-status" className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:flex sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={clearAll}
            disabled={!hasFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4" />
            Effacer
          </Button>
        </div>
      </div>
    </div>
  );
}
