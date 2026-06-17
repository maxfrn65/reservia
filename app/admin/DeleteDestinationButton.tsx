"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import { deleteDestinationAction } from "./actions";

export default function DeleteDestinationButton({
  id,
  name,
  reservationCount,
}: {
  id: string;
  name: string;
  reservationCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDestinationAction(id);
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
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer cette destination ?</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{name}</span> sera définitivement supprimée.
            {reservationCount > 0 && (
              <>
                {" "}
                Cette destination compte {reservationCount} réservation
                {reservationCount > 1 ? "s" : ""} — la suppression sera bloquée par la BDD
                si des réservations actives existent.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
