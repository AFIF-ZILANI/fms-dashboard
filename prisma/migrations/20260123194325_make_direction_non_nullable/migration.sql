/*
  Warnings:

  - Made the column `direction` on table `StockLedger` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StockLedger" ALTER COLUMN "direction" SET NOT NULL;
