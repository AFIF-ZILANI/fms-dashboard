-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_to_instrument_id_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_supplier_id_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "to_instrument_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "supplier_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_to_instrument_id_fkey" FOREIGN KEY ("to_instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
