/*
  Warnings:

  - Made the column `ref_type` on table `StockLedger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ref_id` on table `StockLedger` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "RefType" ADD VALUE 'EXISTING_STOCK';

-- AlterTable
ALTER TABLE "StockLedger" ALTER COLUMN "ref_type" SET NOT NULL,
ALTER COLUMN "ref_id" SET NOT NULL;
