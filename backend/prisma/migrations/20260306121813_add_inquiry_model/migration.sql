-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'READ', 'REPLIED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ENGINEER';

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "senderPhone" TEXT,
    "message" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
