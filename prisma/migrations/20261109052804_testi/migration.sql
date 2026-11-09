-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('NORMAL', 'TEST');

-- AlterTable
ALTER TABLE "grade" ADD COLUMN     "blankCount" INTEGER,
ADD COLUMN     "correctCount" INTEGER,
ADD COLUMN     "wrongCount" INTEGER;

-- AlterTable
ALTER TABLE "grade_period" ADD COLUMN     "examType" "ExamType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "hasNegativeScore" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "grade_period_lesson" ADD COLUMN     "questionCount" INTEGER,
ADD COLUMN     "questionRange" TEXT;
