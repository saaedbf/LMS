/*
  Warnings:

  - A unique constraint covering the columns `[oppositeSchoolId]` on the table `school` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[oppositeEnrollmentId]` on the table `student_enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "school" ADD COLUMN     "oppositeSchoolId" INTEGER;

-- AlterTable
ALTER TABLE "student_enrollment" ADD COLUMN     "oppositeEnrollmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "school_oppositeSchoolId_key" ON "school"("oppositeSchoolId");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollment_oppositeEnrollmentId_key" ON "student_enrollment"("oppositeEnrollmentId");

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_oppositeSchoolId_fkey" FOREIGN KEY ("oppositeSchoolId") REFERENCES "school"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_oppositeEnrollmentId_fkey" FOREIGN KEY ("oppositeEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
