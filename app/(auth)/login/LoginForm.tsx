"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "../actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="text-sm text-zinc-500">Heureux de vous revoir.</p>
      </div>

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <input type="hidden" name="next" value={nextPath} />

      <label className="block space-y-1">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Mot de passe</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium underline">
          Inscription
        </Link>
      </p>
    </form>
  );
}
