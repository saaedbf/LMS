-- CreateEnum
CREATE TYPE "GradingType" AS ENUM ('DESCRIPTIVE', 'NUMERIC');

-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "gradingType" "GradingType" NOT NULL DEFAULT 'NUMERIC',
    "showTuitionInStudentPanel" BOOLEAN NOT NULL DEFAULT true,
    "showDisciplinaryInStudentPanel" BOOLEAN NOT NULL DEFAULT true,
    "showAbsencesInStudentPanel" BOOLEAN NOT NULL DEFAULT true,
    "showReportCardsInStudentPanel" BOOLEAN NOT NULL DEFAULT true,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_settings_schoolId_key" ON "school_settings"("schoolId");

-- AddForeignKey
ALTER TABLE "school_settings" ADD CONSTRAINT "school_settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE CASCADE ON UPDATE CASCADE;
