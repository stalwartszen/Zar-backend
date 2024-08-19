/*
  Warnings:

  - You are about to drop the column `have_access` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `User` table. All the data in the column will be lost.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'LINKED', 'AUTHORIZED', 'VERIFIED', 'UNVERIFIED');

-- AlterTable
ALTER TABLE "HomeOwner" ADD COLUMN     "profile_pic" TEXT;

-- AlterTable
ALTER TABLE "MaterialProvider" ADD COLUMN     "brand_logo" TEXT;

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "brand_logo" TEXT;

-- AlterTable
ALTER TABLE "ServiceType" ADD COLUMN     "is_live" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "have_access",
DROP COLUMN "is_verified",
ADD COLUMN     "status" "Status" NOT NULL;
