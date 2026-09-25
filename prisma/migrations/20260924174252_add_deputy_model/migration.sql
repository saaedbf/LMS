-- CreateTable
CREATE TABLE "deputy" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalCode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "lastEditedByUsername" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deputy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deputy_assignment" (
    "id" TEXT NOT NULL,
    "deputyId" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deputy_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deputy_permission" (
    "id" TEXT NOT NULL,
    "deputyId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deputy_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deputy_nationalCode_key" ON "deputy"("nationalCode");

-- CreateIndex
CREATE UNIQUE INDEX "deputy_userId_key" ON "deputy"("userId");

-- CreateIndex
CREATE INDEX "deputy_phone_idx" ON "deputy"("phone");

-- CreateIndex
CREATE INDEX "deputy_assignment_schoolId_academicYearId_idx" ON "deputy_assignment"("schoolId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "deputy_assignment_deputyId_schoolId_academicYearId_key" ON "deputy_assignment"("deputyId", "schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "deputy_permission_deputyId_idx" ON "deputy_permission"("deputyId");

-- CreateIndex
CREATE UNIQUE INDEX "deputy_permission_deputyId_permission_key" ON "deputy_permission"("deputyId", "permission");

-- AddForeignKey
ALTER TABLE "deputy" ADD CONSTRAINT "deputy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deputy_assignment" ADD CONSTRAINT "deputy_assignment_deputyId_fkey" FOREIGN KEY ("deputyId") REFERENCES "deputy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deputy_assignment" ADD CONSTRAINT "deputy_assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deputy_assignment" ADD CONSTRAINT "deputy_assignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deputy_permission" ADD CONSTRAINT "deputy_permission_deputyId_fkey" FOREIGN KEY ("deputyId") REFERENCES "deputy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
