ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;
--> statement-breakpoint
UPDATE "users" SET "onboarding_completed" = false WHERE "onboarding_completed" IS NULL;
