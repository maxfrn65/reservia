import Link from "next/link";
import { ReservationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminReservationRow } from "@/lib/queries/admin";
import ReservationFilters from "./ReservationFilters";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function ReservationsTab({
  reservations,
  status,
  search,
}: {
  reservations: AdminReservationRow[];
  status: ReservationStatus | "ALL";
  search: string;
}) {
  return (
    <div className="space-y-4">
      <ReservationFilters status={status} search={search} />

      <p className="text-sm text-muted-foreground">
        {reservations.length} réservation{reservations.length > 1 ? "s" : ""}
      </p>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Séjour</TableHead>
              <TableHead className="text-right">Pers.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Réservée le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Aucune réservation ne correspond aux filtres.
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.user.name}</div>
                    <div className="text-xs text-muted-foreground">{r.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/destinations/${r.destination.id}`}
                      className="font-medium hover:underline"
                    >
                      {r.destination.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {r.destination.country}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {dateFormatter.format(r.availability.startDate)} →{" "}
                    {dateFormatter.format(r.availability.endDate)}
                  </TableCell>
                  <TableCell className="text-right">{r.numberOfPeople}</TableCell>
                  <TableCell className="text-right font-medium">
                    {priceFormatter.format(Number(r.totalPrice))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === ReservationStatus.CONFIRMED ? "secondary" : "outline"
                      }
                      className={
                        r.status === ReservationStatus.CONFIRMED
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                          : "text-muted-foreground"
                      }
                    >
                      {r.status === ReservationStatus.CONFIRMED ? "Confirmée" : "Annulée"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {dateTimeFormatter.format(r.createdAt)}
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
