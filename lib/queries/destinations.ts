import { unstable_cache } from "next/cache";
import { Prisma, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DestinationCardData = {
  id: string;
  name: string;
  country: string;
  basePrice: Prisma.Decimal;
  shortDescription: string;
  images: { url: string; alt: string | null }[];
};

export type ListDestinationsFilters = {
  search?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  pageSize: number;
};

export type ListDestinationsResult = {
  items: DestinationCardData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function buildWhere(filters: ListDestinationsFilters): Prisma.DestinationWhereInput {
  const where: Prisma.DestinationWhereInput = {};
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { country: { contains: filters.search } },
    ];
  }
  if (filters.country) {
    where.country = filters.country;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.basePrice = {};
    if (filters.minPrice !== undefined) where.basePrice.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.basePrice.lte = filters.maxPrice;
  }
  return where;
}

async function fetchListDestinations(
  filters: ListDestinationsFilters,
): Promise<ListDestinationsResult> {
  const where = buildWhere(filters);
  const [total, items] = await Promise.all([
    prisma.destination.count({ where }),
    prisma.destination.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        name: true,
        country: true,
        basePrice: true,
        shortDescription: true,
        images: {
          select: { url: true, alt: true },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    }),
  ]);
  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export const listDestinations = unstable_cache(
  (filters: ListDestinationsFilters) => fetchListDestinations(filters),
  ["list-destinations"],
  { revalidate: 3600, tags: ["destinations"] },
);

export type DestinationDetail = Awaited<ReturnType<typeof getDestinationById>>;

export async function getDestinationById(id: string) {
  return prisma.destination.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      availabilities: {
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
      },
    },
  });
}

export const getDistinctCountries = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.destination.findMany({
      distinct: ["country"],
      select: { country: true },
      orderBy: { country: "asc" },
    });
    return rows.map((r) => r.country);
  },
  ["destination-countries"],
  { revalidate: 3600, tags: ["destinations"] },
);

async function fetchPopularDestinations(limit: number): Promise<DestinationCardData[]> {
  const top = await prisma.reservation.groupBy({
    by: ["destinationId"],
    where: { status: ReservationStatus.CONFIRMED },
    _count: { _all: true },
    orderBy: { _count: { destinationId: "desc" } },
    take: limit,
  });

  const popularIds = top.map((t) => t.destinationId);
  const popular = popularIds.length
    ? await prisma.destination.findMany({
        where: { id: { in: popularIds } },
        select: {
          id: true,
          name: true,
          country: true,
          basePrice: true,
          shortDescription: true,
          images: {
            select: { url: true, alt: true },
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      })
    : [];

  const orderMap = new Map(popularIds.map((id, i) => [id, i]));
  popular.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

  if (popular.length >= limit) return popular;

  const fillers = await prisma.destination.findMany({
    where: { id: { notIn: popularIds } },
    orderBy: { createdAt: "desc" },
    take: limit - popular.length,
    select: {
      id: true,
      name: true,
      country: true,
      basePrice: true,
      shortDescription: true,
      images: {
        select: { url: true, alt: true },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  });

  return [...popular, ...fillers];
}

export const getPopularDestinations = unstable_cache(
  (limit: number = 4) => fetchPopularDestinations(limit),
  ["popular-destinations"],
  { revalidate: 3600, tags: ["destinations"] },
);
