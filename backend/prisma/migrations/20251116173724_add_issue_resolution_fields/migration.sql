/*
  Warnings:

  - The `role` column on the `Staff` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedById" INTEGER;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STAFF';

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
