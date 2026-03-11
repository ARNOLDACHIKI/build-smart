ALTER TABLE "inquiries"
  ADD COLUMN IF NOT EXISTS "senderUserId" TEXT;

DO $$
BEGIN
  CREATE TYPE "AssistantChatRole" AS ENUM ('USER', 'ASSISTANT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "assistant_conversations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'New chat',
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assistant_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "assistant_conversation_messages" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "role" "AssistantChatRole" NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assistant_conversation_messages_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "inquiries"
    ADD CONSTRAINT "inquiries_senderUserId_fkey"
    FOREIGN KEY ("senderUserId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "assistant_conversations"
    ADD CONSTRAINT "assistant_conversations_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "assistant_conversation_messages"
    ADD CONSTRAINT "assistant_conversation_messages_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "assistant_conversations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "inquiries_senderUserId_idx" ON "inquiries"("senderUserId");
CREATE INDEX IF NOT EXISTS "assistant_conversations_userId_lastMessageAt_idx" ON "assistant_conversations"("userId", "lastMessageAt");
CREATE INDEX IF NOT EXISTS "assistant_conversation_messages_conversationId_createdAt_idx" ON "assistant_conversation_messages"("conversationId", "createdAt");
