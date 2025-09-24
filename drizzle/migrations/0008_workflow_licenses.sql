CREATE TABLE "workflow_licenses" (
    "workflow_id" text NOT NULL,
    "user_id" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "workflow_licenses_workflow_id_user_id_pk" PRIMARY KEY("workflow_id", "user_id")
);
--> statement-breakpoint
ALTER TABLE "workflow_licenses" ADD CONSTRAINT "workflow_licenses_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workflow_licenses" ADD CONSTRAINT "workflow_licenses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
