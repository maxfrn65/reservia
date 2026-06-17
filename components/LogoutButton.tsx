"use client";

import { logoutAction } from "@/app/(auth)/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
        Déconnexion
      </button>
    </form>
  );
}
