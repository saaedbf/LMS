-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Boy', 'Girl', 'mixed');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('Dolati', 'GheireDolati', 'mixed');

-- AlterTable
ALTER TABLE "school" ADD COLUMN     "doreTahsiliId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "modirName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "schoolType" "SchoolType" NOT NULL DEFAULT 'Dolati',
ADD COLUMN     "sex" "Sex" NOT NULL DEFAULT 'Boy',
ADD COLUMN     "subTitle" TEXT,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "school_id_seq";

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_doreTahsiliId_fkey" FOREIGN KEY ("doreTahsiliId") REFERENCES "DoreTahsili"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
