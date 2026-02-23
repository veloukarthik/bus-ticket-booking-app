-- AlterTable
ALTER TABLE "User" ADD COLUMN "userType" TEXT NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "Vehicle" ADD COLUMN "ownerId" INTEGER;

-- Backfill owner for existing vehicles to first admin user if available
UPDATE "Vehicle"
SET "ownerId" = (
  SELECT "id" FROM "User" WHERE "isAdmin" = true ORDER BY "id" ASC LIMIT 1
)
WHERE "ownerId" IS NULL;

-- AddForeignKey
ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
