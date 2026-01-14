/*
  Warnings:

  - You are about to alter the column `quantity` on the `StockLedger` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,3)`.
  - You are about to alter the column `unit_cost` on the `StockLedger` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "StockLedger" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,3),
ALTER COLUMN "unit_cost" SET DATA TYPE DECIMAL(10,2);
