CREATE TYPE "user_color_theme" AS ENUM ('LIGHT', 'DARK');

CREATE TABLE "user_settings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "color_theme" "user_color_theme" NOT NULL DEFAULT 'LIGHT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "user_settings" ("user_id", "color_theme", "updated_at")
SELECT "id", 'LIGHT', CURRENT_TIMESTAMP
FROM "users"
ON CONFLICT DO NOTHING;

CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

ALTER TABLE "user_settings"
ADD CONSTRAINT "user_settings_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
