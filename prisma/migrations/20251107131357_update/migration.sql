-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "info" JSONB;

-- CreateTable
CREATE TABLE "DefineVale" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "DefineVale_pkey" PRIMARY KEY ("id")
);
