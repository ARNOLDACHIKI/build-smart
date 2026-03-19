-- AddColumn emailVerified to User
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- AddColumn emailVerificationToken to User  
ALTER TABLE "users" ADD COLUMN "emailVerificationToken" TEXT;

-- AddColumn emailVerificationExpiry to User
ALTER TABLE "users" ADD COLUMN "emailVerificationExpiry" TIMESTAMP(3);

-- AddColumn emailVerificationSent to User
ALTER TABLE "users" ADD COLUMN "emailVerificationSent" TIMESTAMP(3);

-- Create index on emailVerificationToken for faster lookups
CREATE INDEX "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");

-- Create index on emailVerified for filtering verified users
CREATE INDEX "users_emailVerified_idx" ON "users"("emailVerified");
