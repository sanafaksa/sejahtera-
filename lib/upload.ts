import { supabase } from "@/lib/supabase";

export type UploadResult = {
  url: string;
  type: "image" | "video";
  publicId?: string;
  provider: "cloudinary" | "supabase";
};

/**
 * Universal media upload helper:
 * Tries Cloudinary first (via /api/upload/cloudinary),
 * and falls back to Supabase Storage if Cloudinary is not configured.
 */
export async function uploadMediaFile(
  file: File,
  folder = "ilavioo/gallery"
): Promise<UploadResult> {
  const isVideo =
    file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);

  // 1. Try uploading to Cloudinary
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.url) {
      return {
        url: data.url,
        type: data.type === "video" ? "video" : "image",
        publicId: data.publicId,
        provider: "cloudinary",
      };
    } else {
      console.warn("Cloudinary upload notice:", data.error || "Falling back to Supabase...");
    }
  } catch (err) {
    console.warn("Cloudinary upload failed, attempting Supabase fallback:", err);
  }

  // 2. Fallback to Supabase Storage
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const bucket = folder.includes("gallery") ? "gallery-assets" : "product-images";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      url: pub.publicUrl,
      type: isVideo ? "video" : "image",
      provider: "supabase",
    };
  } catch (supabaseError: any) {
    throw new Error(
      `Upload failed on both Cloudinary and Supabase: ${supabaseError.message || supabaseError}`
    );
  }
}

