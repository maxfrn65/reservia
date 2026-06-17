import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminDestinationRow } from "@/lib/queries/admin";
import DeleteDestinationButton from "./DeleteDestinationButton";
import DestinationFormDialog, { type DestinationInitial } from "./DestinationFormDialog";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function toInitial(d: AdminDestinationRow): DestinationInitial {
  return {
    id: d.id,
    name: d.name,
    country: d.country,
    basePrice: Number(d.basePrice),
    shortDescription: d.shortDescription,
    description: d.description,
    images: d.images.map((i) => ({ url: i.url, alt: i.alt })),
    availabilities: d.availabilities.map((a) => ({
      startDate: a.startDate,
      endDate: a.endDate,
      spotsLeft: a.spotsLeft,
    })),
  };
}

export default function DestinationsTab({
  destinations,
}: {
  destinations: AdminDestinationRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {destinations.length} destination{destinations.length > 1 ? "s" : ""}
        </p>
        <DestinationFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          }
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Images</TableHead>
              <TableHead className="text-right">Dispos</TableHead>
              <TableHead className="text-right">Résas</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Aucune destination pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              destinations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.country}</TableCell>
                  <TableCell className="text-right">
                    {priceFormatter.format(Number(d.basePrice))}
                  </TableCell>
                  <TableCell className="text-right">{d.images.length}</TableCell>
                  <TableCell className="text-right">{d.availabilities.length}</TableCell>
                  <TableCell className="text-right">{d._count.reservations}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <DestinationFormDialog
                        initial={toInitial(d)}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteDestinationButton
                        id={d.id}
                        name={d.name}
                        reservationCount={d._count.reservations}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
