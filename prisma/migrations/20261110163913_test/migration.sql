-- AlterTable
ALTER TABLE "grade" ADD COLUMN     "studentAnswers" JSONB;

-- AlterTable
ALTER TABLE "grade_period_lesson" ADD COLUMN     "answerKey" JSONB;
