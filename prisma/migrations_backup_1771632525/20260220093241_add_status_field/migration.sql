-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tripId" INTEGER NOT NULL,
    "seats" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "paymentResponse" TEXT,
    "txnId" TEXT,
    "paymentStatus" TEXT,
    "respCode" TEXT,
    "respMsg" TEXT,
    "tripDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "id", "isPaid", "paidAt", "paymentResponse", "paymentStatus", "respCode", "respMsg", "seatCount", "seats", "totalPrice", "tripDate", "tripId", "txnId", "userId") SELECT "createdAt", "id", "isPaid", "paidAt", "paymentResponse", "paymentStatus", "respCode", "respMsg", "seatCount", "seats", "totalPrice", "tripDate", "tripId", "txnId", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
