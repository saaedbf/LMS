/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `ReshtehTadris` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReshtehTadris_title_key" ON "ReshtehTadris"("title");
