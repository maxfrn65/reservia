"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/schemas";

export type AuthState = { error?: string } | null;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return { error: "Identifiants incorrects" };
  }

  const token = await signSession({ sub: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);

  const next = (formData.get("next") as string) || "/";
  redirect(next);
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Informations invalides" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Cet email est déjà utilisé" };
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: await hashPassword(parsed.data.password),
    },
    select: { id: true, email: true, role: true },
  });

  const token = await signSession({ sub: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);

  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
