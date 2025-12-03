CREATE TABLE "exercise_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"exercise" varchar(100) NOT NULL,
	"weight" numeric(6, 2) NOT NULL,
	"reps" integer NOT NULL,
	"sets" integer DEFAULT 1,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_exercise_logs_client_id" ON "exercise_logs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_exercise_logs_exercise" ON "exercise_logs" USING btree ("exercise");--> statement-breakpoint
CREATE INDEX "idx_exercise_logs_created" ON "exercise_logs" USING btree ("created_at");