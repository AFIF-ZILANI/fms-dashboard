/*
  Warnings:

  - You are about to drop the `_PurchaseToStockLedger` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PurchaseToStockLedger" DROP CONSTRAINT "_PurchaseToStockLedger_A_fkey";

-- DropForeignKey
ALTER TABLE "_PurchaseToStockLedger" DROP CONSTRAINT "_PurchaseToStockLedger_B_fkey";

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "paid_amount" DROP NOT NULL,
ALTER COLUMN "due_amount" DROP NOT NULL;

-- DropTable
DROP TABLE "_PurchaseToStockLedger";
