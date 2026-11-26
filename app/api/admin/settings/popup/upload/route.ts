import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { denyIfNotSuperadmin } from "@/lib/admin-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

// SVG excluded on purpose (can carry scripts).
const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = 4 * 1024 * 1024;

/** Superadmin: upload the popup image. */
export async function POST(request: Request) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

  const ext = ALLOWED.get(file.type);
  if (!ext) return NextResponse.json({ error: "Gunakan PNG, JPG atau WebP" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran maksimal 4 MB" }, { status: 400 });

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`popup/image.${ext}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    }
    const result = await uploadToCloudinary(Buffer.from(await file.arrayBuffer()), "ilavioo/popup", "image");
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Popup image upload failed:", error);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}
