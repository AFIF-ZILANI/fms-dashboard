/*
  Warnings:

  - You are about to drop the column `from_location_id` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `from_location_type` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `to_location_id` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `to_location_type` on the `StockLedger` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "StockLedger_from_location_type_from_location_id_idx";

-- DropIndex
DROP INDEX "StockLedger_to_location_type_to_location_id_idx";

-- AlterTable
ALTER TABLE "StockLedger" DROP COLUMN "from_location_id",
DROP COLUMN "from_location_type",
DROP COLUMN "to_location_id",
DROP COLUMN "to_location_type",
ADD COLUMN     "location_id" TEXT,
ADD COLUMN     "location_type" "LocationType";

-- CreateIndex
CREATE INDEX "StockLedger_location_type_location_id_idx" ON "StockLedger"("location_type", "location_id");
