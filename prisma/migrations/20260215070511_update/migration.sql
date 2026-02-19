/*
  Warnings:

  - A unique constraint covering the columns `[normalizedKey]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Organization_normalizedKey_idx" ON "Organization"("normalizedKey");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_normalizedKey_key" ON "Organization"("normalizedKey");
