/*
  Warnings:

  - You are about to alter the column `quantity` on the `PurchaseItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - Added the required column `payment_type` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MFS');

-- CreateEnum
CREATE TYPE "MfsType" AS ENUM ('BKASH', 'NAGAD', 'ROCKET');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "PaymentRefType" AS ENUM ('SALE', 'BIRD_SALE', 'PURCHASE', 'EXPENSE');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "payment_type" "PaymentType" NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseItem" ALTER COLUMN "quantity" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "ref_type" "PaymentRefType" NOT NULL,
    "ref_id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,
    "received_by_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInstrument" (
    "id" TEXT NOT NULL,
    "type" "PaymentMethod" NOT NULL,
    "label" TEXT NOT NULL,
    "bank_name" TEXT,
    "account_no" TEXT,
    "transaction_ref" TEXT,
    "mobile_no" TEXT,
    "mfs_type" "MfsType",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_ref_type_ref_id_idx" ON "Payment"("ref_type", "ref_id");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "Profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
