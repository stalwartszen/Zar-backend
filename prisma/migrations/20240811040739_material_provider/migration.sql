/*
  Warnings:

  - You are about to drop the column `brand_name` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `company_address` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `company_name` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `contact_person` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `project_img` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `subCategoryId` on the `MaterialProvider` table. All the data in the column will be lost.
  - Added the required column `firm_address` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firm_name` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_doc` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_pic` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MaterialProvider" DROP CONSTRAINT "MaterialProvider_subCategoryId_fkey";

-- AlterTable
ALTER TABLE "MaterialProvider" DROP COLUMN "brand_name",
DROP COLUMN "company_address",
DROP COLUMN "company_name",
DROP COLUMN "contact_person",
DROP COLUMN "project_img",
DROP COLUMN "subCategoryId",
ADD COLUMN     "firm_address" TEXT NOT NULL,
ADD COLUMN     "firm_name" TEXT NOT NULL,
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "profile_doc" TEXT NOT NULL,
ADD COLUMN     "profile_pic" TEXT NOT NULL,
ADD COLUMN     "social_links" TEXT[];
