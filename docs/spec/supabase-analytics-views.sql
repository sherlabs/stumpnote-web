-- =====================================================================
-- DRAFT: StumpNote analytics schema for the website admin (read-only).
--
-- STATUS: NOT APPLIED. This file is a draft kept in the public website
-- repo for review. The real migration belongs in the PRIVATE app repo as
-- supabase/migrations/<timestamp>_analytics_admin_views.sql and may only
-- be applied to production after explicit user approval (stage S6).
--
-- Before applying in the private repo:
--   1. Confirm the ai_usage_log v2 migration is applied (this file reads
--      its columns: call_kind, status, flow_id, cached_tokens,
--      thoughts_tokens, tts_chars, saved_cost_usd, scope,
--      subject_player_id, duration_ms, cache_layer, pricing_unknown,
--      input_*_tokens).
--   2. Run `supabase start` locally and apply; run the repo's SQL tests
--      and schema_contract_test; add the role-privilege tests listed in
--      docs/spec/04-analytics-and-admin.md section 8.
--   3. Lines marked UNVERIFIED reference columns not confirmed against
--      origin/main migrations on 2026-10-04; check them first.
--
-- Security choices (see docs/spec/01-architecture.md section 9):
--   * Views are owned by postgres and use default (owner) semantics, NOT
--     security_invoker, so the read-only role never needs base-table
--     grants.
--   * Functions are SECURITY DEFINER with a pinned search_path.
--   * The role is NOLOGIN here; login + password are set out of band in
--     the SQL editor, never in a migration.
--   * The `analytics` schema must never be added to PostgREST's exposed
--     schemas ([api] schemas in config.toml).
--   * Aggregate-only. No ids, emails or free text are exposed. Cells
--     below analytics.config.k_min (default 5) are suppressed.
-- =====================================================================

create schema if not exists analytics;
revoke all on schema analytics from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Role
-- ---------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'payload_analytics_ro') then
    create role payload_analytics_ro nologin nosuperuser nocreatedb nocreaterole
      noinherit nobypassrls connection limit 5;
  end if;
end $$;
alter role payload_analytics_ro set default_transaction_read_only = on;
alter role payload_analytics_ro set statement_timeout = '8s';
alter role payload_analytics_ro set idle_in_transaction_session_timeout = '10s';
alter role payload_analytics_ro set search_path = analytics;
grant usage on schema analytics to payload_analytics_ro;
-- Out of band (SQL editor, user action):
--   alter role payload_analytics_ro login password '<generated>';

-- ---------------------------------------------------------------------
-- Config and exclusions (never granted to the role)
-- ---------------------------------------------------------------------
create table if not exists analytics.config (key text primary key, int_value int not null);
insert into analytics.config values ('k_min', 5) on conflict do nothing;

-- Founder / test accounts to exclude from activity, retention and
-- distributions. Filled via the SQL editor only.
create table if not exists analytics.excluded_subject (subject uuid primary key, reason text);

create or replace function analytics.k_min() returns int
language sql stable security definer set search_path = analytics as
$$ select coalesce((select int_value from analytics.config where key = 'k_min'), 5) $$;

-- ---------------------------------------------------------------------
-- Internal: one row per (user, day) with any product activity.
-- Proxy for DAU/WAU/MAU; there is no app-open event table.
-- ---------------------------------------------------------------------
create or replace view analytics._activity_user_day as
with a as (
  select user_id as uid, created_at::date as d from public.request_logs
  union select athlete_id, created_at::date from public.entries where coalesce(is_draft, false) = false
  union select athlete_id, started_at::date from public.watch_sessions where deleted_at is null
  union select athlete_id, created_at::date from public.game_day_plans
  union select player_id,  created_at::date from public.mindset_sessions            -- UNVERIFIED: mindset_sessions.created_at
  union select player_id,  created_at::date from public.mindset_checkins
  union select athlete_id, created_at::date from public.guided_sessions
)
select uid, d from a
where uid is not null
  and not exists (select 1 from analytics.excluded_subject e where e.subject = a.uid);

-- =====================================================================
-- AI SPEND
-- =====================================================================
create or replace view analytics.ai_daily as
select created_at::date as day, function_name, model, scope,
  count(*) filter (where call_kind in ('generate','embed','tts'))                          as calls,
  count(distinct subject_player_id) filter (where call_kind in ('generate','embed','tts')) as subjects,
  coalesce(sum(prompt_tokens),0)      as prompt_tokens,
  coalesce(sum(cached_tokens),0)      as cached_tokens,
  coalesce(sum(completion_tokens),0)  as completion_tokens,
  coalesce(sum(thoughts_tokens),0)    as thoughts_tokens,
  coalesce(sum(tts_chars),0)          as tts_chars,
  round(coalesce(sum(estimated_cost_usd),0), 6)                                   as cost_usd,
  round(coalesce(sum(estimated_cost_usd) filter (where status <> 'ok'),0), 6)     as wasted_cost_usd,
  count(*) filter (where call_kind = 'cache_hit')                                  as cache_hits,
  round(coalesce(sum(saved_cost_usd),0), 6)                                       as saved_cost_usd,
  count(*) filter (where call_kind = 'retry')                                      as retries,
  count(*) filter (where call_kind = 'error')                                      as errors,
  count(*) filter (where status = 'timeout')                                       as timeouts
