-- CreateTable
CREATE TABLE "Passenger" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "mobile" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "seat" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
