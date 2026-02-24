-- CreateTable
CREATE TABLE "HouseFeedInventory" (
    "id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity_remaining" DECIMAL(10,3) NOT NULL,
    "last_modified_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseFeedInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseFeedInventory_house_id_item_id_key" ON "HouseFeedInventory"("house_id", "item_id");

-- AddForeignKey
ALTER TABLE "HouseFeedInventory" ADD CONSTRAINT "HouseFeedInventory_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "Houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseFeedInventory" ADD CONSTRAINT "HouseFeedInventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseFeedInventory" ADD CONSTRAINT "HouseFeedInventory_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
