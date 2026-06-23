import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import NavMenu from "./NavMenu";

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="relative border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Reservia
        </Link>

        <NavMenu
          user={user ? { name: user.name, role: user.role } : null}
        />
      </nav>
    </header>
  );
}