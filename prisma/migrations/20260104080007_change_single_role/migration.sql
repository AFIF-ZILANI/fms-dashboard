/*
  Warnings:

  - Changed the type of `owner_type` on the `PaymentInstrument` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PaymentInstrument" DROP COLUMN "owner_type",
ADD COLUMN     "owner_type" "UserRole" NOT NULL;

-- DropEnum
DROP TYPE "InstrumentOwner";
