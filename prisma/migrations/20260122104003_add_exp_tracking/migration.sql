/*
  Warnings:

  - You are about to alter the column `quantity` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "expiration_date" TIMESTAMP(3),
ADD COLUMN     "mfg_date" TIMESTAMP(3),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,3);
