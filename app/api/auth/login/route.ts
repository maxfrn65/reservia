import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";
import { ApiError, handleApiError, json } from "@/lib/api";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      throw new ApiError("Invalid credentials", 401);
    }

    const token = await signSession({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
