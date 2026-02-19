/*
  Warnings:

  - You are about to drop the column `itemId` on the `ItemOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `ItemOrganization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[item_id,organization_id,role]` on the table `ItemOrganization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `item_id` to the `ItemOrganization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `ItemOrganization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ItemOrganization" DROP CONSTRAINT "ItemOrganization_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemOrganization" DROP CONSTRAINT "ItemOrganization_organizationId_fkey";

-- DropIndex
DROP INDEX "ItemOrganization_itemId_organizationId_role_key";

-- AlterTable
ALTER TABLE "ItemOrganization" DROP COLUMN "itemId",
DROP COLUMN "organizationId",
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ItemOrganization_item_id_organization_id_role_key" ON "ItemOrganization"("item_id", "organization_id", "role");

-- AddForeignKey
ALTER TABLE "ItemOrganization" ADD CONSTRAINT "ItemOrganization_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrganization" ADD CONSTRAINT "ItemOrganization_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
