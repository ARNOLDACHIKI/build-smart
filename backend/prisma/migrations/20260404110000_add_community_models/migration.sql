-- Community content models for posts, updates, ads, and moderation reports

CREATE TABLE "community_posts" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "postType" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "interests" TEXT[] NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_updates" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "pinnedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_updates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_ads" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "copy" TEXT NOT NULL,
  "ctaUrl" TEXT NOT NULL,
  "targetFields" TEXT[] NOT NULL,
  "targetRoles" "UserRole"[] NOT NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "approvedAt" TIMESTAMP(3),
  "approvedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_ads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_post_reports" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "community_post_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_posts_isPublished_createdAt_idx" ON "community_posts"("isPublished", "createdAt");
CREATE INDEX "community_updates_isPublished_isPinned_createdAt_idx" ON "community_updates"("isPublished", "isPinned", "createdAt");
CREATE INDEX "community_ads_isApproved_createdAt_idx" ON "community_ads"("isApproved", "createdAt");
CREATE INDEX "community_post_reports_postId_status_idx" ON "community_post_reports"("postId", "status");
CREATE INDEX "community_post_reports_reporterId_createdAt_idx" ON "community_post_reports"("reporterId", "createdAt");
