/*
  Warnings:

  - Added the required column `size` to the `ObjectStorage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ObjectStorage" ADD COLUMN     "size" BIGINT NOT NULL;
