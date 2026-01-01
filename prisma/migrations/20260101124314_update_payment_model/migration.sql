/*
  Warnings:

  - You are about to drop the column `instrument_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `received_by_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_ref` on the `PaymentInstrument` table. All the data in the column will be lost.
  - Added the required column `direction` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_instrument_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_instrument_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_type` to the `PaymentInstrument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InstrumentOwner" AS ENUM ('OWNER', 'SUPPLIER', 'CUSTOMER', 'TRANSPORTER', 'OTHER');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_instrument_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_received_by_id_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "instrument_id",
DROP COLUMN "received_by_id",
DROP COLUMN "type",
ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "direction" "PaymentType" NOT NULL,
ADD COLUMN     "from_instrument_id" TEXT NOT NULL,
ADD COLUMN     "handled_by_id" TEXT,
ADD COLUMN     "supplier_id" TEXT,
ADD COLUMN     "to_instrument_id" TEXT NOT NULL,
ADD COLUMN     "transaction_ref" TEXT;

-- AlterTable
ALTER TABLE "PaymentInstrument" DROP COLUMN "transaction_ref",
ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "owner_type" "InstrumentOwner" NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_supplier_id_idx" ON "Payment"("supplier_id");

-- CreateIndex
CREATE INDEX "Payment_customer_id_idx" ON "Payment"("customer_id");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_from_instrument_id_fkey" FOREIGN KEY ("from_instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_to_instrument_id_fkey" FOREIGN KEY ("to_instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "Profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
