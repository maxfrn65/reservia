import { Role, ReservationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ApiError, handleApiError, json } from "@/lib/api";
import { createReservationSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await requireUser();
    const where: Prisma.ReservationWhereInput =
      session.role === Role.ADMIN ? {} : { userId: session.sub };

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        destination: { select: { id: true, name: true, country: true } },
        availability: { select: { startDate: true, endDate: true } },
        user:
          session.role === Role.ADMIN
            ? { select: { id: true, email: true, name: true } }
            : false,
      },
    });

    return json({ reservations });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const input = createReservationSchema.parse(body);

    const reservation = await prisma.$transaction(async (tx) => {
      const availability = await tx.availability.findUnique({
        where: { id: input.availabilityId },
        include: { destination: { select: { id: true, basePrice: true } } },
      });
      if (!availability) {
        throw new ApiError("Availability not found", 404);
      }
      if (availability.spotsLeft < input.numberOfPeople) {
        throw new ApiError("Not enough spots available", 409);
      }

      await tx.availability.update({
        where: { id: availability.id },
        data: { spotsLeft: { decrement: input.numberOfPeople } },
      });

      const totalPrice = new Prisma.Decimal(availability.destination.basePrice).mul(
        input.numberOfPeople,
      );

      return tx.reservation.create({
        data: {
          userId: session.sub,
          destinationId: availability.destination.id,
          availabilityId: availability.id,
          numberOfPeople: input.numberOfPeople,
          totalPrice,
          status: ReservationStatus.CONFIRMED,
        },
        include: {
          destination: { select: { id: true, name: true, country: true } },
          availability: { select: { startDate: true, endDate: true } },
        },
      });
    });

    return json({ reservation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}