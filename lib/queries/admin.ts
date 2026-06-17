import { Prisma, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listAllDestinations() {
  return prisma.destination.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
      availabilities: { orderBy: { startDate: "asc" } },
      _count: { select: { reservations: true } },
    },
  });
}

export type AdminDestinationRow = Awaited<ReturnType<typeof listAllDestinations>>[number];

export type AdminReservationFilters = {
  status?: ReservationStatus | "ALL";
  search?: string;
};

export async function listAllReservations(filters: AdminReservationFilters) {
  const where: Prisma.ReservationWhereInput = {};
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters.search) {
    where.OR = [
      { user: { email: { contains: filters.search } } },
      { user: { name: { contains: filters.search } } },
      { destination: { name: { contains: filters.search } } },
    ];
  }
  return prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      destination: { select: { id: true, name: true, country: true } },
      availability: { select: { startDate: true, endDate: true } },
    },
  });
}

export type AdminReservationRow = Awaited<ReturnType<typeof listAllReservations>>[number];
