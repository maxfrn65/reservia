import { prisma } from "@/lib/prisma";

export type UserReservation = Awaited<ReturnType<typeof getMyReservations>>[number];

export async function getMyReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      destination: {
        select: {
          id: true,
          name: true,
          country: true,
          images: {
            take: 1,
            orderBy: { order: "asc" },
            select: { url: true, alt: true },
          },
        },
      },
      availability: {
        select: { startDate: true, endDate: true },
      },
    },
  });
}
