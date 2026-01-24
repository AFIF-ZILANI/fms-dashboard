/*
  Warnings:

  - You are about to alter the column `reorder_level` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "lead_time_days" INTEGER,
ADD COLUMN     "preferred_reorder_qty" DECIMAL(10,3),
ALTER COLUMN "reorder_level" SET DATA TYPE DECIMAL(10,3);
