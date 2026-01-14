/*
  Warnings:

  - The values [PHARMACIST] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Pharmacists` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'EMPLOYEE', 'CUSTOMER', 'SUPPLIER', 'DOCTOR');
ALTER TABLE "Profiles" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "PaymentInstrument" ALTER COLUMN "owner_type" TYPE "UserRole_new" USING ("owner_type"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Pharmacists" DROP CONSTRAINT "Pharmacists_profile_id_fkey";

-- DropTable
DROP TABLE "Pharmacists";
