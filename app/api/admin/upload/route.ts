import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { ApiError, handleApiError, json } from "@/lib/api";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new ApiError("Aucun fichier reçu.", 400);
    }
    if (!ALLOWED_MIMES.has(file.type)) {
      throw new ApiError("Format non supporté (jpg, png, webp, avif, gif).", 415);
    }
    if (file.size > MAX_BYTES) {
      throw new ApiError("Fichier trop volumineux (max 5 Mo).", 413);
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    const ext = MIME_TO_EXT[file.type] ?? "bin";
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    return json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
