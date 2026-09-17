/*
  Warnings:

  - A unique constraint covering the columns `[gradePeriodId,darsPayeReshtehId,klassId]` on the table `grade_period_lesson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `klassId` to the `grade_period_lesson` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "grade_period_lesson_gradePeriodId_darsPayeReshtehId_key";

-- AlterTable
ALTER TABLE "grade_period_lesson" ADD COLUMN     "klassId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "grade_period_lesson_klassId_idx" ON "grade_period_lesson"("klassId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_period_lesson_gradePeriodId_darsPayeReshtehId_klassId_key" ON "grade_period_lesson"("gradePeriodId", "darsPayeReshtehId", "klassId");

-- AddForeignKey
ALTER TABLE "grade_period_lesson" ADD CONSTRAINT "grade_period_lesson_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES "klass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
