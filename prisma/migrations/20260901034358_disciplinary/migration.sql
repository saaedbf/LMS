-- CreateTable
CREATE TABLE "student_disciplinary" (
    "id" TEXT NOT NULL,
    "studentEnrollmentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_disciplinary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_disciplinary_date_idx" ON "student_disciplinary"("date");

-- CreateIndex
CREATE INDEX "student_disciplinary_studentEnrollmentId_idx" ON "student_disciplinary"("studentEnrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_disciplinary_studentEnrollmentId_date_startTime_key" ON "student_disciplinary"("studentEnrollmentId", "date", "startTime");

-- AddForeignKey
ALTER TABLE "student_disciplinary" ADD CONSTRAINT "student_disciplinary_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
