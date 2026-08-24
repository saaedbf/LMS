/*
  Warnings:

  - The values [mixed] on the enum `SchoolType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SchoolType_new" AS ENUM ('Dolati', 'GheireDolati', 'Mixed');
ALTER TABLE "school" ALTER COLUMN "schoolType" DROP DEFAULT;
ALTER TABLE "school" ALTER COLUMN "schoolType" TYPE "SchoolType_new" USING ("schoolType"::text::"SchoolType_new");
ALTER TYPE "SchoolType" RENAME TO "SchoolType_old";
ALTER TYPE "SchoolType_new" RENAME TO "SchoolType";
DROP TYPE "SchoolType_old";
ALTER TABLE "school" ALTER COLUMN "schoolType" SET DEFAULT 'Dolati';
COMMIT;
