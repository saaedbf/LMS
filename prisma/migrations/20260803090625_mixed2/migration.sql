/*
  Warnings:

  - The values [Mixed] on the enum `SchoolType` will be removed. If these variants are still used in the database, this will fail.
  - The values [mixed] on the enum `Sex` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SchoolType_new" AS ENUM ('Dolati', 'GheireDolati');
ALTER TABLE "school" ALTER COLUMN "schoolType" DROP DEFAULT;
ALTER TABLE "school" ALTER COLUMN "schoolType" TYPE "SchoolType_new" USING ("schoolType"::text::"SchoolType_new");
ALTER TYPE "SchoolType" RENAME TO "SchoolType_old";
ALTER TYPE "SchoolType_new" RENAME TO "SchoolType";
DROP TYPE "SchoolType_old";
ALTER TABLE "school" ALTER COLUMN "schoolType" SET DEFAULT 'Dolati';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Sex_new" AS ENUM ('Boy', 'Girl', 'Mixed');
ALTER TABLE "school" ALTER COLUMN "sex" DROP DEFAULT;
ALTER TABLE "school" ALTER COLUMN "sex" TYPE "Sex_new" USING ("sex"::text::"Sex_new");
ALTER TYPE "Sex" RENAME TO "Sex_old";
ALTER TYPE "Sex_new" RENAME TO "Sex";
DROP TYPE "Sex_old";
ALTER TABLE "school" ALTER COLUMN "sex" SET DEFAULT 'Boy';
COMMIT;
