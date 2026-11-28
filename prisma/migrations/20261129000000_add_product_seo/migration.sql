-- AlterTable: SEO fields on products (all additive / safe for existing rows)
ALTER TABLE "products" ADD COLUMN "seo_title" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "meta_description" VARCHAR(320);
ALTER TABLE "products" ADD COLUMN "canonical_url" TEXT;
ALTER TABLE "products" ADD COLUMN "image_alt" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "og_title" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "og_description" VARCHAR(320);
ALTER TABLE "products" ADD COLUMN "seo_status" VARCHAR(20) NOT NULL DEFAULT 'published';
ALTER TABLE "products" ADD COLUMN "seo_overrides" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable: product slug history for 301 redirects after a rename
CREATE TABLE "product_slug_history" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_slug_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_slug_history_slug_key" ON "product_slug_history"("slug");
CREATE INDEX "product_slug_history_product_id_idx" ON "product_slug_history"("product_id");

ALTER TABLE "product_slug_history" ADD CONSTRAINT "product_slug_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
