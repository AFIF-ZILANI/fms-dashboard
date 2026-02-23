/*
  Warnings:

  - Added the required column `item_id` to the `StockReservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockReservation" ADD COLUMN     "item_id" TEXT NOT NULL;
