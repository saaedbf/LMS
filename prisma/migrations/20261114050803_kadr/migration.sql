-- AlterTable
ALTER TABLE "deputy" ADD COLUMN     "attendanceDays" TEXT[],
ADD COLUMN     "attendanceOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "position" TEXT;
