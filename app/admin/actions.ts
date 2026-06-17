"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createDestinationSchema } from "@/lib/schemas";

export type DestinationSaveState =
  | { error: string }
  | { ok: true; id: string }
  | null;

async function requireAdminOrError(): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Vous devez être connecté." };
  if (session.role !== "ADMIN") return { error: "Accès réservé aux administrateurs." };
  return {};
}

function parseInput(formData: FormData) {
  const imagesRaw = String(formData.get("images") ?? "[]");
  const availabilitiesRaw = String(formData.get("availabilities") ?? "[]");
  let images: unknown = [];
  let availabilities: unknown = [];
  try {
    images = JSON.parse(imagesRaw);
  } catch {
    /* keep [] */
  }
  try {
    availabilities = JSON.parse(availabilitiesRaw);
  } catch {
    /* keep [] */
  }
  return createDestinationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    country: String(formData.get("country") ?? ""),
    basePrice: Number(formData.get("basePrice")),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    images,
    availabilities,
  });
}

export async function saveDestinationAction(
  _prev: DestinationSaveState,
  formData: FormData,
): Promise<DestinationSaveState> {
  const guard = await requireAdminOrError();
  if (guard.error) return { error: guard.error };

  const parsed = parseInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const data = parsed.data;
  const id = String(formData.get("id") ?? "").trim();

  try {
    let savedId: string;
    if (id) {
      const updated = await prisma.$transaction(async (tx) => {
        const dest = await tx.destination.update({
          where: { id },
          data: {
            name: data.name,
            country: data.country,
            basePrice: data.basePrice,
            shortDescription: data.shortDescription,
            description: data.description,
          },
        });
        await tx.image.deleteMany({ where: { destinationId: id } });
        if (data.images?.length) {
          await tx.image.createMany({
            data: data.images.map((img, i) => ({
              ...img,
              order: img.order ?? i,
              destinationId: id,
            })),
          });
        }
        await tx.availability.deleteMany({ where: { destinationId: id } });
        if (data.availabilities?.length) {
          await tx.availability.createMany({
            data: data.availabilities.map((a) => ({ ...a, destinationId: id })),
          });
        }
        return dest;
      });
      savedId = updated.id;
    } else {
      const created = await prisma.destination.create({
        data: {
          name: data.name,
          country: data.country,
          basePrice: data.basePrice,
          shortDescription: data.shortDescription,
          description: data.description,
          images: data.images?.length
            ? { create: data.images.map((img, i) => ({ ...img, order: img.order ?? i })) }
            : undefined,
          availabilities: data.availabilities?.length
            ? { create: data.availabilities }
            : undefined,
        },
      });
      savedId = created.id;
    }
    revalidateTag("destinations", "max");
    revalidatePath("/admin");
    return { ok: true, id: savedId };
  } catch (err) {
    console.error("saveDestinationAction failed", err);
    return { error: "Erreur lors de l'enregistrement." };
  }
}

export async function deleteDestinationAction(
  id: string,
): Promise<{ error?: string }> {
  const guard = await requireAdminOrError();
  if (guard.error) return { error: guard.error };

  try {
    await prisma.destination.delete({ where: { id } });
  } catch (err) {
    console.error("deleteDestinationAction failed", err);
    return { error: "Impossible de supprimer cette destination." };
  }
  revalidateTag("destinations", "max");
  revalidatePath("/admin");
  return {};
}
