CREATE TABLE IF NOT EXISTS "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"mission" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "live_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"operational_score" integer NOT NULL,
	"risk_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "live_metrics_operational_score_check" CHECK ("live_metrics"."operational_score" >= 0 AND "live_metrics"."operational_score" <= 100),
	CONSTRAINT "live_metrics_risk_score_check" CHECK ("live_metrics"."risk_score" >= 0 AND "live_metrics"."risk_score" <= 100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memory_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operational_risks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"severity" text NOT NULL,
	"probability" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "operational_risks_probability_check" CHECK ("operational_risks"."probability" >= 0 AND "operational_risks"."probability" <= 100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