from public.ai_usage_log
group by 1,2,3,4;

create or replace view analytics.ai_cache_layer_daily as
select created_at::date as day, function_name, cache_layer, count(*) as hits,
       round(coalesce(sum(saved_cost_usd),0), 6) as saved_cost_usd
from public.ai_usage_log
where call_kind = 'cache_hit'
group by 1,2,3;

create or replace view analytics.ai_latency_daily as
select created_at::date as day, function_name, model, count(*) as calls,
  round((percentile_cont(0.5)  within group (order by duration_ms))::numeric) as p50_ms,
  round((percentile_cont(0.95) within group (order by duration_ms))::numeric) as p95_ms
from public.ai_usage_log
where call_kind = 'generate' and duration_ms is not null
group by 1,2,3;

-- Cost per voice-entry flow (flow_id spans voice -> follow-up -> insights).
create or replace view analytics.ai_voice_flow_daily as
with f as (
  select flow_id, min(created_at)::date as day, sum(estimated_cost_usd) as cost,
         count(*) filter (where call_kind in ('generate','embed','tts')) as calls,
         bool_or(function_name = 'parse-voice-entry') as has_voice
  from public.ai_usage_log
  where flow_id is not null
  group by flow_id)
select day, count(*) as flows,
  round((percentile_cont(0.5) within group (order by cost))::numeric, 5) as p50_usd,
  round((percentile_cont(0.9) within group (order by cost))::numeric, 5) as p90_usd,
  round(avg(cost)::numeric, 5) as mean_usd,
  round(avg(calls)::numeric, 2) as mean_calls
from f where has_voice
group by day;

-- Distribution of per-subject spend. Suppressed below k_min subjects.
create or replace function analytics.ai_subject_cost_dist(p_days int)
returns table (subjects bigint, p50_usd numeric, p90_usd numeric, p99_usd numeric, max_usd numeric, mean_usd numeric)
language sql stable security definer set search_path = analytics, public as $$
  with s as (
    select subject_player_id, sum(estimated_cost_usd) as cost
    from public.ai_usage_log
    where created_at >= now() - make_interval(days => least(greatest(p_days,1), 400))
      and call_kind in ('generate','embed','tts')
      and subject_player_id is not null and scope = 'player'
      and not exists (select 1 from analytics.excluded_subject e where e.subject = subject_player_id)
    group by 1)
  select count(*),
    round((percentile_cont(0.5)  within group (order by cost))::numeric, 4),
    round((percentile_cont(0.9)  within group (order by cost))::numeric, 4),
    round((percentile_cont(0.99) within group (order by cost))::numeric, 4),
    round(max(cost)::numeric, 4),
    round(avg(cost)::numeric, 4)
  from s
  having count(*) >= analytics.k_min();
$$;

-- Top spenders as ranks only (no ids). Suppressed below k_min subjects.
create or replace function analytics.ai_top_spenders(p_days int, p_limit int default 5)
returns table (rank bigint, cost_usd numeric, calls bigint, pct_of_subject_spend numeric)
language sql stable security definer set search_path = analytics, public as $$
  with s as (
    select subject_player_id, sum(estimated_cost_usd) as cost, count(*) as calls
    from public.ai_usage_log
    where created_at >= now() - make_interval(days => least(greatest(p_days,1), 400))
      and call_kind in ('generate','embed','tts')
      and subject_player_id is not null and scope = 'player'
      and not exists (select 1 from analytics.excluded_subject e where e.subject = subject_player_id)
    group by 1),
  t as (select sum(cost) as total, count(*) as n from s)
  select row_number() over (order by cost desc), round(cost::numeric, 4), calls,
         round((100.0 * cost / nullif(t.total,0))::numeric, 1)
  from s, t
  where t.n >= analytics.k_min()
  order by cost desc
  limit least(greatest(p_limit,1), 10);
$$;

create or replace view analytics.ai_budget_month as
with m   as (select date_trunc('month', now())::date as month_start),
     mtd as (select coalesce(sum(estimated_cost_usd),0) as v from public.ai_usage_log, m where created_at >= m.month_start),
     r7  as (select coalesce(sum(estimated_cost_usd),0) / 7.0 as v from public.ai_usage_log where created_at >= now() - interval '7 days')
