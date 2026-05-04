-- Add the new catalog code column as nullable first so existing rows can be backfilled safely.
ALTER TABLE "lang" ADD COLUMN "code" VARCHAR(10);

-- Backfill known existing rows when they are already present.
UPDATE "lang"
SET "code" = CASE
  WHEN "language" = 'Spanish' THEN 'ES'
  WHEN "language" = 'English' THEN 'EN'
  ELSE "code"
END
WHERE "code" IS NULL;

-- Seed the base language catalog idempotently.
INSERT INTO "lang" ("language", "code")
SELECT 'Spanish', 'ES'
WHERE NOT EXISTS (
  SELECT 1
  FROM "lang"
  WHERE "code" = 'ES' OR "language" = 'Spanish'
);

INSERT INTO "lang" ("language", "code")
SELECT 'English', 'EN'
WHERE NOT EXISTS (
  SELECT 1
  FROM "lang"
  WHERE "code" = 'EN' OR "language" = 'English'
);

-- For any pre-existing rows that still have no code, derive a deterministic fallback.
UPDATE "lang"
SET "code" = CONCAT('LANG_', "id"::text)
WHERE "code" IS NULL;

ALTER TABLE "lang" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "lang_code_key" ON "lang"("code");
