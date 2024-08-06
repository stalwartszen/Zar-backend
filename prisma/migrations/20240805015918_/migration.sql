/*
  Warnings:

  - You are about to drop the column `category` on the `ServiceProvider` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
