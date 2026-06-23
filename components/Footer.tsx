"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {Mail, MapPin, Phone} from "lucide-react";

const HIDDEN_ROUTES = ["/login", "/register"];

export default function Footer() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Reservia
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Réservez vos prochains voyages en quelques clics. Des destinations
              soigneusement sélectionnées, partout dans le monde.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Explorer</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:underline">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:underline">
                  Toutes les destinations
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:underline">
                  Mes réservations
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Informations</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:underline">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>12 rue du Voyage, 75000 Paris, France</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+33100000000" className="hover:underline">
                  +33 1 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contact@reservia.fr" className="hover:underline">
                  contact@reservia.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© {year} Reservia. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
