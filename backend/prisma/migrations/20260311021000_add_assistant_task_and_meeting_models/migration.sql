CREATE TABLE IF NOT EXISTS "assistant_tasks" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "context" TEXT,
  "dueDate" TIMESTAMP(3),
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assistant_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "assistant_meetings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "participant" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assistant_meetings_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "assistant_tasks"
    ADD CONSTRAINT "assistant_tasks_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "assistant_meetings"
    ADD CONSTRAINT "assistant_meetings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "assistant_tasks_userId_status_dueDate_idx" ON "assistant_tasks"("userId", "status", "dueDate");
CREATE INDEX IF NOT EXISTS "assistant_meetings_userId_scheduledFor_status_idx" ON "assistant_meetings"("userId", "scheduledFor", "status");
