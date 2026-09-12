-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('UNKNOWN', 'EXCUSED', 'UNEXCUSED');

-- CreateTable
CREATE TABLE "student_absence" (
    "id" TEXT NOT NULL,
    "studentEnrollmentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "absenceType" "AbsenceType" NOT NULL DEFAULT 'UNKNOWN',
    "reason" TEXT,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_absence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_absence_date_idx" ON "student_absence"("date");

-- CreateIndex
CREATE INDEX "student_absence_studentEnrollmentId_idx" ON "student_absence"("studentEnrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_absence_studentEnrollmentId_date_startTime_endTime_key" ON "student_absence"("studentEnrollmentId", "date", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "student_absence" ADD CONSTRAINT "student_absence_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
