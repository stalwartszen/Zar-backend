-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "HomeOwner" DROP CONSTRAINT "HomeOwner_userId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialProvider" DROP CONSTRAINT "MaterialProvider_userId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceProvider" DROP CONSTRAINT "ServiceProvider_userId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "HomeOwner" ADD CONSTRAINT "HomeOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialProvider" ADD CONSTRAINT "MaterialProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
