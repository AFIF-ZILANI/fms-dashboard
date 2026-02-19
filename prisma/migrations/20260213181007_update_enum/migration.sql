/*
  Warnings:

  - The values [ML,L,G,KG,PCS,VIAL,DOSE] on the enum `ResourceCategories` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResourceCategories_new" AS ENUM ('FEED', 'MEDICINE', 'SUPPLEMENT', 'BIOSECURITY', 'CHICKS', 'HUSK', 'EQUIPMENT', 'UTILITIES', 'SALARY', 'TRANSPORTATION', 'MAINTENANCE', 'CLEANING_SUPPLIES', 'OTHER');
ALTER TABLE "Item" ALTER COLUMN "category" TYPE "ResourceCategories_new" USING ("category"::text::"ResourceCategories_new");
ALTER TYPE "ResourceCategories" RENAME TO "ResourceCategories_old";
ALTER TYPE "ResourceCategories_new" RENAME TO "ResourceCategories";
DROP TYPE "public"."ResourceCategories_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Units" ADD VALUE 'ML';
ALTER TYPE "Units" ADD VALUE 'L';
ALTER TYPE "Units" ADD VALUE 'G';
ALTER TYPE "Units" ADD VALUE 'PCS';
ALTER TYPE "Units" ADD VALUE 'VIAL';
ALTER TYPE "Units" ADD VALUE 'DOSE';
