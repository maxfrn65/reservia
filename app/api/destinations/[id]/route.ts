import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, json } from "@/lib/api";
import { updateDestinationSchema } from "@/lib/schemas";

export async function GET(_req: Request, ctx: RouteContext<"/api/destinations/[id]">) {
  try {
    const { id } = await ctx.params;
    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        availabilities: { orderBy: { startDate: "asc" } },
      },
    });
    if (!destination) throw new ApiError("Destination not found", 404);
    return json({ destination });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/destinations/[id]">) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await request.json();
    const input = updateDestinationSchema.parse(body);

    const destination = await prisma.$transaction(async (tx) => {
      const updated = await tx.destination.update({
        where: { id },
        data: {
          name: input.name,
          country: input.country,
          basePrice: input.basePrice,
          shortDescription: input.shortDescription,
          description: input.description,
        },
      });

      if (input.images) {
        await tx.image.deleteMany({ where: { destinationId: id } });
        if (input.images.length) {
          await tx.image.createMany({
            data: input.images.map((img, i) => ({
              ...img,
              order: img.order ?? i,
              destinationId: id,
            })),
          });
        }
      }

      if (input.availabilities) {
        await tx.availability.deleteMany({ where: { destinationId: id } });
        if (input.availabilities.length) {
          await tx.availability.createMany({
            data: input.availabilities.map((a) => ({ ...a, destinationId: id })),
          });
        }
      }

      return tx.destination.findUniqueOrThrow({
        where: { id: updated.id },
        include: {
          images: { orderBy: { order: "asc" } },
          availabilities: { orderBy: { startDate: "asc" } },
        },
      });
    });

    revalidateTag("destinations", "max");
    return json({ destination });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/destinations/[id]">) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.destination.delete({ where: { id } });
    revalidateTag("destinations", "max");
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}