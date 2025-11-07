/*
  Warnings:

  - You are about to drop the `DefineVale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DefineVale";

-- CreateTable
CREATE TABLE "DefineOption" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "DefineOption_pkey" PRIMARY KEY ("id")
);
