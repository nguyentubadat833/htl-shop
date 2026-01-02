/*
  Warnings:

  - A unique constraint covering the columns `[key,value]` on the table `DefineOption` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DefineOption_key_value_key" ON "DefineOption"("key", "value");
