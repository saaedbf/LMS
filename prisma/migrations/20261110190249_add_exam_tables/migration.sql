-- CreateTable
CREATE TABLE "grade_period_paye_key" (
    "id" TEXT NOT NULL,
    "gradePeriodId" TEXT NOT NULL,
    "payeId" INTEGER NOT NULL,
    "answerKey" JSONB NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_period_paye_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_exam_answer" (
    "id" TEXT NOT NULL,
    "studentEnrollmentId" TEXT NOT NULL,
    "gradePeriodId" TEXT NOT NULL,
    "payeId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_exam_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grade_period_paye_key_gradePeriodId_idx" ON "grade_period_paye_key"("gradePeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_period_paye_key_gradePeriodId_payeId_key" ON "grade_period_paye_key"("gradePeriodId", "payeId");

-- CreateIndex
CREATE INDEX "student_exam_answer_gradePeriodId_payeId_idx" ON "student_exam_answer"("gradePeriodId", "payeId");

-- CreateIndex
CREATE INDEX "student_exam_answer_studentEnrollmentId_idx" ON "student_exam_answer"("studentEnrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_exam_answer_studentEnrollmentId_gradePeriodId_payeI_key" ON "student_exam_answer"("studentEnrollmentId", "gradePeriodId", "payeId");

-- AddForeignKey
ALTER TABLE "grade_period_paye_key" ADD CONSTRAINT "grade_period_paye_key_gradePeriodId_fkey" FOREIGN KEY ("gradePeriodId") REFERENCES "grade_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_period_paye_key" ADD CONSTRAINT "grade_period_paye_key_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES "Paye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exam_answer" ADD CONSTRAINT "student_exam_answer_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exam_answer" ADD CONSTRAINT "student_exam_answer_gradePeriodId_fkey" FOREIGN KEY ("gradePeriodId") REFERENCES "grade_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exam_answer" ADD CONSTRAINT "student_exam_answer_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES "Paye"("id") ON DELETE CASCADE ON UPDATE CASCADE;
