/*
  Warnings:

  - A unique constraint covering the columns `[ref_type,ref_id,item_id,reason]` on the table `StockLedger` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ref_id` on table `StockLedger` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "StockLedger_ref_type_ref_id_reason_key";

-- AlterTable
ALTER TABLE "StockLedger" ALTER COLUMN "ref_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StockLedger_ref_type_ref_id_item_id_reason_key" ON "StockLedger"("ref_type", "ref_id", "item_id", "reason");
