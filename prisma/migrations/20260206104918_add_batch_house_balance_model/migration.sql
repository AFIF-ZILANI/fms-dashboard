-- CreateTable
CREATE TABLE "BatchHouseBalance" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchHouseBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchHouseBalance_house_id_idx" ON "BatchHouseBalance"("house_id");

-- CreateIndex
CREATE INDEX "BatchHouseBalance_batch_id_idx" ON "BatchHouseBalance"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "BatchHouseBalance_batch_id_house_id_key" ON "BatchHouseBalance"("batch_id", "house_id");
