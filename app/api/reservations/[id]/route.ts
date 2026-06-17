import { Role, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ApiError, handleApiError, json } from "@/lib/api";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/reservations/[id]">) {
  try {
    const session = await requireUser();
    const { id } = await ctx.params;

    const reservation = await prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findUnique({ where: { id } });
      if (!existing) throw new ApiError("Reservation not found", 404);
      if (existing.userId !== session.sub && session.role !== Role.ADMIN) {
        throw new ApiError("Forbidden", 403);
      }
      if (existing.status === ReservationStatus.CANCELLED) {
        throw new ApiError("Reservation already cancelled", 409);
      }

      await tx.availability.update({
        where: { id: existing.availabilityId },
        data: { spotsLeft: { increment: existing.numberOfPeople } },
      });

      return tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CANCELLED },
        include: {
          destination: { select: { id: true, name: true, country: true } },
          availability: { select: { startDate: true, endDate: true } },
        },
      });
    });

    return json({ reservation });
  } catch (err) {
    return handleApiError(err);
  }
}
