-- CreateEnum
CREATE TYPE "EncouragementType" AS ENUM ('EDUCATIONAL', 'CULTURAL', 'DISCIPLINARY', 'COMPETITIONS', 'KHAVARAZMI', 'OTHER');

-- CreateTable
CREATE TABLE "student_encouragement" (
    "id" TEXT NOT NULL,
    "studentEnrollmentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "type" "EncouragementType" NOT NULL DEFAULT 'EDUCATIONAL',
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_encouragement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_encouragement_date_idx" ON "student_encouragement"("date");

-- CreateIndex
CREATE INDEX "student_encouragement_studentEnrollmentId_idx" ON "student_encouragement"("studentEnrollmentId");

-- AddForeignKey
ALTER TABLE "student_encouragement" ADD CONSTRAINT "student_encouragement_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
