import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { ReservationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { UserReservation } from "@/lib/queries/reservations";
import CancelButton from "./CancelButton";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function ReservationCard({ reservation }: { reservation: UserReservation }) {
  const cover = reservation.destination.images[0];
  const cancelled = reservation.status === ReservationStatus.CANCELLED;
  const start = reservation.availability.startDate;
  const upcoming = start.getTime() >= Date.now();
  const canCancel = !cancelled && upcoming;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/destinations/${reservation.destination.id}`}
          className="relative block aspect-[16/9] w-full shrink-0 bg-muted sm:aspect-square sm:w-48"
        >
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? reservation.destination.name}
              fill
              sizes="(min-width: 640px) 12rem, 100vw"
              className="object-cover"
            />
          ) : null}
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Link
                href={`/destinations/${reservation.destination.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {reservation.destination.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {reservation.destination.country}
              </div>
            </div>
            <Badge
              variant={cancelled ? "outline" : "secondary"}
              className={
                cancelled
                  ? "text-muted-foreground"
                  : upcoming
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                    : ""
              }
            >
              {cancelled ? "Annulée" : upcoming ? "À venir" : "Passée"}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>
                {dateFormatter.format(reservation.availability.startDate)} →{" "}
                {dateFormatter.format(reservation.availability.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              {reservation.numberOfPeople} personne
              {reservation.numberOfPeople > 1 ? "s" : ""}
            </div>
            <div className="font-medium">
              Total : {priceFormatter.format(Number(reservation.totalPrice))}
            </div>
          </div>

          {canCancel && (
            <div className="flex justify-end pt-1">
              <CancelButton
                reservationId={reservation.id}
                destinationName={reservation.destination.name}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
