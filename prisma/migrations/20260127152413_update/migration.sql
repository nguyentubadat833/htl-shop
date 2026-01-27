/*
  Warnings:

  - You are about to drop the `product_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_product_id_fkey";

-- DropTable
DROP TABLE "product_category";
