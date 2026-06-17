import { ReservationStatus } from "@prisma/client";
import {
  listAllDestinations,
  listAllReservations,
  type AdminReservationFilters,
} from "@/lib/queries/admin";
import AdminTabs from "./AdminTabs";
import DestinationsTab from "./DestinationsTab";
import ReservationsTab from "./ReservationsTab";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(params: SearchParams, key: string) {
  const v = params[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tab = pickString(sp, "tab") === "reservations" ? "reservations" : "destinations";

  const filters: AdminReservationFilters =
    tab === "reservations"
      ? {
          status: pickString(sp, "status") as ReservationStatus | "ALL" | undefined,
          search: pickString(sp, "search"),
        }
      : {};

  const [destinations, reservations] = await Promise.all([
    tab === "destinations" ? listAllDestinations() : Promise.resolve([]),
    tab === "reservations" ? listAllReservations(filters) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Administration
        </h1>
        <p className="text-muted-foreground">
          Gérez les destinations et consultez les réservations.
        </p>
      </header>

      <div className="mb-6">
        <AdminTabs value={tab} />
      </div>

      {tab === "destinations" ? (
        <DestinationsTab destinations={destinations} />
      ) : (
        <ReservationsTab
          reservations={reservations}
          status={filters.status ?? "ALL"}
          search={filters.search ?? ""}
        />
      )}
    </div>
  );
}
