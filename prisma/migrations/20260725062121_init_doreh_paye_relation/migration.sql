-- CreateTable
CREATE TABLE "_DoreTahsiliToPaye" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DoreTahsiliToPaye_AB_unique" ON "_DoreTahsiliToPaye"("A", "B");

-- CreateIndex
CREATE INDEX "_DoreTahsiliToPaye_B_index" ON "_DoreTahsiliToPaye"("B");

-- AddForeignKey
ALTER TABLE "_DoreTahsiliToPaye" ADD CONSTRAINT "_DoreTahsiliToPaye_A_fkey" FOREIGN KEY ("A") REFERENCES "DoreTahsili"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoreTahsiliToPaye" ADD CONSTRAINT "_DoreTahsiliToPaye_B_fkey" FOREIGN KEY ("B") REFERENCES "Paye"("id") ON DELETE CASCADE ON UPDATE CASCADE;
