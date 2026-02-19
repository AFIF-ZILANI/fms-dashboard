/*
  Warnings:

  - You are about to drop the column `normalizedKey` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `labelName` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `normalizedKey` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[normalized_key]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `label_name` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalized_key` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organization_normalizedKey_idx";

-- DropIndex
DROP INDEX "Organization_normalizedKey_key";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "normalizedKey",
ADD COLUMN     "normalized_key" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "createdAt",
DROP COLUMN "labelName",
DROP COLUMN "normalizedKey",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "label_name" TEXT NOT NULL,
ADD COLUMN     "normalized_key" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Organization_normalized_key_idx" ON "Organization"("normalized_key");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_normalized_key_key" ON "Organization"("normalized_key");
