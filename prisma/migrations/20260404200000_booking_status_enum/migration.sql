-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus" USING ("status"::"BookingStatus");
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'pending'::"BookingStatus";
