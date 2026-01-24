/*
  Warnings:

  - The primary key for the `Houses` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "BatchHouseAllocation" DROP CONSTRAINT "BatchHouseAllocation_house_id_fkey";

-- DropForeignKey
ALTER TABLE "HouseEvents" DROP CONSTRAINT "HouseEvents_house_id_fkey";

-- DropForeignKey
ALTER TABLE "WeightRecords" DROP CONSTRAINT "WeightRecords_house_id_fkey";

-- AlterTable
ALTER TABLE "BatchHouseAllocation" ALTER COLUMN "house_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "HouseEvents" ALTER COLUMN "house_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Houses" DROP CONSTRAINT "Houses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Houses_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Houses_id_seq";

-- AlterTable
ALTER TABLE "WeightRecords" ALTER COLUMN "house_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "HouseEvents" ADD CONSTRAINT "HouseEvents_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecords" ADD CONSTRAINT "WeightRecords_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHouseAllocation" ADD CONSTRAINT "BatchHouseAllocation_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
