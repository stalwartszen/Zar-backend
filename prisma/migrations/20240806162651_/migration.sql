/*
  Warnings:

  - You are about to drop the column `porfile_gallery` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "porfile_gallery",
ADD COLUMN     "gallery" TEXT[];
