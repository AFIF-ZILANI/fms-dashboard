-- AlterTable
ALTER TABLE "StockLedger" ALTER COLUMN "ref_type" DROP NOT NULL,
ALTER COLUMN "ref_id" DROP NOT NULL;