select m.month_start,
  round(mtd.v,4) as mtd_cost_usd,
  round(r7.v,4)  as last7_daily_avg_usd,
  (date_trunc('month', now()) + interval '1 month')::date - current_date as days_remaining,
  round(mtd.v + r7.v * ((date_trunc('month', now()) + interval '1 month')::date - current_date), 4) as projected_eom_usd
from m, mtd, r7;

-- Token volumes for price-scenario modelling (rates live in the site CMS).
create or replace view analytics.ai_token_volume_30d as
select function_name, model,
  count(*) filter (where call_kind in ('generate','embed','tts')) as calls,
  coalesce(sum(input_text_tokens),0)  as input_text,
  coalesce(sum(input_audio_tokens),0) as input_audio,
  coalesce(sum(input_image_tokens),0) as input_image,
  coalesce(sum(input_video_tokens),0) as input_video,
  coalesce(sum(cached_tokens),0)      as cached,
  coalesce(sum(completion_tokens),0)  as output,
  coalesce(sum(thoughts_tokens),0)    as thinking,
  coalesce(sum(tts_chars),0)          as tts_chars,
  round(coalesce(sum(estimated_cost_usd),0), 6) as logged_cost_usd
from public.ai_usage_log
where created_at >= now() - interval '30 days'
group by 1,2;

create or replace view analytics.ai_data_quality_daily as
select created_at::date as day, count(*) as rows,
  count(*) filter (where subject_player_id is null and scope = 'player') as rows_no_subject,
  count(*) filter (where pricing_unknown)                                as pricing_unknown_rows,
  count(*) filter (where call_kind in ('generate','embed','tts') and coalesce(total_tokens,0) = 0) as zero_token_rows
from public.ai_usage_log
group by 1;

-- =====================================================================
-- PRODUCT
-- =====================================================================
create or replace view analytics.active_users_daily as
with days as (select generate_series(current_date - 120, current_date, interval '1 day')::date as d)
select days.d as day,
  count(distinct a.uid) filter (where a.d = days.d)      as dau,
  count(distinct a.uid) filter (where a.d >= days.d - 6) as wau,
  count(distinct a.uid)                                  as mau
from days
left join analytics._activity_user_day a on a.d between days.d - 29 and days.d
group by days.d;

create or replace view analytics.signups_daily as
select created_at::date as day,
  case role when 'athlete' then 'player' when 'guardian' then 'parent' else role end as persona,   -- UNVERIFIED: 'guardian' role value
  count(*) as accounts,
  count(*) filter (where onboarding_completed) as onboarded
from public.profiles
where not exists (select 1 from analytics.excluded_subject e where e.subject = profiles.id)
group by 1,2;

create or replace view analytics._feature_events as
select 'entry_net' as feature, athlete_id as uid, created_at::date as d from public.entries where entry_type = 'net' and coalesce(is_draft,false) = false
union all select 'entry_match',       athlete_id, created_at::date   from public.entries where entry_type = 'match' and coalesce(is_draft,false) = false
union all select 'watch_session',     athlete_id, started_at::date   from public.watch_sessions where deleted_at is null
union all select 'gameday_plan',      athlete_id, created_at::date   from public.game_day_plans
union all select 'mindset_session',   player_id,  created_at::date   from public.mindset_sessions                                   -- UNVERIFIED: created_at
union all select 'mindset_completed', player_id,  completed_at::date from public.mindset_sessions where completed_at is not null
union all select 'mindset_takeaway',  player_id,  created_at::date   from public.mindset_takeaways where removed_at is null
union all select 'mindset_checkin',   player_id,  created_at::date   from public.mindset_checkins
union all select 'guided_session',    athlete_id, created_at::date   from public.guided_sessions
union all select 'entry_clip',        athlete_id, created_at::date   from public.entry_clips
union all select 'ask_coach', coalesce(player_id, user_id), created_at::date from public.ai_usage_log where function_name = 'ask-coach' and call_kind = 'generate';

create or replace view analytics.feature_adoption_daily as
select d as day, feature, count(*) as events, count(distinct uid) as users
from analytics._feature_events f
where uid is not null
  and not exists (select 1 from analytics.excluded_subject e where e.subject = f.uid)
group by 1,2;

create or replace view analytics.feature_adoption_by_persona_30d as
select feature, persona, users from (
  select f.feature,
         case p.role when 'athlete' then 'player' when 'guardian' then 'parent' else p.role end as persona,
         count(distinct f.uid) as users
  from analytics._feature_events f
  join public.profiles p on p.id = f.uid
  where f.d >= current_date - 29
    and not exists (select 1 from analytics.excluded_subject e where e.subject = f.uid)
  group by 1,2) x
