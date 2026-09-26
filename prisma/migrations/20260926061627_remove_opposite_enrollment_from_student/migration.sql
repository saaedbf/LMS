/*
  Warnings:

  - You are about to drop the column `oppositeEnrollmentId` on the `student_enrollment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_enrollment" DROP CONSTRAINT "student_enrollment_oppositeEnrollmentId_fkey";

-- DropIndex
DROP INDEX "student_enrollment_oppositeEnrollmentId_key";

-- AlterTable
ALTER TABLE "student_enrollment" DROP COLUMN "oppositeEnrollmentId";
