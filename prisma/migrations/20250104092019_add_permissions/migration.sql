/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_userId_fkey";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Permission_userId_idx" ON "Permission"("userId");

-- CreateIndex
CREATE INDEX "Permission_moduleId_idx" ON "Permission"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
