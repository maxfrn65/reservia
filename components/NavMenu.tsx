"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

type NavUser = {
  name: string;
  role: "USER" | "ADMIN";
} | null;

export default function NavMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = (
    <>
      <Link href="/destinations" className="hover:underline">
        Destinations
      </Link>

      {user ? (
        <>
          <Link href="/account" className="hover:underline">
            Mes réservations
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin" className="font-medium hover:underline">
              Admin
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href="/login" className="hover:underline">
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 text-xs font-medium text-center"
          >
            Inscription
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <ul className="hidden md:flex items-center gap-6 text-sm">
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
            <li className="hidden text-zinc-500 lg:inline">{user.name}</li>
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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute left-0 right-0 top-full z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 text-sm">
            {user && (
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Connecté en tant que {user.name}
              </div>
            )}
            {links}
            {user && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <LogoutButton />
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}