"use server";

import { revalidatePath } from "next/cache";
import { ReservationStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

class CancelError extends Error {}

export async function cancelReservationAction(
  reservationId: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Vous devez être connecté pour annuler." };

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!existing) throw new CancelError("Réservation introuvable.");
      if (existing.userId !== session.sub && session.role !== Role.ADMIN) {
        throw new CancelError("Vous ne pouvez pas annuler cette réservation.");
      }
      if (existing.status === ReservationStatus.CANCELLED) {
        throw new CancelError("Cette réservation est déjà annulée.");
      }

      await tx.availability.update({
        where: { id: existing.availabilityId },
        data: { spotsLeft: { increment: existing.numberOfPeople } },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
      });
    });
  } catch (err) {
    if (err instanceof CancelError) return { error: err.message };
    throw err;
  }

  revalidatePath("/account");
  return {};
}
