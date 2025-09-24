CREATE TABLE "account_upgrades" (
  "token" text PRIMARY KEY NOT NULL,
  "from_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
