-- CreateTable
CREATE TABLE "dars_paye_reshteh" (
    "id" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "reshtehTahsiliId" INTEGER NOT NULL,
    "payeId" INTEGER NOT NULL,
    "reshtehTadrisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dars_paye_reshteh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dars_paye_reshteh_reshtehTahsiliId_payeId_idx" ON "dars_paye_reshteh"("reshtehTahsiliId", "payeId");

-- CreateIndex
CREATE UNIQUE INDEX "dars_paye_reshteh_reshtehTahsiliId_payeId_reshtehTadrisId_key" ON "dars_paye_reshteh"("reshtehTahsiliId", "payeId", "reshtehTadrisId");

-- AddForeignKey
ALTER TABLE "dars_paye_reshteh" ADD CONSTRAINT "dars_paye_reshteh_reshtehTahsiliId_fkey" FOREIGN KEY ("reshtehTahsiliId") REFERENCES "ReshtehTahsili"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dars_paye_reshteh" ADD CONSTRAINT "dars_paye_reshteh_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES "Paye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dars_paye_reshteh" ADD CONSTRAINT "dars_paye_reshteh_reshtehTadrisId_fkey" FOREIGN KEY ("reshtehTadrisId") REFERENCES "ReshtehTadris"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
