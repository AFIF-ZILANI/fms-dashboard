/*
  Warnings:

  - You are about to drop the `Consumption` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('WAREHOUSE', 'HOUSE', 'CUSTOMER', 'DISPOSAL', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('PRE_STARTER', 'STARTER', 'GROWER', 'FINISHER', 'LAYER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockReason" ADD VALUE 'TRANSFER';
ALTER TYPE "StockReason" ADD VALUE 'ADJUSTMENT';

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_house_id_fkey";

-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_item_id_fkey";

-- DropIndex
DROP INDEX "StockLedger_ref_type_ref_id_item_id_reason_key";

-- AlterTable
ALTER TABLE "StockLedger" ADD COLUMN     "from_location_id" TEXT,
ADD COLUMN     "from_location_type" "LocationType",
ADD COLUMN     "to_location_id" TEXT,
ADD COLUMN     "to_location_type" "LocationType",
ALTER COLUMN "occurred_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Consumption";

-- CreateTable
CREATE TABLE "BatchFeedingProgram" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "feed_type" "FeedType" NOT NULL,
    "start_day" INTEGER NOT NULL,
    "end_day" INTEGER,

    CONSTRAINT "BatchFeedingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchFeedingProgram_batch_id_start_day_end_day_idx" ON "BatchFeedingProgram"("batch_id", "start_day", "end_day");

-- CreateIndex
CREATE INDEX "StockLedger_from_location_type_from_location_id_idx" ON "StockLedger"("from_location_type", "from_location_id");

-- CreateIndex
CREATE INDEX "StockLedger_to_location_type_to_location_id_idx" ON "StockLedger"("to_location_type", "to_location_id");

-- AddForeignKey
ALTER TABLE "BatchFeedingProgram" ADD CONSTRAINT "BatchFeedingProgram_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
