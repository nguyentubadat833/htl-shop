/*
  Warnings:

  - The primary key for the `Cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `status` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Cart` table. All the data in the column will be lost.
  - The `id` column on the `Cart` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_CartToProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_CartToProduct" DROP CONSTRAINT "_CartToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CartToProduct" DROP CONSTRAINT "_CartToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_pkey",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "productId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Cart_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."_CartToProduct";

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
