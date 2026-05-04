CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "role" VARCHAR(80) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");
CREATE INDEX "roles_code_is_active_idx" ON "roles"("code", "is_active");

ALTER TABLE "users" ADD COLUMN "role_id" BIGINT;

INSERT INTO "roles" ("role", "code", "description", "is_active", "is_system")
SELECT 'Free Client', 'CLIENT_FREE', 'Basic client', true, true
WHERE NOT EXISTS (
  SELECT 1
  FROM "roles"
  WHERE "code" = 'CLIENT_FREE'
);

INSERT INTO "roles" ("role", "code", "description", "is_active", "is_system")
SELECT 'Pro client', 'CLIENT_PRO', 'Pro client', true, true
WHERE NOT EXISTS (
  SELECT 1
  FROM "roles"
  WHERE "code" = 'CLIENT_PRO'
);

INSERT INTO "roles" ("role", "code", "description", "is_active", "is_system")
SELECT 'admin', 'ADMIN', 'Administrator role', true, true
WHERE NOT EXISTS (
  SELECT 1
  FROM "roles"
  WHERE "code" = 'ADMIN'
);

UPDATE "users"
SET "role_id" = (
  SELECT "id"
  FROM "roles"
  WHERE "code" = 'CLIENT_FREE'
)
WHERE "role_id" IS NULL;

ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;

CREATE INDEX "users_role_id_idx" ON "users"("role_id");

ALTER TABLE "users"
ADD CONSTRAINT "users_role_id_fkey"
FOREIGN KEY ("role_id") REFERENCES "roles"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
