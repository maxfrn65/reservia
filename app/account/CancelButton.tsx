"use client";

import { useState, useTransition } from "react";
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
import { cancelReservationAction } from "./actions";

export default function CancelButton({
  reservationId,
  destinationName,
}: {
  reservationId: string;
  destinationName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await cancelReservationAction(reservationId);
      if (result.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            Annuler
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler la réservation ?</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'annuler votre réservation pour{" "}
            <span className="font-medium">{destinationName}</span>. Les places seront
            remises en vente.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Conserver
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Annulation…" : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
