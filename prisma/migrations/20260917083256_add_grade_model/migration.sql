-- CreateTable
CREATE TABLE "grade" (
    "id" TEXT NOT NULL,
    "studentEnrollmentId" TEXT NOT NULL,
    "gradePeriodLessonId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "descriptiveValue" TEXT,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grade_studentEnrollmentId_idx" ON "grade"("studentEnrollmentId");

-- CreateIndex
CREATE INDEX "grade_gradePeriodLessonId_idx" ON "grade"("gradePeriodLessonId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_studentEnrollmentId_gradePeriodLessonId_key" ON "grade"("studentEnrollmentId", "gradePeriodLessonId");

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_gradePeriodLessonId_fkey" FOREIGN KEY ("gradePeriodLessonId") REFERENCES "grade_period_lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
