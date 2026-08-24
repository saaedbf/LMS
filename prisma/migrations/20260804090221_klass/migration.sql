-- CreateTable
CREATE TABLE "klass" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "payeId" INTEGER NOT NULL,
    "reshtehTahsiliId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "klass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "klass_schoolId_academicYearId_idx" ON "klass"("schoolId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "klass_title_schoolId_academicYearId_payeId_reshtehTahsiliId_key" ON "klass"("title", "schoolId", "academicYearId", "payeId", "reshtehTahsiliId");

-- AddForeignKey
ALTER TABLE "klass" ADD CONSTRAINT "klass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "klass" ADD CONSTRAINT "klass_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "klass" ADD CONSTRAINT "klass_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES "Paye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "klass" ADD CONSTRAINT "klass_reshtehTahsiliId_fkey" FOREIGN KEY ("reshtehTahsiliId") REFERENCES "ReshtehTahsili"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
