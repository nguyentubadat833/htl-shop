/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `ObjectStorage` table. All the data in the column will be lost.
  - Added the required column `type` to the `ObjectStorage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'DESIGN');

-- AlterTable
ALTER TABLE "ObjectStorage" DROP COLUMN "thumbnail",
ADD COLUMN     "type" "FileType" NOT NULL;
