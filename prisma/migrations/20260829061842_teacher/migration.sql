-- CreateTable
CREATE TABLE "teacher" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalCode" TEXT NOT NULL,
    "personnelCode" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "lastEditedByUsername" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_assignment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_course" (
    "id" TEXT NOT NULL,
    "klassId" TEXT NOT NULL,
    "darsPayeReshtehId" TEXT NOT NULL,
    "teacherId" TEXT,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_nationalCode_key" ON "teacher"("nationalCode");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_userId_key" ON "teacher"("userId");

-- CreateIndex
CREATE INDEX "teacher_personnelCode_idx" ON "teacher"("personnelCode");

-- CreateIndex
CREATE INDEX "teacher_phone_idx" ON "teacher"("phone");

-- CreateIndex
CREATE INDEX "teacher_assignment_schoolId_academicYearId_idx" ON "teacher_assignment"("schoolId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignment_teacherId_schoolId_academicYearId_key" ON "teacher_assignment"("teacherId", "schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "class_course_klassId_idx" ON "class_course"("klassId");

-- CreateIndex
CREATE INDEX "class_course_teacherId_idx" ON "class_course"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "class_course_klassId_darsPayeReshtehId_key" ON "class_course"("klassId", "darsPayeReshtehId");

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignment" ADD CONSTRAINT "teacher_assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignment" ADD CONSTRAINT "teacher_assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignment" ADD CONSTRAINT "teacher_assignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_course" ADD CONSTRAINT "class_course_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES "klass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_course" ADD CONSTRAINT "class_course_darsPayeReshtehId_fkey" FOREIGN KEY ("darsPayeReshtehId") REFERENCES "dars_paye_reshteh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_course" ADD CONSTRAINT "class_course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
