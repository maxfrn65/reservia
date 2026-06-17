"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createReservationAction, type ReserveState } from "./actions";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function ReserveDialog({
  destinationId,
  destinationName,
  availabilityId,
  startDate,
  endDate,
  spotsLeft,
  basePrice,
}: {
  destinationId: string;
  destinationName: string;
  availabilityId: string;
  startDate: string;
  endDate: string;
  spotsLeft: number;
  basePrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState(1);
  const [state, action, pending] = useActionState<ReserveState, FormData>(
    createReservationAction,
    null,
  );

  useEffect(() => {
    if (open) {
      setPeople(1);
    }
  }, [open]);

  const total = basePrice * people;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button disabled={spotsLeft === 0} className="w-full sm:w-auto">
            {spotsLeft === 0 ? "Complet" : "Réserver"}
          </Button>
        }
      />
      <DialogContent>
        <form action={action} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Réserver — {destinationName}</DialogTitle>
            <DialogDescription>
              Du {dateFormatter.format(new Date(startDate))} au{" "}
              {dateFormatter.format(new Date(endDate))} · {spotsLeft} place
              {spotsLeft > 1 ? "s" : ""} restante{spotsLeft > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="destinationId" value={destinationId} />
          <input type="hidden" name="availabilityId" value={availabilityId} />

          {state?.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="numberOfPeople">Nombre de personnes</Label>
            <Input
              id="numberOfPeople"
              name="numberOfPeople"
              type="number"
              min={1}
              max={spotsLeft}
              value={people}
              onChange={(e) =>
                setPeople(Math.max(1, Math.min(spotsLeft, Number(e.target.value) || 1)))
              }
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
            <div>
              <div className="text-muted-foreground">Prix total</div>
              <div className="text-xs text-muted-foreground">
                {priceFormatter.format(basePrice)} × {people} personne
                {people > 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-xl font-semibold">{priceFormatter.format(total)}</div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Réservation…" : "Confirmer la réservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
