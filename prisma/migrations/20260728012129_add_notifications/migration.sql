-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_ACCEPTED', 'MESSAGE_RECEIVED', 'EVENT_CREATED', 'EVENT_UPDATED', 'MEETUP_REMINDER', 'ACHIEVEMENT_UNLOCKED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "receiver_user_id" BIGINT NOT NULL,
    "triggered_by_user_id" BIGINT,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_receiver_user_id_read_at_created_at_idx" ON "notifications"("receiver_user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "notifications_receiver_user_id_created_at_idx" ON "notifications"("receiver_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_receiver_user_id_fkey" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_triggered_by_user_id_fkey" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
