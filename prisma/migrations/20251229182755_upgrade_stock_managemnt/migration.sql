/*
  Warnings:

  - You are about to drop the `Expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockTransactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StockDirection" AS ENUM ('IN', 'OUT', 'ADJUST');

-- CreateEnum
CREATE TYPE "StockReason" AS ENUM ('PURCHASE', 'CONSUMPTION', 'SALE', 'WASTAGE', 'EXPIRED', 'RETURN');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('LABOR', 'ELECTRICITY', 'TRANSPORT', 'INTERNET');

-- CreateEnum
CREATE TYPE "ConsumptionPurpose" AS ENUM ('FEED', 'MEDICINE', 'VACCINE', 'SUPPLEMENT', 'LITTER');

-- CreateEnum
CREATE TYPE "RefType" AS ENUM ('CONSUMPTION', 'SALE', 'PURCHASE');

-- DropForeignKey
ALTER TABLE "Expenses" DROP CONSTRAINT "Expenses_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "Items" DROP CONSTRAINT "Items_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "SalesItems" DROP CONSTRAINT "SalesItems_item_id_fkey";

-- DropForeignKey
ALTER TABLE "SalesItems" DROP CONSTRAINT "SalesItems_sale_id_fkey";

-- DropForeignKey
ALTER TABLE "StockTransactions" DROP CONSTRAINT "StockTransactions_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "StockTransactions" DROP CONSTRAINT "StockTransactions_item_id_fkey";

-- DropForeignKey
ALTER TABLE "StockTransactions" DROP CONSTRAINT "StockTransactions_supplier_id_fkey";

-- DropTable
DROP TABLE "Expenses";

-- DropTable
DROP TABLE "Items";

-- DropTable
DROP TABLE "Sales";

-- DropTable
DROP TABLE "SalesItems";

-- DropTable
DROP TABLE "StockTransactions";

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "direction" "StockDirection" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "reason" "StockReason" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "ref_type" "RefType" NOT NULL,
    "ref_id" TEXT,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ResourceCategories" NOT NULL,
    "unit" "Units" NOT NULL,
    "meta_data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consumption" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "houseId" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "purpose" "ConsumptionPurpose" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomersToSale" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomersToSale_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ItemToSuppliers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemToSuppliers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "StockLedger_itemId_occurredAt_idx" ON "StockLedger"("itemId", "occurredAt");

-- CreateIndex
CREATE INDEX "Consumption_batchId_houseId_date_idx" ON "Consumption"("batchId", "houseId", "date");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_itemId_idx" ON "SaleItem"("saleId", "itemId");

-- CreateIndex
CREATE INDEX "_CustomersToSale_B_index" ON "_CustomersToSale"("B");

-- CreateIndex
CREATE INDEX "_ItemToSuppliers_B_index" ON "_ItemToSuppliers"("B");

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "Houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomersToSale" ADD CONSTRAINT "_CustomersToSale_A_fkey" FOREIGN KEY ("A") REFERENCES "Customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomersToSale" ADD CONSTRAINT "_CustomersToSale_B_fkey" FOREIGN KEY ("B") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSuppliers" ADD CONSTRAINT "_ItemToSuppliers_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSuppliers" ADD CONSTRAINT "_ItemToSuppliers_B_fkey" FOREIGN KEY ("B") REFERENCES "Suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
