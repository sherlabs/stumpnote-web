import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "analytics_settings" ADD COLUMN "monthly_budget_usd" numeric;
  CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "audit_log_action_idx";
  ALTER TABLE "analytics_settings" DROP COLUMN "monthly_budget_usd";`)
}
