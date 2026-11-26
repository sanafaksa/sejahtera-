-- User roles (admin / superadmin)
ALTER TABLE "users" ADD COLUMN "role" VARCHAR(20) NOT NULL DEFAULT 'admin';

-- Contact form submissions
CREATE TABLE "contact_messages" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(160) NOT NULL,
  "phone" VARCHAR(40),
  "subject" VARCHAR(120) NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");
