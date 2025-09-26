ALTER TABLE "credit_histories" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."credit_history_type";--> statement-breakpoint
CREATE TYPE "public"."credit_history_type" AS ENUM('charge', 'consume', 'skip');--> statement-breakpoint
ALTER TABLE "credit_histories" ALTER COLUMN "type" SET DATA TYPE "public"."credit_history_type" USING "type"::"public"."credit_history_type";