CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"hashedPassword" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
