/*
  Warnings:

  - You are about to drop the `Ostan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Ostan";

-- CreateTable
CREATE TABLE "ostans" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ostans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "ostanId" INTEGER NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_ostanId_fkey" FOREIGN KEY ("ostanId") REFERENCES "ostans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
