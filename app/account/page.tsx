import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getMyReservations } from "@/lib/queries/reservations";
import ReservationCard from "./ReservationCard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const reservations = await getMyReservations(user.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mon compte</h1>
        <p className="text-muted-foreground">
          Vos informations personnelles et vos réservations.
        </p>
      </header>

      <Card className="mb-10 p-0">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserIcon className="h-3 w-3" />
              Nom
            </div>
            <div className="font-medium">{user.name}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              Email
            </div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Rôle
            </div>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Mes réservations</h2>
          <span className="text-sm text-muted-foreground">
            {reservations.length} au total
          </span>
        </div>

        {reservations.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="text-muted-foreground">
              Vous n'avez pas encore de réservation.
            </p>
            <Link
              href="/destinations"
              className={buttonVariants({ variant: "default", className: "mt-4" })}
            >
              Découvrir les destinations
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
