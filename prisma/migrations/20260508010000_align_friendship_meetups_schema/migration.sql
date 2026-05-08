-- CreateEnum
CREATE TYPE "meetup_status" AS ENUM ('CANDIDATE', 'ACTIVE', 'FINISHED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "challenge_status" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- DropIndex
DROP INDEX "roles_code_is_active_idx";

-- DropIndex
DROP INDEX "users_role_id_idx";

-- AlterTable
ALTER TABLE "lang" ALTER COLUMN "code" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "is_system",
DROP COLUMN "updated_at",
ALTER COLUMN "role" SET DATA TYPE TEXT,
ALTER COLUMN "code" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location_sharing_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "countries" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "iso3" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetups" (
    "id" BIGSERIAL NOT NULL,
    "user_a_id" BIGINT NOT NULL,
    "user_b_id" BIGINT NOT NULL,
    "country_id" BIGINT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "min_distance_meters" DOUBLE PRECISION,
    "avg_distance_meters" DOUBLE PRECISION,
    "city" TEXT,
    "place_name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "meetup_status" NOT NULL DEFAULT 'CANDIDATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetup_location_points" (
    "id" BIGSERIAL NOT NULL,
    "meetup_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetup_location_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship_stats" (
    "id" BIGSERIAL NOT NULL,
    "user_a_id" BIGINT NOT NULL,
    "user_b_id" BIGINT NOT NULL,
    "total_meetups" INTEGER NOT NULL DEFAULT 0,
    "total_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "total_distance_meters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "first_meetup_at" TIMESTAMP(3),
    "last_meetup_at" TIMESTAMP(3),
    "longest_meetup_seconds" INTEGER NOT NULL DEFAULT 0,
    "current_streak_days" INTEGER NOT NULL DEFAULT 0,
    "best_streak_days" INTEGER NOT NULL DEFAULT 0,
    "streak_last_date" DATE,
    "friendship_level" INTEGER NOT NULL DEFAULT 1,
    "friendship_xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendship_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship_period_stats" (
    "id" BIGSERIAL NOT NULL,
    "user_a_id" BIGINT NOT NULL,
    "user_b_id" BIGINT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "meetup_count" INTEGER NOT NULL DEFAULT 0,
    "total_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "total_distance_meters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendship_period_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship_frequent_places" (
    "id" BIGSERIAL NOT NULL,
    "user_a_id" BIGINT NOT NULL,
    "user_b_id" BIGINT NOT NULL,
    "place_name" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "meetup_count" INTEGER NOT NULL DEFAULT 0,
    "total_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "last_visited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendship_frequent_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "achievement_id" BIGINT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "related_user_id" BIGINT,
    "related_meetup_id" BIGINT,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "goal_value" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship_challenges" (
    "id" BIGSERIAL NOT NULL,
    "challenge_id" BIGINT NOT NULL,
    "user_a_id" BIGINT NOT NULL,
    "user_b_id" BIGINT NOT NULL,
    "status" "challenge_status" NOT NULL DEFAULT 'ACTIVE',
    "progress_value" INTEGER NOT NULL DEFAULT 0,
    "target_value" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendship_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendship_levels" (
    "id" BIGSERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "min_xp" INTEGER NOT NULL,
    "max_xp" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendship_levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso3_key" ON "countries"("iso3");

-- CreateIndex
CREATE INDEX "meetups_user_a_id_user_b_id_started_at_idx" ON "meetups"("user_a_id", "user_b_id", "started_at");

-- CreateIndex
CREATE INDEX "meetups_user_a_id_started_at_idx" ON "meetups"("user_a_id", "started_at");

-- CreateIndex
CREATE INDEX "meetups_user_b_id_started_at_idx" ON "meetups"("user_b_id", "started_at");

-- CreateIndex
CREATE INDEX "meetups_country_id_idx" ON "meetups"("country_id");

-- CreateIndex
CREATE INDEX "meetups_city_idx" ON "meetups"("city");

-- CreateIndex
CREATE INDEX "meetup_location_points_meetup_id_recorded_at_idx" ON "meetup_location_points"("meetup_id", "recorded_at");

-- CreateIndex
CREATE INDEX "meetup_location_points_user_id_recorded_at_idx" ON "meetup_location_points"("user_id", "recorded_at");

-- CreateIndex
CREATE INDEX "friendship_stats_total_meetups_idx" ON "friendship_stats"("total_meetups");

-- CreateIndex
CREATE INDEX "friendship_stats_total_duration_seconds_idx" ON "friendship_stats"("total_duration_seconds");

-- CreateIndex
CREATE INDEX "friendship_stats_friendship_level_idx" ON "friendship_stats"("friendship_level");

-- CreateIndex
CREATE UNIQUE INDEX "friendship_stats_user_a_id_user_b_id_key" ON "friendship_stats"("user_a_id", "user_b_id");

-- CreateIndex
CREATE INDEX "friendship_period_stats_user_a_id_period_type_period_start_idx" ON "friendship_period_stats"("user_a_id", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "friendship_period_stats_user_b_id_period_type_period_start_idx" ON "friendship_period_stats"("user_b_id", "period_type", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "friendship_period_stats_user_a_id_user_b_id_period_type_per_key" ON "friendship_period_stats"("user_a_id", "user_b_id", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "friendship_frequent_places_user_a_id_user_b_id_idx" ON "friendship_frequent_places"("user_a_id", "user_b_id");

-- CreateIndex
CREATE INDEX "friendship_frequent_places_city_idx" ON "friendship_frequent_places"("city");

-- CreateIndex
CREATE INDEX "friendship_frequent_places_meetup_count_idx" ON "friendship_frequent_places"("meetup_count");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_unlocked_at_idx" ON "user_achievements"("user_id", "unlocked_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_code_key" ON "challenges"("code");

-- CreateIndex
CREATE INDEX "friendship_challenges_user_a_id_user_b_id_status_idx" ON "friendship_challenges"("user_a_id", "user_b_id", "status");

-- CreateIndex
CREATE INDEX "friendship_challenges_challenge_id_status_idx" ON "friendship_challenges"("challenge_id", "status");

-- CreateIndex
CREATE INDEX "friendship_challenges_ends_at_idx" ON "friendship_challenges"("ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "friendship_levels_level_key" ON "friendship_levels"("level");

-- AddForeignKey
ALTER TABLE "meetups" ADD CONSTRAINT "meetups_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetups" ADD CONSTRAINT "meetups_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetups" ADD CONSTRAINT "meetups_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_location_points" ADD CONSTRAINT "meetup_location_points_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "meetups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_location_points" ADD CONSTRAINT "meetup_location_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_stats" ADD CONSTRAINT "friendship_stats_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_stats" ADD CONSTRAINT "friendship_stats_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_period_stats" ADD CONSTRAINT "friendship_period_stats_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_period_stats" ADD CONSTRAINT "friendship_period_stats_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_frequent_places" ADD CONSTRAINT "friendship_frequent_places_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_frequent_places" ADD CONSTRAINT "friendship_frequent_places_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_related_meetup_id_fkey" FOREIGN KEY ("related_meetup_id") REFERENCES "meetups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_challenges" ADD CONSTRAINT "friendship_challenges_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_challenges" ADD CONSTRAINT "friendship_challenges_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_challenges" ADD CONSTRAINT "friendship_challenges_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
