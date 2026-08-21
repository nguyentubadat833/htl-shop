/*
  Warnings:

  - You are about to drop the column `externalLink` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "externalLink",
ADD COLUMN     "external_link" TEXT;
