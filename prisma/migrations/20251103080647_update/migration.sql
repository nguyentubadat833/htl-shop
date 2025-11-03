/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_alias_key" ON "Product"("alias");
