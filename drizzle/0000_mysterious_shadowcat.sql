CREATE TABLE "client_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"xors_user_id" varchar(255) NOT NULL,
	"xors_api_key" varchar(255),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"sessions_remaining" integer DEFAULT 0 NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"goals" text,
	"current_weight" numeric(6, 2),
	"target_weight" numeric(6, 2),
	"last_session_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_xors_user_id_unique" UNIQUE("xors_user_id")
);
--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_client_notes_client_id" ON "client_notes" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_clients_xors_user_id" ON "clients" USING btree ("xors_user_id");--> statement-breakpoint
CREATE INDEX "idx_clients_email" ON "clients" USING btree ("email");