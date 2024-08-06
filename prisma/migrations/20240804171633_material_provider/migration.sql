/*
  Warnings:

  - Added the required column `subCategoryId` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryId` on table `MaterialProvider` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MaterialProvider" DROP CONSTRAINT "MaterialProvider_categoryId_fkey";

-- AlterTable
ALTER TABLE "MaterialProvider" ADD COLUMN     "subCategoryId" TEXT NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MaterialProvider" ADD CONSTRAINT "MaterialProvider_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialProvider" ADD CONSTRAINT "MaterialProvider_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
