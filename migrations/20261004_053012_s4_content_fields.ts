import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_faq_list_category" AS ENUM('general', 'availability', 'privacy', 'pricing', 'team', 'coach', 'parent', 'support');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_list_category" AS ENUM('general', 'availability', 'privacy', 'pricing', 'team', 'coach', 'parent', 'support');
  CREATE TYPE "public"."enum_features_personas" AS ENUM('player', 'captain', 'member', 'coach', 'parent');
  CREATE TYPE "public"."enum_features_demo" AS ENUM('none', 'voice-typer', 'quick-log', 'heat-grid', 'kinetic-transcript', 'series-chart', 'squad-grid', 'm-stroke');
  CREATE TYPE "public"."enum__features_v_version_personas" AS ENUM('player', 'captain', 'member', 'coach', 'parent');
  CREATE TYPE "public"."enum__features_v_version_demo" AS ENUM('none', 'voice-typer', 'quick-log', 'heat-grid', 'kinetic-transcript', 'series-chart', 'squad-grid', 'm-stroke');
  CREATE TYPE "public"."enum_faqs_personas" AS ENUM('player', 'captain', 'member', 'coach', 'parent');
  CREATE TYPE "public"."enum__faqs_v_version_personas" AS ENUM('player', 'captain', 'member', 'coach', 'parent');
  CREATE TABLE "pages_blocks_pricing_table_plans_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price_label" varchar,
  	"period" varchar,
  	"summary" varchar,
  	"highlight" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_pricing_table_addons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price_label" varchar,
  	"period" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table_comparison_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"row" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"category" "enum_pages_blocks_faq_list_category",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"synthetic_label" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_two_column" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left" jsonb,
  	"right" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_legal_index" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_plans_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price_label" varchar,
  	"period" varchar,
  	"summary" varchar,
  	"highlight" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_addons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price_label" varchar,
  	"period" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_comparison_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"row" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"category" "enum__pages_v_blocks_faq_list_category",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"synthetic_label" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_two_column" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left" jsonb,
  	"right" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_legal_index" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "features_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "features_personas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_features_personas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "features_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"features_id" integer
  );
  
  CREATE TABLE "_features_v_version_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_features_v_version_personas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__features_v_version_personas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_features_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"features_id" integer
  );
  
  CREATE TABLE "personas_proof_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "personas_lead_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "personas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"features_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "_personas_v_version_proof_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_personas_v_version_lead_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_personas_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"features_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "_posts_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "faqs_personas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_faqs_personas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_faqs_v_version_personas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__faqs_v_version_personas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "features" ADD COLUMN "how_it_works" varchar;
  ALTER TABLE "features" ADD COLUMN "scenario_persona" varchar;
  ALTER TABLE "features" ADD COLUMN "scenario_text" varchar;
  ALTER TABLE "features" ADD COLUMN "copy_rules" varchar;
  ALTER TABLE "features" ADD COLUMN "demo" "enum_features_demo" DEFAULT 'none';
  ALTER TABLE "features" ADD COLUMN "media_id" integer;
  ALTER TABLE "features" ADD COLUMN "coming_soon_teaser" varchar;
  ALTER TABLE "_features_v" ADD COLUMN "version_how_it_works" varchar;
  ALTER TABLE "_features_v" ADD COLUMN "version_scenario_persona" varchar;
  ALTER TABLE "_features_v" ADD COLUMN "version_scenario_text" varchar;
  ALTER TABLE "_features_v" ADD COLUMN "version_copy_rules" varchar;
  ALTER TABLE "_features_v" ADD COLUMN "version_demo" "enum__features_v_version_demo" DEFAULT 'none';
  ALTER TABLE "_features_v" ADD COLUMN "version_media_id" integer;
  ALTER TABLE "_features_v" ADD COLUMN "version_coming_soon_teaser" varchar;
  ALTER TABLE "_features_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "personas" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "personas" ADD COLUMN "subcopy" varchar;
  ALTER TABLE "personas" ADD COLUMN "lead_heading" varchar;
  ALTER TABLE "personas" ADD COLUMN "lead_body" varchar;
  ALTER TABLE "_personas_v" ADD COLUMN "version_eyebrow" varchar;
  ALTER TABLE "_personas_v" ADD COLUMN "version_subcopy" varchar;
  ALTER TABLE "_personas_v" ADD COLUMN "version_lead_heading" varchar;
  ALTER TABLE "_personas_v" ADD COLUMN "version_lead_body" varchar;
  ALTER TABLE "posts" ADD COLUMN "author_name" varchar DEFAULT 'The StumpNote team';
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_name" varchar DEFAULT 'The StumpNote team';
  ALTER TABLE "_posts_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "faqs" ADD COLUMN "slug" varchar;
  ALTER TABLE "_faqs_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "pages_blocks_pricing_table_plans_bullets" ADD CONSTRAINT "pages_blocks_pricing_table_plans_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_plans" ADD CONSTRAINT "pages_blocks_pricing_table_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_addons" ADD CONSTRAINT "pages_blocks_pricing_table_addons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_comparison_values" ADD CONSTRAINT "pages_blocks_pricing_table_comparison_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_comparison" ADD CONSTRAINT "pages_blocks_pricing_table_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table_notes" ADD CONSTRAINT "pages_blocks_pricing_table_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_table" ADD CONSTRAINT "pages_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_list" ADD CONSTRAINT "pages_blocks_faq_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_two_column" ADD CONSTRAINT "pages_blocks_two_column_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_legal_index" ADD CONSTRAINT "pages_blocks_legal_index_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_plans_bullets" ADD CONSTRAINT "_pages_v_blocks_pricing_table_plans_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_plans" ADD CONSTRAINT "_pages_v_blocks_pricing_table_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_addons" ADD CONSTRAINT "_pages_v_blocks_pricing_table_addons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_comparison_values" ADD CONSTRAINT "_pages_v_blocks_pricing_table_comparison_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_comparison" ADD CONSTRAINT "_pages_v_blocks_pricing_table_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table_notes" ADD CONSTRAINT "_pages_v_blocks_pricing_table_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_table" ADD CONSTRAINT "_pages_v_blocks_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_list" ADD CONSTRAINT "_pages_v_blocks_faq_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_two_column" ADD CONSTRAINT "_pages_v_blocks_two_column_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_legal_index" ADD CONSTRAINT "_pages_v_blocks_legal_index_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_bullets" ADD CONSTRAINT "features_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_personas" ADD CONSTRAINT "features_personas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_rels" ADD CONSTRAINT "features_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features_rels" ADD CONSTRAINT "features_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_features_v_version_bullets" ADD CONSTRAINT "_features_v_version_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_features_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_features_v_version_personas" ADD CONSTRAINT "_features_v_version_personas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_features_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_features_v_rels" ADD CONSTRAINT "_features_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_features_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_features_v_rels" ADD CONSTRAINT "_features_v_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_proof_points" ADD CONSTRAINT "personas_proof_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_lead_items" ADD CONSTRAINT "personas_lead_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_rels" ADD CONSTRAINT "personas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_rels" ADD CONSTRAINT "personas_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "personas_rels" ADD CONSTRAINT "personas_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_personas_v_version_proof_points" ADD CONSTRAINT "_personas_v_version_proof_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_personas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_personas_v_version_lead_items" ADD CONSTRAINT "_personas_v_version_lead_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_personas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_personas_v_rels" ADD CONSTRAINT "_personas_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_personas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_personas_v_rels" ADD CONSTRAINT "_personas_v_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_personas_v_rels" ADD CONSTRAINT "_personas_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_tags" ADD CONSTRAINT "posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_tags" ADD CONSTRAINT "_posts_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_personas" ADD CONSTRAINT "faqs_personas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v_version_personas" ADD CONSTRAINT "_faqs_v_version_personas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_faqs_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_pricing_table_plans_bullets_order_idx" ON "pages_blocks_pricing_table_plans_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_plans_bullets_parent_id_idx" ON "pages_blocks_pricing_table_plans_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_plans_order_idx" ON "pages_blocks_pricing_table_plans" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_plans_parent_id_idx" ON "pages_blocks_pricing_table_plans" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_addons_order_idx" ON "pages_blocks_pricing_table_addons" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_addons_parent_id_idx" ON "pages_blocks_pricing_table_addons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_comparison_values_order_idx" ON "pages_blocks_pricing_table_comparison_values" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_comparison_values_parent_id_idx" ON "pages_blocks_pricing_table_comparison_values" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_comparison_order_idx" ON "pages_blocks_pricing_table_comparison" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_comparison_parent_id_idx" ON "pages_blocks_pricing_table_comparison" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_notes_order_idx" ON "pages_blocks_pricing_table_notes" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_notes_parent_id_idx" ON "pages_blocks_pricing_table_notes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_order_idx" ON "pages_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_table_parent_id_idx" ON "pages_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_table_path_idx" ON "pages_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_list_order_idx" ON "pages_blocks_faq_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_list_parent_id_idx" ON "pages_blocks_faq_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_list_path_idx" ON "pages_blocks_faq_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_two_column_order_idx" ON "pages_blocks_two_column" USING btree ("_order");
  CREATE INDEX "pages_blocks_two_column_parent_id_idx" ON "pages_blocks_two_column" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_two_column_path_idx" ON "pages_blocks_two_column" USING btree ("_path");
  CREATE INDEX "pages_blocks_legal_index_order_idx" ON "pages_blocks_legal_index" USING btree ("_order");
  CREATE INDEX "pages_blocks_legal_index_parent_id_idx" ON "pages_blocks_legal_index" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_legal_index_path_idx" ON "pages_blocks_legal_index" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_table_plans_bullets_order_idx" ON "_pages_v_blocks_pricing_table_plans_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_plans_bullets_parent_id_idx" ON "_pages_v_blocks_pricing_table_plans_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_plans_order_idx" ON "_pages_v_blocks_pricing_table_plans" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_plans_parent_id_idx" ON "_pages_v_blocks_pricing_table_plans" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_addons_order_idx" ON "_pages_v_blocks_pricing_table_addons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_addons_parent_id_idx" ON "_pages_v_blocks_pricing_table_addons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_comparison_values_order_idx" ON "_pages_v_blocks_pricing_table_comparison_values" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_comparison_values_parent_id_idx" ON "_pages_v_blocks_pricing_table_comparison_values" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_comparison_order_idx" ON "_pages_v_blocks_pricing_table_comparison" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_comparison_parent_id_idx" ON "_pages_v_blocks_pricing_table_comparison" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_notes_order_idx" ON "_pages_v_blocks_pricing_table_notes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_notes_parent_id_idx" ON "_pages_v_blocks_pricing_table_notes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_order_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_table_parent_id_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_table_path_idx" ON "_pages_v_blocks_pricing_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_list_order_idx" ON "_pages_v_blocks_faq_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_list_parent_id_idx" ON "_pages_v_blocks_faq_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_list_path_idx" ON "_pages_v_blocks_faq_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_two_column_order_idx" ON "_pages_v_blocks_two_column" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_two_column_parent_id_idx" ON "_pages_v_blocks_two_column" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_two_column_path_idx" ON "_pages_v_blocks_two_column" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_legal_index_order_idx" ON "_pages_v_blocks_legal_index" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_legal_index_parent_id_idx" ON "_pages_v_blocks_legal_index" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_legal_index_path_idx" ON "_pages_v_blocks_legal_index" USING btree ("_path");
  CREATE INDEX "features_bullets_order_idx" ON "features_bullets" USING btree ("_order");
  CREATE INDEX "features_bullets_parent_id_idx" ON "features_bullets" USING btree ("_parent_id");
  CREATE INDEX "features_personas_order_idx" ON "features_personas" USING btree ("order");
  CREATE INDEX "features_personas_parent_idx" ON "features_personas" USING btree ("parent_id");
  CREATE INDEX "features_rels_order_idx" ON "features_rels" USING btree ("order");
  CREATE INDEX "features_rels_parent_idx" ON "features_rels" USING btree ("parent_id");
  CREATE INDEX "features_rels_path_idx" ON "features_rels" USING btree ("path");
  CREATE INDEX "features_rels_features_id_idx" ON "features_rels" USING btree ("features_id");
  CREATE INDEX "_features_v_version_bullets_order_idx" ON "_features_v_version_bullets" USING btree ("_order");
  CREATE INDEX "_features_v_version_bullets_parent_id_idx" ON "_features_v_version_bullets" USING btree ("_parent_id");
  CREATE INDEX "_features_v_version_personas_order_idx" ON "_features_v_version_personas" USING btree ("order");
  CREATE INDEX "_features_v_version_personas_parent_idx" ON "_features_v_version_personas" USING btree ("parent_id");
  CREATE INDEX "_features_v_rels_order_idx" ON "_features_v_rels" USING btree ("order");
  CREATE INDEX "_features_v_rels_parent_idx" ON "_features_v_rels" USING btree ("parent_id");
  CREATE INDEX "_features_v_rels_path_idx" ON "_features_v_rels" USING btree ("path");
  CREATE INDEX "_features_v_rels_features_id_idx" ON "_features_v_rels" USING btree ("features_id");
  CREATE INDEX "personas_proof_points_order_idx" ON "personas_proof_points" USING btree ("_order");
  CREATE INDEX "personas_proof_points_parent_id_idx" ON "personas_proof_points" USING btree ("_parent_id");
  CREATE INDEX "personas_lead_items_order_idx" ON "personas_lead_items" USING btree ("_order");
  CREATE INDEX "personas_lead_items_parent_id_idx" ON "personas_lead_items" USING btree ("_parent_id");
  CREATE INDEX "personas_rels_order_idx" ON "personas_rels" USING btree ("order");
  CREATE INDEX "personas_rels_parent_idx" ON "personas_rels" USING btree ("parent_id");
  CREATE INDEX "personas_rels_path_idx" ON "personas_rels" USING btree ("path");
  CREATE INDEX "personas_rels_features_id_idx" ON "personas_rels" USING btree ("features_id");
  CREATE INDEX "personas_rels_faqs_id_idx" ON "personas_rels" USING btree ("faqs_id");
  CREATE INDEX "_personas_v_version_proof_points_order_idx" ON "_personas_v_version_proof_points" USING btree ("_order");
  CREATE INDEX "_personas_v_version_proof_points_parent_id_idx" ON "_personas_v_version_proof_points" USING btree ("_parent_id");
  CREATE INDEX "_personas_v_version_lead_items_order_idx" ON "_personas_v_version_lead_items" USING btree ("_order");
  CREATE INDEX "_personas_v_version_lead_items_parent_id_idx" ON "_personas_v_version_lead_items" USING btree ("_parent_id");
  CREATE INDEX "_personas_v_rels_order_idx" ON "_personas_v_rels" USING btree ("order");
  CREATE INDEX "_personas_v_rels_parent_idx" ON "_personas_v_rels" USING btree ("parent_id");
  CREATE INDEX "_personas_v_rels_path_idx" ON "_personas_v_rels" USING btree ("path");
  CREATE INDEX "_personas_v_rels_features_id_idx" ON "_personas_v_rels" USING btree ("features_id");
  CREATE INDEX "_personas_v_rels_faqs_id_idx" ON "_personas_v_rels" USING btree ("faqs_id");
  CREATE INDEX "posts_tags_order_idx" ON "posts_tags" USING btree ("_order");
  CREATE INDEX "posts_tags_parent_id_idx" ON "posts_tags" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_tags_order_idx" ON "_posts_v_version_tags" USING btree ("_order");
  CREATE INDEX "_posts_v_version_tags_parent_id_idx" ON "_posts_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "faqs_personas_order_idx" ON "faqs_personas" USING btree ("order");
  CREATE INDEX "faqs_personas_parent_idx" ON "faqs_personas" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_personas_order_idx" ON "_faqs_v_version_personas" USING btree ("order");
  CREATE INDEX "_faqs_v_version_personas_parent_idx" ON "_faqs_v_version_personas" USING btree ("parent_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "features" ADD CONSTRAINT "features_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_features_v" ADD CONSTRAINT "_features_v_version_media_id_media_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_rels_faqs_id_idx" ON "pages_rels" USING btree ("faqs_id");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_faqs_id_idx" ON "_pages_v_rels" USING btree ("faqs_id");
  CREATE INDEX "features_media_idx" ON "features" USING btree ("media_id");
  CREATE INDEX "_features_v_version_version_media_idx" ON "_features_v" USING btree ("version_media_id");
  CREATE INDEX "_features_v_autosave_idx" ON "_features_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "faqs_slug_idx" ON "faqs" USING btree ("slug");
  CREATE INDEX "_faqs_v_version_version_slug_idx" ON "_faqs_v" USING btree ("version_slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_pricing_table_plans_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_table_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_table_addons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_table_comparison_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_table_comparison" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_table_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_two_column" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_legal_index" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table_plans_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table_addons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table_comparison_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table_comparison" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_two_column" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_legal_index" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "features_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "features_personas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "features_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_features_v_version_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_features_v_version_personas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_features_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "personas_proof_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "personas_lead_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "personas_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_personas_v_version_proof_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_personas_v_version_lead_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_personas_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs_personas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faqs_v_version_personas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_pricing_table_plans_bullets" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_plans" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_addons" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_comparison_values" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_comparison" CASCADE;
  DROP TABLE "pages_blocks_pricing_table_notes" CASCADE;
  DROP TABLE "pages_blocks_pricing_table" CASCADE;
  DROP TABLE "pages_blocks_faq_list" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_two_column" CASCADE;
  DROP TABLE "pages_blocks_legal_index" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_plans_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_plans" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_addons" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_comparison_values" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_comparison" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table_notes" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_table" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_list" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_two_column" CASCADE;
  DROP TABLE "_pages_v_blocks_legal_index" CASCADE;
  DROP TABLE "features_bullets" CASCADE;
  DROP TABLE "features_personas" CASCADE;
  DROP TABLE "features_rels" CASCADE;
  DROP TABLE "_features_v_version_bullets" CASCADE;
  DROP TABLE "_features_v_version_personas" CASCADE;
  DROP TABLE "_features_v_rels" CASCADE;
  DROP TABLE "personas_proof_points" CASCADE;
  DROP TABLE "personas_lead_items" CASCADE;
  DROP TABLE "personas_rels" CASCADE;
  DROP TABLE "_personas_v_version_proof_points" CASCADE;
  DROP TABLE "_personas_v_version_lead_items" CASCADE;
  DROP TABLE "_personas_v_rels" CASCADE;
  DROP TABLE "posts_tags" CASCADE;
  DROP TABLE "_posts_v_version_tags" CASCADE;
  DROP TABLE "faqs_personas" CASCADE;
  DROP TABLE "_faqs_v_version_personas" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_faqs_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_faqs_fk";
  
  ALTER TABLE "features" DROP CONSTRAINT "features_media_id_media_id_fk";
  
  ALTER TABLE "_features_v" DROP CONSTRAINT "_features_v_version_media_id_media_id_fk";
  
  DROP INDEX "pages_rels_faqs_id_idx";
  DROP INDEX "_pages_v_autosave_idx";
  DROP INDEX "_pages_v_rels_faqs_id_idx";
  DROP INDEX "features_media_idx";
  DROP INDEX "_features_v_version_version_media_idx";
  DROP INDEX "_features_v_autosave_idx";
  DROP INDEX "_posts_v_autosave_idx";
  DROP INDEX "faqs_slug_idx";
  DROP INDEX "_faqs_v_version_version_slug_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "_pages_v" DROP COLUMN "autosave";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "features" DROP COLUMN "how_it_works";
  ALTER TABLE "features" DROP COLUMN "scenario_persona";
  ALTER TABLE "features" DROP COLUMN "scenario_text";
  ALTER TABLE "features" DROP COLUMN "copy_rules";
  ALTER TABLE "features" DROP COLUMN "demo";
  ALTER TABLE "features" DROP COLUMN "media_id";
  ALTER TABLE "features" DROP COLUMN "coming_soon_teaser";
  ALTER TABLE "_features_v" DROP COLUMN "version_how_it_works";
  ALTER TABLE "_features_v" DROP COLUMN "version_scenario_persona";
  ALTER TABLE "_features_v" DROP COLUMN "version_scenario_text";
  ALTER TABLE "_features_v" DROP COLUMN "version_copy_rules";
  ALTER TABLE "_features_v" DROP COLUMN "version_demo";
  ALTER TABLE "_features_v" DROP COLUMN "version_media_id";
  ALTER TABLE "_features_v" DROP COLUMN "version_coming_soon_teaser";
  ALTER TABLE "_features_v" DROP COLUMN "autosave";
  ALTER TABLE "personas" DROP COLUMN "eyebrow";
  ALTER TABLE "personas" DROP COLUMN "subcopy";
  ALTER TABLE "personas" DROP COLUMN "lead_heading";
  ALTER TABLE "personas" DROP COLUMN "lead_body";
  ALTER TABLE "_personas_v" DROP COLUMN "version_eyebrow";
  ALTER TABLE "_personas_v" DROP COLUMN "version_subcopy";
  ALTER TABLE "_personas_v" DROP COLUMN "version_lead_heading";
  ALTER TABLE "_personas_v" DROP COLUMN "version_lead_body";
  ALTER TABLE "posts" DROP COLUMN "author_name";
  ALTER TABLE "_posts_v" DROP COLUMN "version_author_name";
  ALTER TABLE "_posts_v" DROP COLUMN "autosave";
  ALTER TABLE "faqs" DROP COLUMN "slug";
  ALTER TABLE "_faqs_v" DROP COLUMN "version_slug";
  DROP TYPE "public"."enum_pages_blocks_faq_list_category";
  DROP TYPE "public"."enum__pages_v_blocks_faq_list_category";
  DROP TYPE "public"."enum_features_personas";
  DROP TYPE "public"."enum_features_demo";
  DROP TYPE "public"."enum__features_v_version_personas";
  DROP TYPE "public"."enum__features_v_version_demo";
  DROP TYPE "public"."enum_faqs_personas";
  DROP TYPE "public"."enum__faqs_v_version_personas";`)
}
