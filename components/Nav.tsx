import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Reservia
        </Link>

        <ul className="flex items-center gap-6 text-sm">
          <li>
            <Link href="/destinations" className="hover:underline">
              Destinations
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link href="/account" className="hover:underline">
                  Mes réservations
                </Link>
              </li>
              {user.role === "ADMIN" && (
                <li>
                  <Link href="/admin" className="font-medium hover:underline">
                    Admin
                  </Link>
                </li>
              )}
              <li className="hidden text-zinc-500 sm:inline">{user.name}</li>
              <li>
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="hover:underline">
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 text-xs font-medium"
                >
                  Inscription
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
