/*
  Warnings:

  - You are about to drop the `DefineOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DefineOption";

-- CreateTable
CREATE TABLE "define_option" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "define_option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "define_option_publicId_key" ON "define_option"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "define_option_key_value_key" ON "define_option"("key", "value");
