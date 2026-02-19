-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResourceCategories" ADD VALUE 'ML';
ALTER TYPE "ResourceCategories" ADD VALUE 'L';
ALTER TYPE "ResourceCategories" ADD VALUE 'G';
ALTER TYPE "ResourceCategories" ADD VALUE 'KG';
ALTER TYPE "ResourceCategories" ADD VALUE 'PCS';
ALTER TYPE "ResourceCategories" ADD VALUE 'VIAL';
ALTER TYPE "ResourceCategories" ADD VALUE 'DOSE';
