-- Community spaces, memberships, and invitations

CREATE TYPE "CommunityJoinPolicy" AS ENUM ('OPEN', 'APPROVAL', 'INVITE_ONLY');
CREATE TYPE "CommunityMemberRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');
CREATE TYPE "CommunityMembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'INVITED');
CREATE TYPE "CommunityInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

CREATE TABLE "community_spaces" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "joinPolicy" "CommunityJoinPolicy" NOT NULL DEFAULT 'OPEN',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_spaces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_memberships" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
  "status" "CommunityMembershipStatus" NOT NULL DEFAULT 'PENDING',
  "invitedById" TEXT,
  "requestedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "joinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_invitations" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "email" TEXT,
  "invitedById" TEXT NOT NULL,
  "inviteeUserId" TEXT,
  "status" "CommunityInvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_invitations_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "community_posts"
ADD COLUMN "communitySpaceId" TEXT;

CREATE UNIQUE INDEX "community_spaces_slug_key" ON "community_spaces"("slug");
CREATE INDEX "community_spaces_ownerId_joinPolicy_createdAt_idx" ON "community_spaces"("ownerId", "joinPolicy", "createdAt");
CREATE INDEX "community_memberships_spaceId_status_createdAt_idx" ON "community_memberships"("spaceId", "status", "createdAt");
CREATE INDEX "community_memberships_userId_status_idx" ON "community_memberships"("userId", "status");
CREATE UNIQUE INDEX "community_memberships_spaceId_userId_key" ON "community_memberships"("spaceId", "userId");
CREATE INDEX "community_invitations_spaceId_status_createdAt_idx" ON "community_invitations"("spaceId", "status", "createdAt");
CREATE INDEX "community_invitations_email_status_idx" ON "community_invitations"("email", "status");
CREATE UNIQUE INDEX "community_invitations_token_key" ON "community_invitations"("token");
CREATE INDEX "community_posts_communitySpaceId_createdAt_idx" ON "community_posts"("communitySpaceId", "createdAt");

ALTER TABLE "community_spaces"
ADD CONSTRAINT "community_spaces_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_memberships"
ADD CONSTRAINT "community_memberships_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "community_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_memberships"
ADD CONSTRAINT "community_memberships_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_memberships"
ADD CONSTRAINT "community_memberships_invitedById_fkey"
FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "community_invitations"
ADD CONSTRAINT "community_invitations_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "community_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_invitations"
ADD CONSTRAINT "community_invitations_invitedById_fkey"
FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_invitations"
ADD CONSTRAINT "community_invitations_inviteeUserId_fkey"
FOREIGN KEY ("inviteeUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "community_posts"
ADD CONSTRAINT "community_posts_communitySpaceId_fkey"
FOREIGN KEY ("communitySpaceId") REFERENCES "community_spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
