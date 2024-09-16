/*
  Warnings:

  - You are about to drop the column `categoryId` on the `SubCategory` table. All the data in the column will be lost.
  - Added the required column `parentCategoryId` to the `SubCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "subCategoryId" TEXT;

-- AlterTable
ALTER TABLE "SubCategory" DROP COLUMN "categoryId",
ADD COLUMN     "parentCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
