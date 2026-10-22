-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY');

-- CreateTable
CREATE TABLE "class_schedule" (
    "id" TEXT NOT NULL,
    "classCourseId" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "bellIndex" INTEGER NOT NULL,
    "isHalfBell" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_schedule_classCourseId_day_bellIndex_key" ON "class_schedule"("classCourseId", "day", "bellIndex");

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_classCourseId_fkey" FOREIGN KEY ("classCourseId") REFERENCES "class_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
