/*
  Warnings:

  - You are about to drop the column `customer_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_id` on the `Payment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Payment_customer_id_idx";

-- DropIndex
DROP INDEX "Payment_supplier_id_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "customer_id",
DROP COLUMN "supplier_id";
