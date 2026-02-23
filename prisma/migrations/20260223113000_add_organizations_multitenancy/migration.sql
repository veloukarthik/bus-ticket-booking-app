-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Seed default org for existing rows
INSERT INTO "Organization" ("id", "name", "slug", "createdAt")
VALUES (1, 'Default Organization', 'default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
SELECT setval(pg_get_serial_sequence('"Organization"', 'id'), COALESCE((SELECT MAX("id") FROM "Organization"), 1), true);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "organizationId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Vehicle" ADD COLUMN "organizationId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Trip" ADD COLUMN "organizationId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Booking" ADD COLUMN "organizationId" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
