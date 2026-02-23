-- CreateIndex
CREATE INDEX "StockReservation_item_id_idx" ON "StockReservation"("item_id");

-- CreateIndex
CREATE INDEX "StockReservation_house_id_idx" ON "StockReservation"("house_id");

-- CreateIndex
CREATE INDEX "StockReservation_batch_id_idx" ON "StockReservation"("batch_id");

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
