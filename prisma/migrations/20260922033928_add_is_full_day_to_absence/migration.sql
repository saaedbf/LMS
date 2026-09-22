-- AlterTable
ALTER TABLE "student_absence" ADD COLUMN     "isFullDay" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL;
