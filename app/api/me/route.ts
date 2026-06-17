import { getCurrentUser } from "@/lib/auth";
import { handleApiError, json } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return json({ user: null }, { status: 401 });
    return json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}