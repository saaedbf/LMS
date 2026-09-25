-- CreateTable
CREATE TABLE "teacher_absence" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "isFullDay" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_absence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_absence_schoolId_academicYearId_idx" ON "teacher_absence"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "teacher_absence_teacherId_idx" ON "teacher_absence"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_absence_date_idx" ON "teacher_absence"("date");

-- AddForeignKey
ALTER TABLE "teacher_absence" ADD CONSTRAINT "teacher_absence_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_absence" ADD CONSTRAINT "teacher_absence_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_absence" ADD CONSTRAINT "teacher_absence_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
