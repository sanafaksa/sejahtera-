-- Approximate (IP) and precise (consented GPS) visitor coordinates.
ALTER TABLE "page_visits"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "geo_precise" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "accuracy_m" INTEGER;