where users >= analytics.k_min();

create or replace view analytics.retention_weekly as
with c as (select p.id as uid, date_trunc('week', p.created_at)::date as cohort
           from public.profiles p
           where not exists (select 1 from analytics.excluded_subject e where e.subject = p.id)),
size as (select cohort, count(*) as cohort_size from c group by 1),
a as (select distinct uid, date_trunc('week', d)::date as wk from analytics._activity_user_day)
select c.cohort, ((a.wk - c.cohort) / 7) as week_n, size.cohort_size, count(distinct c.uid) as active_users
from c
join a on a.uid = c.uid and a.wk >= c.cohort
join size on size.cohort = c.cohort
group by c.cohort, ((a.wk - c.cohort) / 7), size.cohort_size
having size.cohort_size >= analytics.k_min();

create or replace view analytics.funnel_weekly as
with e as (select athlete_id, min(created_at) as first_at, count(*) as n
           from public.entries where coalesce(is_draft,false) = false group by 1),
base as (
  select date_trunc('week', p.created_at)::date as cohort,
         case p.role when 'athlete' then 'player' when 'guardian' then 'parent' else p.role end as persona,
         p.onboarding_completed as onboarded, e.first_at, e.n, p.created_at,
         s.trial_started_at, s.tier, s.subscription_provider
  from public.profiles p
  left join e on e.athlete_id = p.id
  left join public.user_subscriptions s on s.user_id = p.id
  where not exists (select 1 from analytics.excluded_subject x where x.subject = p.id))
select cohort, persona, count(*) as signed_up,
  count(*) filter (where onboarded)                                      as onboarded,
  count(*) filter (where first_at is not null)                           as first_entry,
  count(*) filter (where first_at <= created_at + interval '7 days')     as first_entry_7d,
  count(*) filter (where n >= 3)                                         as three_plus_entries,
  count(*) filter (where trial_started_at is not null)                   as trial_started,
  count(*) filter (where subscription_provider in ('apple','google'))    as store_subscribed
from base
group by 1,2;

create or replace view analytics.subscription_status as
select tier, coalesce(subscription_provider,'none') as provider,
  case when trial_ends_at is null then 'no_trial'
       when trial_ends_at > now()  then 'in_trial'
       else 'trial_ended' end as trial_state,
  team_subscription, coach_subscription, count(*) as users
from public.user_subscriptions s
where not exists (select 1 from analytics.excluded_subject e where e.subject = s.user_id)
group by 1,2,3,4,5;

create or replace function analytics.data_freshness()
returns table (ai_usage_latest timestamptz, now_utc timestamptz)
language sql stable security definer set search_path = analytics, public as
$$ select max(created_at), now() from public.ai_usage_log $$;

-- =====================================================================
-- GRANTS: exactly these 14 views + 4 functions are readable by the role.
-- Keep this list in sync with docs/spec/04-analytics-and-admin.md section 9.
-- =====================================================================
do $$ declare v text; begin
  foreach v in array array[
    'ai_daily','ai_cache_layer_daily','ai_latency_daily','ai_voice_flow_daily','ai_budget_month',
    'ai_token_volume_30d','ai_data_quality_daily',
    'active_users_daily','signups_daily','feature_adoption_daily','feature_adoption_by_persona_30d',
    'retention_weekly','funnel_weekly','subscription_status'] loop
    execute format('revoke all on analytics.%I from public, anon, authenticated', v);
    execute format('grant select on analytics.%I to payload_analytics_ro', v);
  end loop;
  foreach v in array array['_activity_user_day','_feature_events'] loop
    execute format('revoke all on analytics.%I from public, anon, authenticated, payload_analytics_ro', v);
  end loop;
end $$;

revoke all on analytics.config, analytics.excluded_subject from public, anon, authenticated, payload_analytics_ro;

revoke all on function analytics.ai_subject_cost_dist(int), analytics.ai_top_spenders(int,int),
  analytics.data_freshness(), analytics.k_min() from public, anon, authenticated;
grant execute on function analytics.ai_subject_cost_dist(int), analytics.ai_top_spenders(int,int),
  analytics.data_freshness(), analytics.k_min() to payload_analytics_ro;

-- Expected negative tests (write them in the private repo's SQL tests):
--   set role payload_analytics_ro;
--   select * from public.profiles;                 -- permission denied
--   select * from analytics._activity_user_day;    -- permission denied
--   select * from analytics.config;                -- permission denied
--   insert into analytics.excluded_subject ...;    -- read-only transaction
--   select rolbypassrls from pg_roles where rolname='payload_analytics_ro'; -- false
