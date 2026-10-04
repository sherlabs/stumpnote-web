import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_chapter_demo" AS ENUM('none', 'voice-typer', 'quick-log', 'heat-grid', 'kinetic-transcript', 'series-chart', 'squad-grid', 'm-stroke', 'learn-stage');
  CREATE TYPE "public"."enum_pages_blocks_chapter_badge" AS ENUM('none', 'available-web', 'in-beta', 'preview', 'coming-soon');
  CREATE TYPE "public"."enum_pages_blocks_chapter_persona" AS ENUM('inherit', 'player', 'coach', 'parent', 'team');
  CREATE TYPE "public"."enum_pages_blocks_feature_carousel_filter_by_area" AS ENUM('all', 'journal-memory', 'mental-game', 'game-day', 'team', 'coach', 'parent', 'platform');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'standard', 'persona', 'legal');
  CREATE TYPE "public"."enum_pages_hero_persona" AS ENUM('player', 'coach', 'parent', 'team');
  CREATE TYPE "public"."enum__pages_v_blocks_chapter_demo" AS ENUM('none', 'voice-typer', 'quick-log', 'heat-grid', 'kinetic-transcript', 'series-chart', 'squad-grid', 'm-stroke', 'learn-stage');
  CREATE TYPE "public"."enum__pages_v_blocks_chapter_badge" AS ENUM('none', 'available-web', 'in-beta', 'preview', 'coming-soon');
  CREATE TYPE "public"."enum__pages_v_blocks_chapter_persona" AS ENUM('inherit', 'player', 'coach', 'parent', 'team');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_carousel_filter_by_area" AS ENUM('all', 'journal-memory', 'mental-game', 'game-day', 'team', 'coach', 'parent', 'platform');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'standard', 'persona', 'legal');
  CREATE TYPE "public"."enum__pages_v_version_hero_persona" AS ENUM('player', 'coach', 'parent', 'team');
  CREATE TABLE "pages_blocks_hero_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"headline" varchar,
  	"subcopy" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_url" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_url" varchar,
  	"show_m_stroke" boolean DEFAULT true,
  	"show_persona_chips" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_statement_fragments" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_chapter_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_chapter_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_chapter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"overline" varchar,
  	"title" varchar,
  	"body" varchar,
  	"demo" "enum_pages_blocks_chapter_demo" DEFAULT 'none',
  	"badge" "enum_pages_blocks_chapter_badge" DEFAULT 'none',
  	"teaser" varchar,
  	"scenario_persona" varchar,
  	"scenario_text" varchar,
  	"persona" "enum_pages_blocks_chapter_persona" DEFAULT 'inherit',
  	"pin" boolean DEFAULT false,
  	"reverse" boolean DEFAULT false,
  	"link_label" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_persona_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"filter_by_area" "enum_pages_blocks_feature_carousel_filter_by_area",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_beta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subcopy" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_principles_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "pages_blocks_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"personas_id" integer,
  	"features_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"headline" varchar,
  	"subcopy" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_url" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_url" varchar,
  	"show_m_stroke" boolean DEFAULT true,
  	"show_persona_chips" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_statement_fragments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_chapter_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_chapter_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_chapter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"overline" varchar,
  	"title" varchar,
  	"body" varchar,
  	"demo" "enum__pages_v_blocks_chapter_demo" DEFAULT 'none',
  	"badge" "enum__pages_v_blocks_chapter_badge" DEFAULT 'none',
  	"teaser" varchar,
  	"scenario_persona" varchar,
  	"scenario_text" varchar,
  	"persona" "enum__pages_v_blocks_chapter_persona" DEFAULT 'inherit',
  	"pin" boolean DEFAULT false,
  	"reverse" boolean DEFAULT false,
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_persona_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"filter_by_area" "enum__pages_v_blocks_feature_carousel_filter_by_area",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_beta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subcopy" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_principles_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"overline" varchar,
  	"heading" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"personas_id" integer,
  	"features_id" integer
  );
  
  ALTER TABLE "pages" ADD COLUMN "hero_type" "enum_pages_hero_type" DEFAULT 'none';
  ALTER TABLE "pages" ADD COLUMN "hero_overline" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_headline" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_subcopy" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_primary_cta_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_primary_cta_url" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_secondary_cta_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_secondary_cta_url" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_persona" "enum_pages_hero_persona" DEFAULT 'player';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'none';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_overline" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_headline" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_subcopy" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_primary_cta_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_primary_cta_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_secondary_cta_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_secondary_cta_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_persona" "enum__pages_v_version_hero_persona" DEFAULT 'player';
  ALTER TABLE "pages_blocks_hero_story" ADD CONSTRAINT "pages_blocks_hero_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement_fragments" ADD CONSTRAINT "pages_blocks_statement_fragments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement" ADD CONSTRAINT "pages_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_chapter_bullets" ADD CONSTRAINT "pages_blocks_chapter_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_chapter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_chapter_steps" ADD CONSTRAINT "pages_blocks_chapter_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_chapter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_chapter" ADD CONSTRAINT "pages_blocks_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_persona_tabs" ADD CONSTRAINT "pages_blocks_persona_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_carousel" ADD CONSTRAINT "pages_blocks_feature_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_beta" ADD CONSTRAINT "pages_blocks_cta_beta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_principles_items" ADD CONSTRAINT "pages_blocks_principles_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_principles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_principles" ADD CONSTRAINT "pages_blocks_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_story" ADD CONSTRAINT "_pages_v_blocks_hero_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement_fragments" ADD CONSTRAINT "_pages_v_blocks_statement_fragments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement" ADD CONSTRAINT "_pages_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_chapter_bullets" ADD CONSTRAINT "_pages_v_blocks_chapter_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_chapter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_chapter_steps" ADD CONSTRAINT "_pages_v_blocks_chapter_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_chapter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_chapter" ADD CONSTRAINT "_pages_v_blocks_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_persona_tabs" ADD CONSTRAINT "_pages_v_blocks_persona_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_carousel" ADD CONSTRAINT "_pages_v_blocks_feature_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_beta" ADD CONSTRAINT "_pages_v_blocks_cta_beta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_principles_items" ADD CONSTRAINT "_pages_v_blocks_principles_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_principles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_principles" ADD CONSTRAINT "_pages_v_blocks_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_personas_fk" FOREIGN KEY ("personas_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_features_fk" FOREIGN KEY ("features_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_story_order_idx" ON "pages_blocks_hero_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_story_parent_id_idx" ON "pages_blocks_hero_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_story_path_idx" ON "pages_blocks_hero_story" USING btree ("_path");
  CREATE INDEX "pages_blocks_statement_fragments_order_idx" ON "pages_blocks_statement_fragments" USING btree ("_order");
  CREATE INDEX "pages_blocks_statement_fragments_parent_id_idx" ON "pages_blocks_statement_fragments" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statement_order_idx" ON "pages_blocks_statement" USING btree ("_order");
  CREATE INDEX "pages_blocks_statement_parent_id_idx" ON "pages_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statement_path_idx" ON "pages_blocks_statement" USING btree ("_path");
  CREATE INDEX "pages_blocks_chapter_bullets_order_idx" ON "pages_blocks_chapter_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_chapter_bullets_parent_id_idx" ON "pages_blocks_chapter_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_chapter_steps_order_idx" ON "pages_blocks_chapter_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_chapter_steps_parent_id_idx" ON "pages_blocks_chapter_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_chapter_order_idx" ON "pages_blocks_chapter" USING btree ("_order");
  CREATE INDEX "pages_blocks_chapter_parent_id_idx" ON "pages_blocks_chapter" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_chapter_path_idx" ON "pages_blocks_chapter" USING btree ("_path");
  CREATE INDEX "pages_blocks_persona_tabs_order_idx" ON "pages_blocks_persona_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_persona_tabs_parent_id_idx" ON "pages_blocks_persona_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_persona_tabs_path_idx" ON "pages_blocks_persona_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_carousel_order_idx" ON "pages_blocks_feature_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_carousel_parent_id_idx" ON "pages_blocks_feature_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_carousel_path_idx" ON "pages_blocks_feature_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_beta_order_idx" ON "pages_blocks_cta_beta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_beta_parent_id_idx" ON "pages_blocks_cta_beta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_beta_path_idx" ON "pages_blocks_cta_beta" USING btree ("_path");
  CREATE INDEX "pages_blocks_principles_items_order_idx" ON "pages_blocks_principles_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_principles_items_parent_id_idx" ON "pages_blocks_principles_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_principles_order_idx" ON "pages_blocks_principles" USING btree ("_order");
  CREATE INDEX "pages_blocks_principles_parent_id_idx" ON "pages_blocks_principles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_principles_path_idx" ON "pages_blocks_principles" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_personas_id_idx" ON "pages_rels" USING btree ("personas_id");
  CREATE INDEX "pages_rels_features_id_idx" ON "pages_rels" USING btree ("features_id");
  CREATE INDEX "_pages_v_blocks_hero_story_order_idx" ON "_pages_v_blocks_hero_story" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_story_parent_id_idx" ON "_pages_v_blocks_hero_story" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_story_path_idx" ON "_pages_v_blocks_hero_story" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_statement_fragments_order_idx" ON "_pages_v_blocks_statement_fragments" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statement_fragments_parent_id_idx" ON "_pages_v_blocks_statement_fragments" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_order_idx" ON "_pages_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statement_parent_id_idx" ON "_pages_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_path_idx" ON "_pages_v_blocks_statement" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_chapter_bullets_order_idx" ON "_pages_v_blocks_chapter_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_chapter_bullets_parent_id_idx" ON "_pages_v_blocks_chapter_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_chapter_steps_order_idx" ON "_pages_v_blocks_chapter_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_chapter_steps_parent_id_idx" ON "_pages_v_blocks_chapter_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_chapter_order_idx" ON "_pages_v_blocks_chapter" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_chapter_parent_id_idx" ON "_pages_v_blocks_chapter" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_chapter_path_idx" ON "_pages_v_blocks_chapter" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_persona_tabs_order_idx" ON "_pages_v_blocks_persona_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_persona_tabs_parent_id_idx" ON "_pages_v_blocks_persona_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_persona_tabs_path_idx" ON "_pages_v_blocks_persona_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_carousel_order_idx" ON "_pages_v_blocks_feature_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_carousel_parent_id_idx" ON "_pages_v_blocks_feature_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_carousel_path_idx" ON "_pages_v_blocks_feature_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_beta_order_idx" ON "_pages_v_blocks_cta_beta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_beta_parent_id_idx" ON "_pages_v_blocks_cta_beta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_beta_path_idx" ON "_pages_v_blocks_cta_beta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_principles_items_order_idx" ON "_pages_v_blocks_principles_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_principles_items_parent_id_idx" ON "_pages_v_blocks_principles_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_principles_order_idx" ON "_pages_v_blocks_principles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_principles_parent_id_idx" ON "_pages_v_blocks_principles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_principles_path_idx" ON "_pages_v_blocks_principles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_personas_id_idx" ON "_pages_v_rels" USING btree ("personas_id");
  CREATE INDEX "_pages_v_rels_features_id_idx" ON "_pages_v_rels" USING btree ("features_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_story" CASCADE;
  DROP TABLE "pages_blocks_statement_fragments" CASCADE;
  DROP TABLE "pages_blocks_statement" CASCADE;
  DROP TABLE "pages_blocks_chapter_bullets" CASCADE;
  DROP TABLE "pages_blocks_chapter_steps" CASCADE;
  DROP TABLE "pages_blocks_chapter" CASCADE;
  DROP TABLE "pages_blocks_persona_tabs" CASCADE;
  DROP TABLE "pages_blocks_feature_carousel" CASCADE;
  DROP TABLE "pages_blocks_cta_beta" CASCADE;
  DROP TABLE "pages_blocks_principles_items" CASCADE;
  DROP TABLE "pages_blocks_principles" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_story" CASCADE;
  DROP TABLE "_pages_v_blocks_statement_fragments" CASCADE;
  DROP TABLE "_pages_v_blocks_statement" CASCADE;
  DROP TABLE "_pages_v_blocks_chapter_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_chapter_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_chapter" CASCADE;
  DROP TABLE "_pages_v_blocks_persona_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_beta" CASCADE;
  DROP TABLE "_pages_v_blocks_principles_items" CASCADE;
  DROP TABLE "_pages_v_blocks_principles" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  ALTER TABLE "pages" DROP COLUMN "hero_type";
  ALTER TABLE "pages" DROP COLUMN "hero_overline";
  ALTER TABLE "pages" DROP COLUMN "hero_headline";
  ALTER TABLE "pages" DROP COLUMN "hero_subcopy";
  ALTER TABLE "pages" DROP COLUMN "hero_primary_cta_label";
  ALTER TABLE "pages" DROP COLUMN "hero_primary_cta_url";
  ALTER TABLE "pages" DROP COLUMN "hero_secondary_cta_label";
  ALTER TABLE "pages" DROP COLUMN "hero_secondary_cta_url";
  ALTER TABLE "pages" DROP COLUMN "hero_persona";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_overline";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_headline";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_subcopy";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_primary_cta_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_primary_cta_url";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_secondary_cta_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_secondary_cta_url";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_persona";
  DROP TYPE "public"."enum_pages_blocks_chapter_demo";
  DROP TYPE "public"."enum_pages_blocks_chapter_badge";
  DROP TYPE "public"."enum_pages_blocks_chapter_persona";
  DROP TYPE "public"."enum_pages_blocks_feature_carousel_filter_by_area";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_hero_persona";
  DROP TYPE "public"."enum__pages_v_blocks_chapter_demo";
  DROP TYPE "public"."enum__pages_v_blocks_chapter_badge";
  DROP TYPE "public"."enum__pages_v_blocks_chapter_persona";
  DROP TYPE "public"."enum__pages_v_blocks_feature_carousel_filter_by_area";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_hero_persona";`)
}
