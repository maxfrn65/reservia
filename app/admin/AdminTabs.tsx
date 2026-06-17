"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminTabs({ value }: { value: "destinations" | "reservations" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onValueChange(next: string | null) {
    if (!next || next === value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    params.delete("status");
    params.delete("search");
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="destinations">Destinations</TabsTrigger>
        <TabsTrigger value="reservations">Réservations</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
