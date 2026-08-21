/*
  Warnings:

  - You are about to drop the column `categoryId` on the `tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,category_id]` on the table `tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category_id` to the `tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_categoryId_fkey";

-- DropIndex
DROP INDEX "tag_name_categoryId_key";

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "categoryId",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_category_id_key" ON "tag"("name", "category_id");

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
