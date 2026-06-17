import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { ApiError, handleApiError, json } from "@/lib/api";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError("Email already in use", 409);
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        name,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = await signSession({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return json({ user }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
