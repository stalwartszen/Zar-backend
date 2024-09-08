/*
  Warnings:

  - Added the required column `city` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryId` to the `MaterialProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaterialProvider" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "pincode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "subcategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "pincode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MaterialProvider" ADD CONSTRAINT "MaterialProvider_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
