/*
  Warnings:

  - Added the required column `plan` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductPlan" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "plan" "ProductPlan" NOT NULL;
