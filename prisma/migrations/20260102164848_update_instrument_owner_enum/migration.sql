/*
  Warnings:

  - The values [OWNER,OTHER] on the enum `InstrumentOwner` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InstrumentOwner_new" AS ENUM ('SUPPLIER', 'CUSTOMER', 'TRANSPORTER', 'ADMIN', 'EMPLOYEE', 'DOCTOR');
ALTER TABLE "PaymentInstrument" ALTER COLUMN "owner_type" TYPE "InstrumentOwner_new" USING ("owner_type"::text::"InstrumentOwner_new");
ALTER TYPE "InstrumentOwner" RENAME TO "InstrumentOwner_old";
ALTER TYPE "InstrumentOwner_new" RENAME TO "InstrumentOwner";
DROP TYPE "public"."InstrumentOwner_old";
COMMIT;
