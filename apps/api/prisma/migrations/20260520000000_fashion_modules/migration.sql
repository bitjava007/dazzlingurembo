-- CreateTable: boms
CREATE TABLE IF NOT EXISTS "boms" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "boms_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "boms_productId_key" ON "boms"("productId");
CREATE INDEX IF NOT EXISTS "boms_productId_idx" ON "boms"("productId");
CREATE INDEX IF NOT EXISTS "boms_deletedAt_idx" ON "boms"("deletedAt");

-- CreateTable: bom_items
CREATE TABLE IF NOT EXISTS "bom_items" (
    "id" TEXT NOT NULL,
    "bomId" TEXT NOT NULL,
    "materialVariantId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "wastagePercent" DECIMAL(5,2),
    "materialType" TEXT NOT NULL DEFAULT 'FABRIC',
    "notes" TEXT,
    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "bom_items_bomId_idx" ON "bom_items"("bomId");
CREATE INDEX IF NOT EXISTS "bom_items_materialVariantId_idx" ON "bom_items"("materialVariantId");
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_materialVariantId_fkey" FOREIGN KEY ("materialVariantId") REFERENCES "product_variants"("id") ON UPDATE CASCADE;

-- CreateTable: tailoring_teams
CREATE TABLE IF NOT EXISTS "tailoring_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "leaderId" TEXT,
    "capacity" INTEGER,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "tailoring_teams_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "tailoring_teams_code_key" ON "tailoring_teams"("code");
CREATE INDEX IF NOT EXISTS "tailoring_teams_workshopId_idx" ON "tailoring_teams"("workshopId");
ALTER TABLE "tailoring_teams" ADD CONSTRAINT "tailoring_teams_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON UPDATE CASCADE;

-- CreateTable: custom_orders
CREATE TABLE IF NOT EXISTS "custom_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bust" DECIMAL(6,2),
    "waist" DECIMAL(6,2),
    "hips" DECIMAL(6,2),
    "length" DECIMAL(6,2),
    "shoulders" DECIMAL(6,2),
    "sleeves" DECIMAL(6,2),
    "inseam" DECIMAL(6,2),
    "neck" DECIMAL(6,2),
    "measurementNotes" TEXT,
    "stylePreferences" TEXT,
    "colorPreferences" TEXT,
    "fabricPreferences" TEXT,
    "embellishments" TEXT,
    "specialInstructions" TEXT,
    "primaryFabricVariantId" TEXT,
    "secondaryFabricVariantId" TEXT,
    "liningVariantId" TEXT,
    "estimatedPrice" DECIMAL(15,2),
    "finalPrice" DECIMAL(15,2),
    "depositAmount" DECIMAL(15,2),
    "currencyCode" TEXT NOT NULL DEFAULT 'XOF',
    "requiredByDate" TIMESTAMP(3),
    "fittingDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "workOrderId" TEXT,
    "createdById" TEXT,
    "notes" TEXT,
    "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "custom_orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "custom_orders_orderNumber_key" ON "custom_orders"("orderNumber");
CREATE INDEX IF NOT EXISTS "custom_orders_customerId_idx" ON "custom_orders"("customerId");
CREATE INDEX IF NOT EXISTS "custom_orders_branchId_idx" ON "custom_orders"("branchId");
CREATE INDEX IF NOT EXISTS "custom_orders_status_idx" ON "custom_orders"("status");
ALTER TABLE "custom_orders" ADD CONSTRAINT "custom_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON UPDATE CASCADE;
ALTER TABLE "custom_orders" ADD CONSTRAINT "custom_orders_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON UPDATE CASCADE;

-- CreateTable: alterations
CREATE TABLE IF NOT EXISTS "alterations" (
    "id" TEXT NOT NULL,
    "alterationNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "workshopId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "description" TEXT NOT NULL,
    "alterationType" TEXT NOT NULL DEFAULT 'RESIZE',
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    "estimatedCost" DECIMAL(15,2),
    "finalCost" DECIMAL(15,2),
    "currencyCode" TEXT NOT NULL DEFAULT 'XOF',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "tailorId" TEXT,
    "notes" TEXT,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alterations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "alterations_alterationNumber_key" ON "alterations"("alterationNumber");
CREATE INDEX IF NOT EXISTS "alterations_customerId_idx" ON "alterations"("customerId");
CREATE INDEX IF NOT EXISTS "alterations_branchId_idx" ON "alterations"("branchId");
ALTER TABLE "alterations" ADD CONSTRAINT "alterations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON UPDATE CASCADE;
ALTER TABLE "alterations" ADD CONSTRAINT "alterations_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON UPDATE CASCADE;
ALTER TABLE "alterations" ADD CONSTRAINT "alterations_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON UPDATE CASCADE;

-- CreateTable: production_schedules
CREATE TABLE IF NOT EXISTS "production_schedules" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "teamId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "production_schedules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "production_schedules_workOrderId_idx" ON "production_schedules"("workOrderId");
CREATE INDEX IF NOT EXISTS "production_schedules_workshopId_idx" ON "production_schedules"("workshopId");
CREATE INDEX IF NOT EXISTS "production_schedules_scheduledDate_idx" ON "production_schedules"("scheduledDate");
ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON UPDATE CASCADE;
ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tailoring_teams"("id") ON UPDATE CASCADE;
