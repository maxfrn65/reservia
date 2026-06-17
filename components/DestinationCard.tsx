import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DestinationCardData } from "@/lib/queries/destinations";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function DestinationCard({ destination }: { destination: DestinationCardData }) {
  const cover = destination.images[0];

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden p-0">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? destination.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <Badge className="absolute right-3 top-3 backdrop-blur-sm" variant="secondary">
          dès {priceFormatter.format(Number(destination.basePrice))}
        </Badge>
      </div>

      <CardHeader className="px-5 pt-5">
        <CardTitle className="text-lg">{destination.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3" />
          {destination.country}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-5 pt-3 pb-3">
        <p className="line-clamp-2 min-h-[2lh] text-sm text-muted-foreground">
          {destination.shortDescription}
        </p>
      </CardContent>

      <CardFooter className="mt-auto border-0 border-t px-5 p-3">
        <Link
          href={`/destinations/${destination.id}`}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Voir plus
        </Link>
      </CardFooter>
    </Card>
  );
}
