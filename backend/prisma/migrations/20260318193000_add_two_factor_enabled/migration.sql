-- Add persistent 2FA toggle state for users
ALTER TABLE "users"
ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
