/*
  Warnings:

  - You are about to drop the column `social_links` on the `MaterialProvider` table. All the data in the column will be lost.
  - You are about to drop the column `social_links` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MaterialProvider" DROP COLUMN "social_links",
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "twitter" TEXT;

-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "social_links",
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "twitter" TEXT;
