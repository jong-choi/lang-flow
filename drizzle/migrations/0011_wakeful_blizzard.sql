ALTER TABLE "workflow_shares" ALTER COLUMN "summary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_shares" ADD COLUMN "price_in_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "license_type";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "price_in_cents";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "visibility";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "demo_url";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "highlights";--> statement-breakpoint
ALTER TABLE "workflow_shares" DROP COLUMN "published_at";--> statement-breakpoint
DROP TYPE "public"."workflow_share_license_type";--> statement-breakpoint
DROP TYPE "public"."workflow_share_visibility";