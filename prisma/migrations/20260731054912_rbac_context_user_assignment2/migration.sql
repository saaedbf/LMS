/*
  Warnings:

  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeAssignmentId" INTEGER;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE INDEX "session_activeAssignmentId_idx" ON "session"("activeAssignmentId");

-- CreateIndex
CREATE INDEX "user_assignment_schoolId_idx" ON "user_assignment"("schoolId");

-- CreateIndex
CREATE INDEX "user_assignment_academicYearId_idx" ON "user_assignment"("academicYearId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_activeAssignmentId_fkey" FOREIGN KEY ("activeAssignmentId") REFERENCES "user_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
