-- Persist company registration metadata on user profiles
ALTER TABLE "users"
ADD COLUMN "registrationNo" TEXT,
ADD COLUMN "industry" TEXT;