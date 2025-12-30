/*
  Warnings:

  - You are about to drop the column `batchId` on the `Consumption` table. All the data in the column will be lost.
  - You are about to drop the column `houseId` on the `Consumption` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `Consumption` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `occurredAt` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `StockLedger` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idempotency_key]` on the table `StockLedger` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ref_type,ref_id,reason]` on the table `StockLedger` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batch_id` to the `Consumption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `house_id` to the `Consumption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `Consumption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idempotency_key` to the `StockLedger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `StockLedger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occurred_at` to the `StockLedger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_itemId_fkey";

-- DropForeignKey
ALTER TABLE "StockLedger" DROP CONSTRAINT "StockLedger_itemId_fkey";

-- DropIndex
DROP INDEX "Consumption_batchId_houseId_date_idx";

-- DropIndex
DROP INDEX "StockLedger_itemId_occurredAt_idx";

-- AlterTable
ALTER TABLE "Consumption" DROP COLUMN "batchId",
DROP COLUMN "houseId",
DROP COLUMN "itemId",
ADD COLUMN     "batch_id" TEXT NOT NULL,
ADD COLUMN     "house_id" INTEGER NOT NULL,
ADD COLUMN     "item_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StockLedger" DROP COLUMN "itemId",
DROP COLUMN "occurredAt",
DROP COLUMN "unitCost",
ADD COLUMN     "idempotency_key" TEXT NOT NULL,
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "occurred_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Consumption_batch_id_house_id_date_idx" ON "Consumption"("batch_id", "house_id", "date");

-- CreateIndex
CREATE INDEX "StockLedger_item_id_occurred_at_idx" ON "StockLedger"("item_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "StockLedger_idempotency_key_key" ON "StockLedger"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "StockLedger_ref_type_ref_id_reason_key" ON "StockLedger"("ref_type", "ref_id", "reason");

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
