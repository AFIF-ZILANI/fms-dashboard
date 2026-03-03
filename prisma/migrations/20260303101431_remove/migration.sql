-- CreateEnum
CREATE TYPE "EmployeeRoleNames" AS ENUM ('MANAGER', 'WORKER', 'INTERN');

-- CreateEnum
CREATE TYPE "ContactMethods" AS ENUM ('WHATSAPP', 'EMAIL', 'IMO', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "SupplierRoleNames" AS ENUM ('SALES_MAN', 'OWNER', 'DISTRIBUTOR', 'DEALER', 'WHOLESALER', 'RETAILER', 'MANUFACTURER', 'IMPORTER', 'REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "TransactionTypes" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE');

-- CreateEnum
CREATE TYPE "Units" AS ENUM ('BIRD', 'KG', 'LITER', 'BAG', 'BOX', 'UNIT', 'SACHETS', 'BOTTLE', 'MON', 'TON', 'ML', 'L', 'G', 'PCS', 'VIAL', 'DOSE', 'OTHER');

-- CreateEnum
CREATE TYPE "TimePeriods" AS ENUM ('MORNING', 'NOON', 'AFTERNOON', 'EVENING', 'NIGHT', 'MIDNIGHT', 'LATENIGHT');

-- CreateEnum
CREATE TYPE "BirdBreeds" AS ENUM ('CLASSIC', 'HIBREED', 'PAKISTHANI', 'KEDERNATH', 'FAOMI', 'TIGER');

-- CreateEnum
CREATE TYPE "ResourceCategories" AS ENUM ('FEED', 'MEDICINE', 'SUPPLEMENT', 'BIOSECURITY', 'VACCINE', 'CHICKS', 'HUSK', 'EQUIPMENT', 'UTILITIES', 'SALARY', 'TRANSPORTATION', 'MAINTENANCE', 'CLEANING_SUPPLIES', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplierSupplyCategories" AS ENUM ('FEED', 'MEDICINE', 'CHICKS', 'HUSK', 'EQUIPMENT', 'UTILITIES', 'TRANSPORTATION', 'CLEANING_SUPPLIES', 'OFFICE_SUPPLIES', 'SOFTWARE', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertTypes" AS ENUM ('EMPLOYEE', 'BATCH', 'FEED', 'MEDICINE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AlertLevels" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertActionTypes" AS ENUM ('PAY', 'REASSIGN', 'MARK_RESOLVED');

-- CreateEnum
CREATE TYPE "HouseType" AS ENUM ('BROODER', 'GROWER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('RUNNING', 'CLOSED', 'SOLD');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('BROODER', 'GROWER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE', 'CUSTOMER', 'SUPPLIER', 'DOCTOR');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FEED', 'WATER', 'MORTALITY');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('LABOR', 'ELECTRICITY', 'TRANSPORT', 'INTERNET');

-- CreateEnum
CREATE TYPE "RefType" AS ENUM ('HOUSE_EVENT', 'STOCK_RESERVATION', 'EXISTING_STOCK', 'CONSUMPTION', 'SALE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIAL');

-- CreateEnum
CREATE TYPE "BirdGrade" AS ENUM ('HIGH', 'LOW', 'CULL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MFS');

-- CreateEnum
CREATE TYPE "MfsType" AS ENUM ('BKASH', 'NAGAD', 'ROCKET');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "PaymentRefType" AS ENUM ('SALE', 'BIRD_SALE', 'PURCHASE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "StockDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('WAREHOUSE', 'HOUSE', 'CUSTOMER', 'DISPOSAL');

-- CreateEnum
CREATE TYPE "StockReason" AS ENUM ('PURCHASE', 'TRANSFER', 'CONSUMPTION', 'SALE', 'WASTAGE', 'EXPIRED', 'RETURN', 'ADJUSTMENT', 'OPENING_BALANCE');

-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('PRE_STARTER', 'STARTER', 'GROWER', 'FINISHER', 'LAYER');

-- CreateEnum
CREATE TYPE "AllocationReason" AS ENUM ('INITIAL', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('MANUFACTURER', 'IMPORTER', 'MARKETER', 'DISTRIBUTOR');

-- CreateTable
CREATE TABLE "Batches" (
    "id" TEXT NOT NULL,
    "starting_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_selling_date" TIMESTAMP(3) NOT NULL,
    "initial_quantity" INTEGER NOT NULL,
    "init_chicks_avg_wt" DOUBLE PRECISION NOT NULL,
    "breed" "BirdBreeds" NOT NULL,
    "batch_id" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'RUNNING',
    "phase" "Phase" NOT NULL,
    "farm_code" TEXT NOT NULL,
    "product_code" TEXT NOT NULL,
    "sector_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchSuppliers" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "price_per_chicks" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "delivery_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchSuppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseEvents" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "house_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Units" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "farm_date" DATE NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "HouseEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightRecords" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "house_id" TEXT NOT NULL,
    "average_wt_grams" DECIMAL(10,2) NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "farm_date" DATE NOT NULL,
    "measured_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Houses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HouseType" NOT NULL,
    "number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchHouseAllocation" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "from_house_id" TEXT,
    "to_house_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "reason" "AllocationReason" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchHouseAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchHouseBalance" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchHouseBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT,
    "avatar_id" TEXT,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employees" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "role" "EmployeeRoleNames" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admins" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customers" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "company" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "role" "SupplierRoleNames" NOT NULL,
    "type" "SupplierSupplyCategories"[],
    "company" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctors" (
    "id" TEXT NOT NULL,
    "specialty" TEXT,
    "position" TEXT,
    "degrees" TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0,
    "sector" TEXT,
    "institution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profile_id" TEXT NOT NULL,

    CONSTRAINT "Doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "location_type" "LocationType",
    "location_id" TEXT,
    "reason" "StockReason" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unit_cost" DECIMAL(10,2),
    "direction" "StockDirection" NOT NULL,
    "ref_type" "RefType" NOT NULL,
    "ref_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consumption" (
    "id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "item_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockReservation" (
    "id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "item_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_key" TEXT,
    "category" "ResourceCategories" NOT NULL,
    "unit" "Units" NOT NULL,
    "meta_data" JSONB NOT NULL,
    "reorder_level" DECIMAL(10,3),
    "preferred_reorder_qty" DECIMAL(10,3),
    "lead_time_days" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "label_name" TEXT NOT NULL,
    "normalized_key" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOrganization" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,

    CONSTRAINT "ItemOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchFeedingProgram" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "feed_type" "FeedType" NOT NULL,
    "item_id" TEXT NOT NULL,
    "start_day" INTEGER NOT NULL,
    "end_day" INTEGER,

    CONSTRAINT "BatchFeedingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseFeedInventory" (
    "id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity_remaining" DECIMAL(10,3) NOT NULL,
    "last_modified_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseFeedInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirdSale" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "grade" "BirdGrade" NOT NULL,
    "male_count" INTEGER,
    "dholta_in_g" DECIMAL(10,2) NOT NULL,
    "total_katha" INTEGER NOT NULL,
    "avg_wt_per_katha_kg" DECIMAL(10,2),
    "female_count" INTEGER,
    "birds_count" INTEGER NOT NULL,
    "avg_weight_g" DECIMAL(10,2),
    "total_weight" DECIMAL(10,2) NOT NULL,
    "net_weight" DECIMAL(10,2) NOT NULL,
    "price_per_kg" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BirdSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" "Units" NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "invoice_no" TEXT,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL,
    "due_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "mfg_date" TIMESTAMP(3),
    "expiration_date" TIMESTAMP(3),
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" "Units" NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "direction" "PaymentType" NOT NULL,
    "ref_type" "PaymentRefType" NOT NULL,
    "ref_id" TEXT NOT NULL,
    "from_instrument_id" TEXT NOT NULL,
    "to_instrument_id" TEXT NOT NULL,
    "transaction_ref" TEXT,
    "handled_by_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInstrument" (
    "id" TEXT NOT NULL,
    "owner_type" "UserRole" NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type" "PaymentMethod" NOT NULL,
    "label" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_no" TEXT,
    "mobile_no" TEXT,
    "mfs_type" "MfsType",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medications" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medication_details" TEXT NOT NULL,
    "administered_by" TEXT NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "cause" TEXT,
    "period" TEXT,
    "doctor_id" TEXT,
    "remarks" TEXT,
    "farm_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccinations" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vaccine_details" TEXT,
    "administered_by" TEXT NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "dosage" INTEGER NOT NULL,
    "cause" TEXT,
    "period" TEXT,
    "doctor_id" TEXT,
    "remarks" TEXT,
    "farm_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentRecords" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "house_no" INTEGER NOT NULL,
    "temperature_c" DOUBLE PRECISION NOT NULL,
    "humidity_percent" DOUBLE PRECISION NOT NULL,
    "ammonia_ppm" DOUBLE PRECISION NOT NULL,
    "co2_ppm" DOUBLE PRECISION NOT NULL,
    "air_pressure_hpa" DOUBLE PRECISION NOT NULL,
    "farm_date" DATE,
    "time_period" "TimePeriods" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvironmentRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatars" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avatars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AlertTypes" NOT NULL,
    "level" "AlertLevels" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "related_id" TEXT,
    "action_type" "AlertActionTypes",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_at" DATE,
    "resolved_at" DATE,

    CONSTRAINT "Alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemToSuppliers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemToSuppliers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batches_batch_id_key" ON "Batches"("batch_id");

-- CreateIndex
CREATE INDEX "Batches_farm_code_sector_code_product_code_batch_id_idx" ON "Batches"("farm_code", "sector_code", "product_code", "batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "BatchSuppliers_batch_id_supplier_id_key" ON "BatchSuppliers"("batch_id", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "WeightRecords_batch_id_house_id_date_key" ON "WeightRecords"("batch_id", "house_id", "date");

-- CreateIndex
CREATE INDEX "BatchHouseAllocation_batch_id_idx" ON "BatchHouseAllocation"("batch_id");

-- CreateIndex
CREATE INDEX "BatchHouseAllocation_from_house_id_idx" ON "BatchHouseAllocation"("from_house_id");

-- CreateIndex
CREATE INDEX "BatchHouseAllocation_to_house_id_idx" ON "BatchHouseAllocation"("to_house_id");

-- CreateIndex
CREATE INDEX "BatchHouseBalance_house_id_idx" ON "BatchHouseBalance"("house_id");

-- CreateIndex
CREATE INDEX "BatchHouseBalance_batch_id_idx" ON "BatchHouseBalance"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "BatchHouseBalance_batch_id_house_id_key" ON "BatchHouseBalance"("batch_id", "house_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profiles_email_key" ON "Profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_profile_id_key" ON "Employees"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admins_profile_id_key" ON "Admins"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_profile_id_key" ON "Customers"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_profile_id_key" ON "Suppliers"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "Doctors_profile_id_key" ON "Doctors"("profile_id");

-- CreateIndex
CREATE INDEX "StockLedger_item_id_occurred_at_idx" ON "StockLedger"("item_id", "occurred_at");

-- CreateIndex
CREATE INDEX "StockLedger_location_type_location_id_idx" ON "StockLedger"("location_type", "location_id");

-- CreateIndex
CREATE INDEX "StockLedger_ref_type_ref_id_idx" ON "StockLedger"("ref_type", "ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "StockLedger_idempotency_key_key" ON "StockLedger"("idempotency_key");

-- CreateIndex
CREATE INDEX "StockReservation_item_id_idx" ON "StockReservation"("item_id");

-- CreateIndex
CREATE INDEX "StockReservation_house_id_idx" ON "StockReservation"("house_id");

-- CreateIndex
CREATE INDEX "StockReservation_batch_id_idx" ON "StockReservation"("batch_id");

-- CreateIndex
CREATE INDEX "Item_name_category_idx" ON "Item"("name", "category");

-- CreateIndex
CREATE INDEX "Organization_normalized_key_idx" ON "Organization"("normalized_key");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_normalized_key_key" ON "Organization"("normalized_key");

-- CreateIndex
CREATE UNIQUE INDEX "ItemOrganization_item_id_organization_id_role_key" ON "ItemOrganization"("item_id", "organization_id", "role");

-- CreateIndex
CREATE INDEX "BatchFeedingProgram_batch_id_start_day_end_day_idx" ON "BatchFeedingProgram"("batch_id", "start_day", "end_day");

-- CreateIndex
CREATE UNIQUE INDEX "HouseFeedInventory_house_id_item_id_key" ON "HouseFeedInventory"("house_id", "item_id");

-- CreateIndex
CREATE INDEX "SaleItem_sale_id_idx" ON "SaleItem"("sale_id");

-- CreateIndex
CREATE INDEX "SaleItem_item_id_idx" ON "SaleItem"("item_id");

-- CreateIndex
CREATE INDEX "Payment_ref_type_ref_id_idx" ON "Payment"("ref_type", "ref_id");

-- CreateIndex
CREATE INDEX "_ItemToSuppliers_B_index" ON "_ItemToSuppliers"("B");

-- AddForeignKey
ALTER TABLE "BatchSuppliers" ADD CONSTRAINT "BatchSuppliers_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSuppliers" ADD CONSTRAINT "BatchSuppliers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseEvents" ADD CONSTRAINT "HouseEvents_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseEvents" ADD CONSTRAINT "HouseEvents_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseEvents" ADD CONSTRAINT "HouseEvents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecords" ADD CONSTRAINT "WeightRecords_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecords" ADD CONSTRAINT "WeightRecords_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecords" ADD CONSTRAINT "WeightRecords_measured_by_id_fkey" FOREIGN KEY ("measured_by_id") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHouseAllocation" ADD CONSTRAINT "BatchHouseAllocation_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHouseAllocation" ADD CONSTRAINT "BatchHouseAllocation_from_house_id_fkey" FOREIGN KEY ("from_house_id") REFERENCES "Houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHouseAllocation" ADD CONSTRAINT "BatchHouseAllocation_to_house_id_fkey" FOREIGN KEY ("to_house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profiles" ADD CONSTRAINT "Profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Avatars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suppliers" ADD CONSTRAINT "Suppliers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctors" ADD CONSTRAINT "Doctors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrganization" ADD CONSTRAINT "ItemOrganization_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrganization" ADD CONSTRAINT "ItemOrganization_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchFeedingProgram" ADD CONSTRAINT "BatchFeedingProgram_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchFeedingProgram" ADD CONSTRAINT "BatchFeedingProgram_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseFeedInventory" ADD CONSTRAINT "HouseFeedInventory_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseFeedInventory" ADD CONSTRAINT "HouseFeedInventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseFeedInventory" ADD CONSTRAINT "HouseFeedInventory_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdSale" ADD CONSTRAINT "BirdSale_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdSale" ADD CONSTRAINT "BirdSale_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_from_instrument_id_fkey" FOREIGN KEY ("from_instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_to_instrument_id_fkey" FOREIGN KEY ("to_instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "Profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medications" ADD CONSTRAINT "Medications_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "Admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medications" ADD CONSTRAINT "Medications_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medications" ADD CONSTRAINT "Medications_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccinations" ADD CONSTRAINT "Vaccinations_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "Admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccinations" ADD CONSTRAINT "Vaccinations_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccinations" ADD CONSTRAINT "Vaccinations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentRecords" ADD CONSTRAINT "EnvironmentRecords_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSuppliers" ADD CONSTRAINT "_ItemToSuppliers_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSuppliers" ADD CONSTRAINT "_ItemToSuppliers_B_fkey" FOREIGN KEY ("B") REFERENCES "Suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
