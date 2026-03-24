-- Persist user-managed team members for dashboard collaboration actions
CREATE TABLE "team_members" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "projects" INTEGER NOT NULL DEFAULT 0,
  "avatar" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "team_members_ownerId_createdAt_idx" ON "team_members"("ownerId", "createdAt");

ALTER TABLE "team_members"
ADD CONSTRAINT "team_members_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
