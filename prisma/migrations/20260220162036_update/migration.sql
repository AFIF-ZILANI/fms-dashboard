/*
  Warnings:

  - The values [SUPPLIER] on the enum `LocationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LocationType_new" AS ENUM ('WAREHOUSE', 'HOUSE', 'CUSTOMER', 'DISPOSAL');
ALTER TABLE "StockLedger" ALTER COLUMN "location_type" TYPE "LocationType_new" USING ("location_type"::text::"LocationType_new");
ALTER TYPE "LocationType" RENAME TO "LocationType_old";
ALTER TYPE "LocationType_new" RENAME TO "LocationType";
DROP TYPE "public"."LocationType_old";
COMMIT;
