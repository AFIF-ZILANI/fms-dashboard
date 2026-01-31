/*
  Warnings:

  - You are about to drop the column `end_date` on the `BatchHouseAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `house_id` on the `BatchHouseAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `BatchHouseAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `BatchHouseAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `quality_score` on the `BatchSuppliers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AllocationReason" AS ENUM ('INITIAL', 'TRANSFER', 'ADJUSTMENT');

-- DropForeignKey
ALTER TABLE "BatchHouseAllocation" DROP CONSTRAINT "BatchHouseAllocation_house_id_fkey";

-- DropIndex
DROP INDEX "BatchHouseAllocation_batch_id_house_id_idx";

-- AlterTable
ALTER TABLE "BatchHouseAllocation" DROP COLUMN "end_date",
DROP COLUMN "house_id",
DROP COLUMN "start_date",
DROP COLUMN "updated_at",
ADD COLUMN     "from_house_id" TEXT,
ADD COLUMN     "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reason" "AllocationReason" NOT NULL DEFAULT 'TRANSFER',
ADD COLUMN     "to_house_id" TEXT;

-- AlterTable
ALTER TABLE "BatchSuppliers" DROP COLUMN "quality_score";

-- CreateIndex
CREATE INDEX "BatchHouseAllocation_batch_id_idx" ON "BatchHouseAllocation"("batch_id");

-- CreateIndex
CREATE INDEX "BatchHouseAllocation_from_house_id_idx" ON "BatchHouseAllocation"("from_house_id");

-- CreateIndex
CREATE INDEX "BatchHouseAllocation_to_house_id_idx" ON "BatchHouseAllocation"("to_house_id");

-- AddForeignKey
ALTER TABLE "BatchHouseAllocation" ADD CONSTRAINT "BatchHouseAllocation_from_house_id_fkey" FOREIGN KEY ("from_house_id") REFERENCES "Houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHouseAllocation" ADD CONSTRAINT "BatchHouseAllocation_to_house_id_fkey" FOREIGN KEY ("to_house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
