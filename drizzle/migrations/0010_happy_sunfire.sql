CREATE TYPE "public"."workflow_license_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."workflow_share_license_type" AS ENUM('community', 'team', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."workflow_share_visibility" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TABLE "workflow_license_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"share_id" text NOT NULL,
	"requester_id" text NOT NULL,
	"status" "workflow_license_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"description" text,
	"license_type" "workflow_share_license_type" DEFAULT 'community' NOT NULL,
	"price_in_cents" integer DEFAULT 0 NOT NULL,
	"visibility" "workflow_share_visibility" DEFAULT 'public' NOT NULL,
	"thumbnail_url" text,
	"demo_url" text,
	"tags" jsonb,
	"highlights" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "workflow_license_requests" ADD CONSTRAINT "workflow_license_requests_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_license_requests" ADD CONSTRAINT "workflow_license_requests_share_id_workflow_shares_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."workflow_shares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_license_requests" ADD CONSTRAINT "workflow_license_requests_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_shares" ADD CONSTRAINT "workflow_shares_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_shares" ADD CONSTRAINT "workflow_shares_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_license_requests_unique" ON "workflow_license_requests" USING btree ("share_id","requester_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_shares_workflow_unique" ON "workflow_shares" USING btree ("workflow_id");