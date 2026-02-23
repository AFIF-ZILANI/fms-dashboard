/*
  Warnings:

  - Added the required column `item_id` to the `Consumption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consumption" ADD COLUMN     "item_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
