/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_moduleId_idx";

-- DropIndex
DROP INDEX "Permission_userId_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- 修改 Permission 表
ALTER TABLE "Permission" DROP CONSTRAINT IF EXISTS "Permission_pkey";
ALTER TABLE "Permission" ALTER COLUMN "id" SET DATA TYPE TEXT;
ALTER TABLE "Permission" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");
