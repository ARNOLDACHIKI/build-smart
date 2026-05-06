-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'REQUESTED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "payerName" TEXT NOT NULL,
    "payerEmail" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "merchantRequestId" TEXT,
    "checkoutRequestId" TEXT,
    "mpesaReceiptNumber" TEXT,
    "resultCode" INTEGER,
    "resultDescription" TEXT,
    "callbackPayload" JSONB,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "subscriptionPlanKey" TEXT;
ALTER TABLE "users" ADD COLUMN "subscriptionPlanName" TEXT;
ALTER TABLE "users" ADD COLUMN "subscriptionBillingCycle" TEXT;
ALTER TABLE "users" ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';
ALTER TABLE "users" ADD COLUMN "subscriptionActivatedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "subscriptionExpiresAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "subscriptionLastPaymentId" TEXT;

-- CreateIndex
CREATE INDEX "payment_transactions_checkoutRequestId_idx" ON "payment_transactions"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "payment_transactions_merchantRequestId_idx" ON "payment_transactions"("merchantRequestId");

-- CreateIndex
CREATE INDEX "payment_transactions_phoneNumber_createdAt_idx" ON "payment_transactions"("phoneNumber", "createdAt");

-- CreateIndex
CREATE INDEX "payment_transactions_status_createdAt_idx" ON "payment_transactions"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;