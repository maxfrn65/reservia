import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, json } from "@/lib/api";
import { createDestinationSchema, destinationQuerySchema } from "@/lib/schemas";
import { listDestinations } from "@/lib/queries/destinations";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = destinationQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listDestinations(params);
    return json(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = createDestinationSchema.parse(body);

    const destination = await prisma.destination.create({
      data: {
        name: input.name,
        country: input.country,
        basePrice: input.basePrice,
        shortDescription: input.shortDescription,
        description: input.description,
        images: input.images?.length
          ? { create: input.images.map((img, i) => ({ ...img, order: img.order ?? i })) }
          : undefined,
        availabilities: input.availabilities?.length
          ? { create: input.availabilities }
          : undefined,
      },
      include: { images: true, availabilities: true },
    });

    revalidateTag("destinations", "max");
    return json({ destination }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
