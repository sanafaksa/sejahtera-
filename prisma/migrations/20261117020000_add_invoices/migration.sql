-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "number" VARCHAR(40) NOT NULL,
    "public_token" VARCHAR(64) NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'draft',
    "language" VARCHAR(2) NOT NULL DEFAULT 'en',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "customer_name" VARCHAR(160) NOT NULL,
    "customer_company" VARCHAR(160),
    "customer_email" VARCHAR(200),
    "customer_phone" VARCHAR(60),
    "customer_address" TEXT,
    "customer_country" VARCHAR(2),
    "customer_timezone" VARCHAR(64),
    "issue_date" DATE NOT NULL,
    "due_date" DATE,
    "discount_type" VARCHAR(8) NOT NULL DEFAULT 'percent',
    "discount_value" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "tax_enabled" BOOLEAN NOT NULL DEFAULT false,
    "tax_label" VARCHAR(40) NOT NULL DEFAULT 'PPN',
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "discount_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "payment_method_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "product_id" INTEGER,
    "sku" VARCHAR(64),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_price" DECIMAL(16,2) NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_counters" (
    "scope" VARCHAR(64) NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_counters_pkey" PRIMARY KEY ("scope")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_public_token_key" ON "invoices"("public_token");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Not reachable through the Supabase anon key (customer data).
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_counters" ENABLE ROW LEVEL SECURITY;
