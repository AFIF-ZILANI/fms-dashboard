-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('MANUFACTURER', 'IMPORTER', 'MARKETER', 'DISTRIBUTOR');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "normalizedKey" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "labelName" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOrganization" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,

    CONSTRAINT "ItemOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemOrganization_itemId_organizationId_role_key" ON "ItemOrganization"("itemId", "organizationId", "role");

-- AddForeignKey
ALTER TABLE "ItemOrganization" ADD CONSTRAINT "ItemOrganization_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrganization" ADD CONSTRAINT "ItemOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
