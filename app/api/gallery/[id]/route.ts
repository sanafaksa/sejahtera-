import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = Number(idString);
  const asset = await prisma.galleryAsset.findUnique({ where: { id } });
  if (!asset)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = Number(idString);
  const body = await req.json();
  const updated = await prisma.galleryAsset.update({
    where: { id },
    data: {
      title: body.title ?? null,
      description: body.description ?? null,
      url: body.url ?? undefined,
      type: body.type ?? undefined,
      category: body.category ?? null,
      tags: body.tags ?? undefined,
      isFeatured: body.isFeatured ?? undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = Number(idString);

  try {
    const asset = await prisma.galleryAsset.findUnique({
      where: { id },
      select: { url: true },
    });

    if (!asset) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    await prisma.galleryAsset.delete({ where: { id } });

    if (asset.url) {
      try {
        if (asset.url.includes("res.cloudinary.com")) {
          const parts = asset.url.split("/upload/");
          if (parts[1]) {
            const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
            const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
            await cloudinary.uploader.destroy(publicId, {
              resource_type: "auto",
            });
          }
        } else {
          const urlParts = asset.url.split(
            "/storage/v1/object/public/gallery-assets/"
          );

          if (urlParts.length > 1) {
            const filename = urlParts[1];

            const { error: storageError } = await supabase.storage
              .from("gallery-assets")
              .remove([filename]);

            if (storageError) {
              console.error("⚠️ Failed to delete from storage:", storageError);
            }
          }
        }
      } catch (storageErr) {
        console.error("⚠️ Storage deletion error:", storageErr);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting asset:", error);
    return NextResponse.json(
      { message: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
