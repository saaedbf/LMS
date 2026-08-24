-- CreateTable
CREATE TABLE "_DoreTahsiliToReshtehTahsili" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DoreTahsiliToReshtehTahsili_AB_unique" ON "_DoreTahsiliToReshtehTahsili"("A", "B");

-- CreateIndex
CREATE INDEX "_DoreTahsiliToReshtehTahsili_B_index" ON "_DoreTahsiliToReshtehTahsili"("B");

-- AddForeignKey
ALTER TABLE "_DoreTahsiliToReshtehTahsili" ADD CONSTRAINT "_DoreTahsiliToReshtehTahsili_A_fkey" FOREIGN KEY ("A") REFERENCES "DoreTahsili"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoreTahsiliToReshtehTahsili" ADD CONSTRAINT "_DoreTahsiliToReshtehTahsili_B_fkey" FOREIGN KEY ("B") REFERENCES "ReshtehTahsili"("id") ON DELETE CASCADE ON UPDATE CASCADE;
