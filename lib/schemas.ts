import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(80),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

const imageInputSchema = z.object({
  url: z
    .string()
    .min(1)
    .refine(
      (v) => v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"),
      "URL invalide (doit commencer par http(s):// ou /)",
    ),
  alt: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
});

const availabilityInputSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    spotsLeft: z.number().int().min(0),
  })
  .refine((v) => v.endDate > v.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const createDestinationSchema = z.object({
  name: z.string().min(1).max(120),
  country: z.string().min(1).max(80),
  basePrice: z.number().nonnegative(),
  shortDescription: z.string().min(1).max(280),
  description: z.string().min(1),
  images: z.array(imageInputSchema).optional(),
  availabilities: z.array(availabilityInputSchema).optional(),
});
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;

export const updateDestinationSchema = createDestinationSchema.partial();
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;

export const destinationQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const createReservationSchema = z.object({
  availabilityId: z.string().min(1),
  numberOfPeople: z.number().int().min(1).max(20),
});
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
