-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalCode" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "fatherName" TEXT,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "payeId" INTEGER NOT NULL,
    "reshtehTahsiliId" INTEGER NOT NULL,
    "klassId" TEXT NOT NULL,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_nationalCode_key" ON "student"("nationalCode");

-- CreateIndex
CREATE INDEX "student_lastEditedByUsername_idx" ON "student"("lastEditedByUsername");

-- CreateIndex
CREATE INDEX "student_enrollment_schoolId_academicYearId_idx" ON "student_enrollment"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "student_enrollment_payeId_reshtehTahsiliId_idx" ON "student_enrollment"("payeId", "reshtehTahsiliId");

-- CreateIndex
CREATE INDEX "student_enrollment_klassId_idx" ON "student_enrollment"("klassId");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollment_studentId_schoolId_academicYearId_key" ON "student_enrollment"("studentId", "schoolId", "academicYearId");

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES "Paye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_reshtehTahsiliId_fkey" FOREIGN KEY ("reshtehTahsiliId") REFERENCES "ReshtehTahsili"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment" ADD CONSTRAINT "student_enrollment_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES "klass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
