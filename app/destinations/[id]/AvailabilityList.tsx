import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReserveDialog from "./ReserveDialog";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function durationDays(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AvailabilityList({
  destinationId,
  destinationName,
  basePrice,
  availabilities,
  isLoggedIn,
}: {
  destinationId: string;
  destinationName: string;
  basePrice: number;
  availabilities: {
    id: string;
    startDate: Date;
    endDate: Date;
    spotsLeft: number;
  }[];
  isLoggedIn: boolean;
}) {
  if (availabilities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
        Aucune date disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availabilities.map((a) => {
        const nights = durationDays(a.startDate, a.endDate);
        return (
          <Card key={a.id} className="p-0">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  {dateFormatter.format(a.startDate)} → {dateFormatter.format(a.endDate)}
                  <Badge variant="secondary" className="ml-1">
                    {nights} nuit{nights > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {a.spotsLeft > 0
                    ? `${a.spotsLeft} place${a.spotsLeft > 1 ? "s" : ""} restante${a.spotsLeft > 1 ? "s" : ""}`
                    : "Complet"}
                </div>
              </div>

              {isLoggedIn ? (
                <ReserveDialog
                  destinationId={destinationId}
                  destinationName={destinationName}
                  availabilityId={a.id}
                  startDate={a.startDate.toISOString()}
                  endDate={a.endDate.toISOString()}
                  spotsLeft={a.spotsLeft}
                  basePrice={basePrice}
                />
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/destinations/${destinationId}`)}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  Se connecter pour réserver
                </Link>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
