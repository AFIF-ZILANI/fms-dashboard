/*
  Warnings:

  - A unique constraint covering the columns `[mobile]` on the table `Profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profiles" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profiles_mobile_key" ON "Profiles"("mobile");
