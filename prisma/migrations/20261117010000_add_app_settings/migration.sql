-- CreateTable
CREATE TABLE "app_settings" (
    "key" VARCHAR(64) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);


-- Not reachable through the Supabase anon key.
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;
