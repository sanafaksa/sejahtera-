import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { denyIfNotAdmin } from "@/lib/admin-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

// SVG is excluded on purpose: it can carry scripts.
const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Uploads a logo or signature for invoices. Uses Vercel Blob when
 * BLOB_READ_WRITE_TOKEN is configured, otherwise the existing Cloudinary account.
 */
export async function POST(request: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind") === "signature" ? "signature" : "logo";
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

  const ext = ALLOWED.get(file.type);
  if (!ext) return NextResponse.json({ error: "Gunakan PNG, JPG atau WebP" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran maksimal 2 MB" }, { status: 400 });

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`invoice/${kind}.${ext}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url, provider: "vercel-blob" });
    }
    const result = await uploadToCloudinary(Buffer.from(await file.arrayBuffer()), "ilavioo/invoice", "image");
    return NextResponse.json({ url: result.secure_url, provider: "cloudinary" });
  } catch (error: unknown) {
    console.error("Invoice asset upload failed:", error);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}
