/*
  Warnings:

  - You are about to drop the column `intrest` on the `HomeOwner` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `subCategoryId` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `ServiceProvider` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nodeId` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodeId` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialProvider" DROP CONSTRAINT "MaterialProvider_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialProvider" DROP CONSTRAINT "MaterialProvider_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceProvider" DROP CONSTRAINT "ServiceProvider_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceProvider" DROP CONSTRAINT "ServiceProvider_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_parentCategoryId_fkey";

-- AlterTable
ALTER TABLE "HomeOwner" DROP COLUMN "intrest",
ADD COLUMN     "interest" TEXT;

-- AlterTable
ALTER TABLE "MaterialProvider" DROP COLUMN "categoryId",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "linkedin",
DROP COLUMN "pincode",
DROP COLUMN "state",
DROP COLUMN "subcategoryId",
DROP COLUMN "twitter",
ADD COLUMN     "nodeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "categoryId",
DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "linkedin",
DROP COLUMN "subCategoryId",
DROP COLUMN "twitter",
ADD COLUMN     "nodeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "SubCategory";

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "background_img" TEXT,
    "parentId" TEXT,
    "isService" BOOLEAN NOT NULL DEFAULT false,
    "serviceTypeId" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialProvider" ADD CONSTRAINT "MaterialProvider_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
