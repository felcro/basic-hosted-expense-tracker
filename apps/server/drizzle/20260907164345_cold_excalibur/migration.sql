CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(12,2) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "name_idx" ON "expenses" ("user_id");