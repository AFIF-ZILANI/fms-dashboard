-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "reorder_level" DROP NOT NULL,
ALTER COLUMN "reorder_level" DROP DEFAULT;
