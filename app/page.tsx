import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import HomeSearch from "@/components/HomeSearch";
import { getPopularDestinations } from "@/lib/queries/destinations";

export const revalidate = 3600;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1768590398282-38ef80df2cba?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default async function HomePage() {
  const popular = await getPopularDestinations(4);

  return (
    <>
      <section className="relative isolate -mt-px flex min-h-[560px] items-center overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Paysage de voyage"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

        <div className="mx-auto w-full max-w-6xl px-6 py-20 text-white">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Vos prochaines vacances n'attendent que vous.
            </h1>
            <p className="text-lg text-white/85">
              Réservez votre prochain séjour parmi des destinations soigneusement sélectionnées.
            </p>
          </div>

          <div className="mt-10">
            <HomeSearch />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">Destinations populaires</h2>
            <p className="text-muted-foreground">
              Les séjours les plus réservés ces derniers temps.
            </p>
          </div>
          <Link
            href="/destinations"
            className={buttonVariants({ variant: "ghost", className: "hidden sm:inline-flex" })}
          >
            Toutes les destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link href="/destinations" className={buttonVariants({ variant: "outline" })}>
            Voir toutes les destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
