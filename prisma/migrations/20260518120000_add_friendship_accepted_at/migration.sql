ALTER TABLE "friendships" ADD COLUMN "accepted_at" TIMESTAMP(3);

UPDATE "friendships"
SET "accepted_at" = "updated_at"
WHERE "status" = 'ACCEPTED' AND "accepted_at" IS NULL;

CREATE INDEX "friendships_requester_id_status_accepted_at_idx" ON "friendships"("requester_id", "status", "accepted_at");

CREATE INDEX "friendships_addressee_id_status_accepted_at_idx" ON "friendships"("addressee_id", "status", "accepted_at");
