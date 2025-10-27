/*
  Warnings:

  - A unique constraint covering the columns `[bucket,objectName]` on the table `ObjectStorage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ObjectStorage_bucket_objectName_key" ON "ObjectStorage"("bucket", "objectName");
