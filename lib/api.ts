import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AuthError } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export function handleApiError(err: unknown): Response {
  if (err instanceof ZodError) {
    return Response.json(
      { error: "Validation failed", issues: err.issues },
      { status: 400 },
    );
  }
  if (err instanceof ApiError || err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return Response.json({ error: "Resource already exists" }, { status: 409 });
    }
    if (err.code === "P2025") {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }
  }
  console.error("Unhandled API error:", err);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
