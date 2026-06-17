import { clearSessionCookie } from "@/lib/auth";
import { handleApiError, json } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}