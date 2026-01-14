/*
  Warnings:

  - Made the column `paid_amount` on table `Purchase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `due_amount` on table `Purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "paid_amount" SET NOT NULL,
ALTER COLUMN "due_amount" SET NOT NULL;
