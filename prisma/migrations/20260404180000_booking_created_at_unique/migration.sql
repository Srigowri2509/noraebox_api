-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_roomId_date_timeSlot_key" ON "Booking"("roomId", "date", "timeSlot");
