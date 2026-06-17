"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createReservationSchema } from "@/lib/schemas";

class ReserveError extends Error {}

export type ReserveState = { error?: string } | null;

export async function createReservationAction(
  _prev: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  const session = await getSession();
  if (!session) {
    const destinationId = String(formData.get("destinationId") ?? "");
    const next = destinationId ? `/destinations/${destinationId}` : "/destinations";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const parsed = createReservationSchema.safeParse({
    availabilityId: formData.get("availabilityId"),
    numberOfPeople: Number(formData.get("numberOfPeople")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const availability = await tx.availability.findUnique({
        where: { id: parsed.data.availabilityId },
        include: { destination: { select: { id: true, basePrice: true } } },
      });
      if (!availability) {
        throw new ReserveError("Cette date n'est plus disponible.");
      }
      if (availability.spotsLeft < parsed.data.numberOfPeople) {
        throw new ReserveError(
          `Il ne reste que ${availability.spotsLeft} place(s) pour cette date.`,
        );
      }

      await tx.availability.update({
        where: { id: availability.id },
        data: { spotsLeft: { decrement: parsed.data.numberOfPeople } },
      });

      const totalPrice = new Prisma.Decimal(availability.destination.basePrice).mul(
        parsed.data.numberOfPeople,
      );

      await tx.reservation.create({
        data: {
          userId: session.sub,
          destinationId: availability.destination.id,
          availabilityId: availability.id,
          numberOfPeople: parsed.data.numberOfPeople,
          totalPrice,
          status: ReservationStatus.CONFIRMED,
        },
      });
    });
  } catch (err) {
    if (err instanceof ReserveError) {
      return { error: err.message };
    }
    throw err;
  }

  revalidatePath("/destinations", "layout");
  redirect("/account");
}
