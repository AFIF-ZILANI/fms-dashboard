-- DropForeignKey
ALTER TABLE "Consumption" DROP CONSTRAINT "Consumption_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "StockReservation" DROP CONSTRAINT "StockReservation_batch_id_fkey";

-- AlterTable
ALTER TABLE "Consumption" ALTER COLUMN "batch_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StockReservation" ALTER COLUMN "batch_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
