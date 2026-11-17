-- CreateTable
CREATE TABLE "page_visits" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitor_id" VARCHAR(64) NOT NULL,
    "path" VARCHAR(512) NOT NULL,
    "product_slug" VARCHAR(255),
    "country" VARCHAR(2),
    "region" VARCHAR(16),
    "city" VARCHAR(120),
    "timezone" VARCHAR(64),
    "device" VARCHAR(16) NOT NULL,
    "os" VARCHAR(40),
    "browser" VARCHAR(40),
    "in_app" VARCHAR(20),
    "source" VARCHAR(80) NOT NULL,
    "referrer_host" VARCHAR(255),
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(100),

    CONSTRAINT "page_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_visits_created_at_idx" ON "page_visits"("created_at");

-- CreateIndex
CREATE INDEX "page_visits_visitor_id_path_created_at_idx" ON "page_visits"("visitor_id", "path", "created_at");

-- CreateIndex
CREATE INDEX "page_visits_country_created_at_idx" ON "page_visits"("country", "created_at");


-- Block access through Supabase's public REST API (anon key). Prisma connects as the
-- table owner, which is not subject to RLS, so the app keeps working.
ALTER TABLE "page_visits" ENABLE ROW LEVEL SECURITY;
