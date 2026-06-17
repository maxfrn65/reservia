import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDestinationById } from "@/lib/queries/destinations";
import Gallery from "./Gallery";
import AvailabilityList from "./AvailabilityList";

export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [destination, user] = await Promise.all([
    getDestinationById(id),
    getCurrentUser(),
  ]);
  if (!destination) notFound();

  const basePrice = Number(destination.basePrice);

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href="/destinations"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-6 -ml-2" })}
      >
        <ArrowLeft className="h-4 w-4" />
        Toutes les destinations
      </Link>

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {destination.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {destination.country}
          </div>
        </div>
        <Badge variant="secondary" className="self-start sm:self-end">
          dès {priceFormatter.format(basePrice)} / personne
        </Badge>
      </header>

      <div className="mb-10">
        <Gallery images={destination.images} destinationName={destination.name} />
      </div>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">À propos de ce séjour</h2>
        <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
          {destination.description}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Dates disponibles</h2>
        <AvailabilityList
          destinationId={destination.id}
          destinationName={destination.name}
          basePrice={basePrice}
          availabilities={destination.availabilities}
          isLoggedIn={!!user}
        />
      </section>
    </article>
  );
}
