-- CreateTable
CREATE TABLE "grade_period" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schoolId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_period_klass" (
    "id" TEXT NOT NULL,
    "gradePeriodId" TEXT NOT NULL,
    "klassId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_period_klass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_period_lesson" (
    "id" TEXT NOT NULL,
    "gradePeriodId" TEXT NOT NULL,
    "darsPayeReshtehId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_period_lesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grade_period_schoolId_academicYearId_idx" ON "grade_period"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "grade_period_klass_gradePeriodId_idx" ON "grade_period_klass"("gradePeriodId");

-- CreateIndex
CREATE INDEX "grade_period_klass_klassId_idx" ON "grade_period_klass"("klassId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_period_klass_gradePeriodId_klassId_key" ON "grade_period_klass"("gradePeriodId", "klassId");

-- CreateIndex
CREATE INDEX "grade_period_lesson_gradePeriodId_idx" ON "grade_period_lesson"("gradePeriodId");

-- CreateIndex
CREATE INDEX "grade_period_lesson_darsPayeReshtehId_idx" ON "grade_period_lesson"("darsPayeReshtehId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_period_lesson_gradePeriodId_darsPayeReshtehId_key" ON "grade_period_lesson"("gradePeriodId", "darsPayeReshtehId");

-- AddForeignKey
ALTER TABLE "grade_period" ADD CONSTRAINT "grade_period_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_period" ADD CONSTRAINT "grade_period_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_period_klass" ADD CONSTRAINT "grade_period_klass_gradePeriodId_fkey" FOREIGN KEY ("gradePeriodId") REFERENCES "grade_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_period_klass" ADD CONSTRAINT "grade_period_klass_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES "klass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_period_lesson" ADD CONSTRAINT "grade_period_lesson_gradePeriodId_fkey" FOREIGN KEY ("gradePeriodId") REFERENCES "grade_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_period_lesson" ADD CONSTRAINT "grade_period_lesson_darsPayeReshtehId_fkey" FOREIGN KEY ("darsPayeReshtehId") REFERENCES "dars_paye_reshteh"("id") ON DELETE CASCADE ON UPDATE CASCADE;
