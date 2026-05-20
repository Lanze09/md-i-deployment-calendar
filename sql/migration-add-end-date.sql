-- =====================================================================
-- Migration: add deploy_end_date to existing deployments table
-- Safe to run multiple times (idempotent).
-- Existing rows get deploy_end_date = deploy_date (single-day).
-- =====================================================================

-- Add the column (nullable initially so the backfill can run)
alter table deployments add column if not exists deploy_end_date date;

-- Backfill existing rows: end date defaults to start date
update deployments set deploy_end_date = deploy_date where deploy_end_date is null;

-- Now enforce NOT NULL and the range constraint
alter table deployments alter column deploy_end_date set not null;

alter table deployments drop constraint if exists deployments_end_after_start;
alter table deployments add constraint deployments_end_after_start
  check (deploy_end_date >= deploy_date);

-- Index for end-date range queries
create index if not exists idx_deployments_end on deployments(deploy_end_date);

-- =====================================================================
-- Optional: stretch a few existing rows into realistic multi-day spans
-- (matches the updated demo seed). Remove or edit to taste.
-- =====================================================================
update deployments set deploy_end_date = '2026-05-06' where title = 'IDM v25C — UAT migration cycle 1';
update deployments set deploy_end_date = '2026-05-13' where title = 'IDM v25C — UAT migration cycle 2';
update deployments set deploy_end_date = '2026-05-22' where title = 'IDM v25C — UAT migration cycle 3';
update deployments set deploy_end_date = '2026-05-14' where title = 'RMT 25B — Staging dry-run';
update deployments set deploy_end_date = '2026-05-22', title = 'RMT 25B post-release watch', description = 'Post-release monitoring + hotfix window', notes = 'Hotfixes ship under this banner if needed'
  where title = 'RMT 25B hotfix-1';
update deployments set deploy_end_date = '2026-06-15' where title = 'RMT 25C — Dev branch open';
update deployments set deploy_end_date = '2026-05-21' where title = 'CDP 3.4 — Staging rollout';
update deployments set deploy_end_date = '2026-06-05' where title = 'CDP infra refresh';
update deployments set deploy_end_date = '2026-05-23' where title = 'MyConcerto v3.3.1 — UAT';
update deployments set deploy_end_date = '2026-06-20' where title = 'MyConcerto v3.4 — kickoff';
update deployments set deploy_end_date = '2026-05-22' where title = 'NEXUS 2.1 — UAT retry';
update deployments set deploy_end_date = '2026-06-12' where title = 'DQA v4.2 promotion';
update deployments set deploy_end_date = '2026-06-08' where title = 'PRT bonus run config';
update deployments set deploy_end_date = '2026-06-04' where title = 'IDM v25D — kickoff to Test';
