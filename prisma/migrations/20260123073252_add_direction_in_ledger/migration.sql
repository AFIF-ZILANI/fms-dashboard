-- CreateEnum
CREATE TYPE "StockDirection" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "StockLedger" ADD COLUMN     "direction" "StockDirection";
