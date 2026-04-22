CREATE TABLE "audio_global_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" text DEFAULT 'default',
	"description" text,
	"config" jsonb NOT NULL,
	"updateSource" text DEFAULT 'local' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asr_entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL,
	"updateSource" text DEFAULT 'local' NOT NULL,
	"userId" text
);
