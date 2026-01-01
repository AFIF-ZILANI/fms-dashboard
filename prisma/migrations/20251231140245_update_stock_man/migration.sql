/*
  Warnings:

  - You are about to drop the column `batchId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Sale` table. All the data in the column will be lost.
  - You are about to alter the column `total` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `itemId` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `SaleItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `_CustomersToSale` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sale_date` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sale_id` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "BirdGrade" AS ENUM ('HIGH', 'LOW', 'CULL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Units" ADD VALUE 'SACHETS';
ALTER TYPE "Units" ADD VALUE 'BOTTLE';
ALTER TYPE "Units" ADD VALUE 'MON';
ALTER TYPE "Units" ADD VALUE 'TON';

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_batchId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";

-- DropForeignKey
ALTER TABLE "_CustomersToSale" DROP CONSTRAINT "_CustomersToSale_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomersToSale" DROP CONSTRAINT "_CustomersToSale_B_fkey";

-- DropIndex
DROP INDEX "SaleItem_saleId_itemId_idx";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "batchId",
ADD COLUMN     "batch_id" TEXT;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sale_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "itemId",
DROP COLUMN "saleId",
DROP COLUMN "unitPrice",
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "sale_id" TEXT NOT NULL,
ADD COLUMN     "total_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "unit" "Units" NOT NULL,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "_CustomersToSale";

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
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" "Units" NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PurchaseToStockLedger" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PurchaseToStockLedger_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PurchaseToStockLedger_B_index" ON "_PurchaseToStockLedger"("B");

-- CreateIndex
CREATE INDEX "SaleItem_sale_id_idx" ON "SaleItem"("sale_id");

-- CreateIndex
CREATE INDEX "SaleItem_item_id_idx" ON "SaleItem"("item_id");

-- CreateIndex
CREATE INDEX "StockLedger_ref_type_ref_id_idx" ON "StockLedger"("ref_type", "ref_id");

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
ALTER TABLE "_PurchaseToStockLedger" ADD CONSTRAINT "_PurchaseToStockLedger_A_fkey" FOREIGN KEY ("A") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PurchaseToStockLedger" ADD CONSTRAINT "_PurchaseToStockLedger_B_fkey" FOREIGN KEY ("B") REFERENCES "StockLedger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
