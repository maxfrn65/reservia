import { Suspense } from "react";
import DestinationCard from "@/components/DestinationCard";
import {
  getDistinctCountries,
  listDestinations,
} from "@/lib/queries/destinations";
import { destinationQuerySchema } from "@/lib/schemas";
import DestinationFilters from "./Filters";
import DestinationPagination from "./Pagination";

export const revalidate = 3600;

type SearchParams = Record<string, string | string[] | undefined>;

function flatten(params: SearchParams) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v) && v[0]) out[k] = v[0];
  }
  return out;
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = flatten(await searchParams);
  const filters = destinationQuerySchema.parse(raw);

  const [result, countries] = await Promise.all([
    listDestinations(filters),
    getDistinctCountries(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Toutes les destinations
        </h1>
        <p className="text-muted-foreground">
          Trouvez le séjour qui vous correspond.
        </p>
      </header>

      <div className="mb-8">
        <Suspense>
          <DestinationFilters countries={countries} />
        </Suspense>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {result.total === 0
          ? "Aucune destination ne correspond à votre recherche."
          : `${result.total} destination${result.total > 1 ? "s" : ""} trouvée${result.total > 1 ? "s" : ""}`}
      </p>

      {result.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          Essayez d'élargir vos critères de recherche.
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="mt-10">
          <DestinationPagination
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      )}
    </div>
  );
}
