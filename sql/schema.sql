-- =====================================================================
-- MD&I Deployment Calendar — Supabase schema + seed data
-- Run this in the Supabase SQL editor for a fresh project.
-- For an existing project, see sql/migration-add-end-date.sql instead.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Deployments table
-- ---------------------------------------------------------------------
create table if not exists deployments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  team text not null check (team in ('IDM', 'DQA', 'RMT', 'PRT', 'CDP', 'MyConcerto', 'NEXUS')),
  environment text not null check (environment in ('Development', 'Test / QA', 'UAT', 'Staging', 'Production')),
  deploy_date date not null,
  deploy_end_date date not null,
  deploy_time_start time,
  deploy_time_end time,
  status text not null default 'Scheduled' check (status in ('Scheduled', 'In Progress', 'Completed', 'Failed', 'Cancelled', 'Rolled Back')),
  owner text not null,
  risk_level text default 'Low' check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  rollback_plan text,
  notes text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint deployments_end_after_start check (deploy_end_date >= deploy_date)
);

-- ---------------------------------------------------------------------
-- Freeze periods table
-- ---------------------------------------------------------------------
create table if not exists freeze_periods (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  reason text,
  start_date date not null,
  end_date date not null,
  affected_environments text[] default '{}',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Row-level security — allow all for anon (demo/team app)
-- ---------------------------------------------------------------------
alter table deployments enable row level security;
alter table freeze_periods enable row level security;

drop policy if exists "Allow all access to deployments" on deployments;
create policy "Allow all access to deployments" on deployments for all using (true) with check (true);

drop policy if exists "Allow all access to freeze_periods" on freeze_periods;
create policy "Allow all access to freeze_periods" on freeze_periods for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- Realtime subscriptions
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table deployments;
alter publication supabase_realtime add table freeze_periods;

-- ---------------------------------------------------------------------
-- Indexes for fast calendar queries
-- ---------------------------------------------------------------------
create index if not exists idx_deployments_start on deployments(deploy_date);
create index if not exists idx_deployments_end on deployments(deploy_end_date);
create index if not exists idx_deployments_team on deployments(team);
create index if not exists idx_deployments_env on deployments(environment);
create index if not exists idx_freeze_dates on freeze_periods(start_date, end_date);

-- =====================================================================
-- Seed data (May–June 2026) — realistic multi-day enhancement spans
-- =====================================================================

-- IDM — UAT migration cycles (each cycle spans 3–5 days of testing)
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('IDM v25C — UAT migration cycle 1', 'Customer master data migration validation', 'IDM', 'UAT', '2026-05-04', '2026-05-06', '09:00', '12:00', 'Completed', 'Lanze', 'Medium', 'Restore snapshot UAT-2026-05-03', 'Cycle 1 of 4 — baseline'),
  ('IDM v25C — UAT migration cycle 2', 'Vendor master data migration', 'IDM', 'UAT', '2026-05-11', '2026-05-13', '09:00', '12:00', 'Completed', 'Lanze', 'Medium', 'Restore snapshot UAT-2026-05-10', 'Cycle 2 — vendor data'),
  ('IDM v25C — UAT migration cycle 3', 'Open AR / AP migration', 'IDM', 'UAT', '2026-05-18', '2026-05-22', '09:00', '13:00', 'In Progress', 'Miguel', 'High', 'Restore snapshot UAT-2026-05-17', 'Largest dataset of the cycle'),
  ('IDM v25C — UAT migration cycle 4', 'Final mock + sign-off', 'IDM', 'UAT', '2026-05-24', '2026-05-24', '08:00', '14:00', 'Scheduled', 'Lanze', 'High', 'Restore snapshot UAT-2026-05-23', 'Final mock cutover for ACME'),
  ('IDM Dev sync', 'Pull latest config from Prod into Dev', 'IDM', 'Development', '2026-05-12', '2026-05-12', '10:00', '11:00', 'Completed', 'Priya', 'Low', null, null),
  ('IDM v25D — kickoff to Test', 'New release branch first drop', 'IDM', 'Test / QA', '2026-06-02', '2026-06-04', '09:00', '11:00', 'Scheduled', 'Miguel', 'Low', null, null);

-- DQA — weekly cadence + a longer integration window
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('DQA weekly drop — w/c May 04', 'Quality rules pack update', 'DQA', 'Test / QA', '2026-05-05', '2026-05-05', '14:00', '15:00', 'Completed', 'Sarah', 'Low', null, null),
  ('DQA weekly drop — w/c May 11', 'New duplicate detection rules', 'DQA', 'Test / QA', '2026-05-12', '2026-05-12', '14:00', '15:00', 'Completed', 'Sarah', 'Low', null, null),
  ('DQA weekly drop — w/c May 18', 'Reference data refresh', 'DQA', 'Test / QA', '2026-05-19', '2026-05-19', '14:00', '15:00', 'Scheduled', 'Sarah', 'Low', null, null),
  ('DQA weekly drop — w/c May 25', 'Final pre-freeze validation pack', 'DQA', 'Test / QA', '2026-05-26', '2026-05-26', '14:00', '15:00', 'Scheduled', 'Sarah', 'Medium', null, 'Last drop before client freeze'),
  ('DQA v4.2 promotion + soak', 'Promote v4.2 from Test to UAT and soak-test for one week', 'DQA', 'UAT', '2026-06-08', '2026-06-12', '10:00', '12:00', 'Scheduled', 'Raj', 'Medium', 'Roll back to v4.1 via DQA admin console', null);

-- RMT — quarterly major release with prep + release + hotfix window
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('RMT 25B — Staging dry-run', 'Final staging verification for 25B', 'RMT', 'Staging', '2026-05-13', '2026-05-14', '18:00', '21:00', 'Completed', 'James', 'High', 'Blue/green flip to staging-prev', 'Dry-run for 25B'),
  ('RMT 25B — Production release', 'Quarterly major release', 'RMT', 'Production', '2026-05-15', '2026-05-15', '20:00', '23:30', 'Completed', 'James', 'Critical', 'Blue/green flip via Argo — run `argo rollout abort`', 'Quarterly major release — all hands on deck'),
  ('RMT 25B post-release watch', 'Post-release monitoring + hotfix window', 'RMT', 'Production', '2026-05-16', '2026-05-22', '21:00', '22:00', 'Scheduled', 'James', 'High', 'Re-flip to previous blue', 'Hotfixes ship under this banner if needed'),
  ('RMT 25C — Dev branch open', 'Open development branch for 25C', 'RMT', 'Development', '2026-06-01', '2026-06-15', '09:00', '10:00', 'Scheduled', 'Aiko', 'Low', null, 'Development sprint window');

-- PRT — including deliberate cross-team UAT overlap with IDM on May 24
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('PRT 2026.05 — UAT', 'Monthly payroll calendar update', 'PRT', 'UAT', '2026-05-24', '2026-05-24', '10:00', '13:00', 'Scheduled', 'Aiko', 'Medium', 'PRT admin → revert calendar', 'Conflicts with IDM final UAT cutover — see calendar'),
  ('PRT 2026.05 — Production', 'Monthly payroll calendar update', 'PRT', 'Production', '2026-05-31', '2026-05-31', '22:00', '23:30', 'Scheduled', 'Aiko', 'High', 'PRT admin → revert calendar', null),
  ('PRT bonus run config', 'Annual bonus run configuration', 'PRT', 'Test / QA', '2026-06-04', '2026-06-08', '14:00', '16:00', 'Scheduled', 'Priya', 'Medium', null, 'Multi-day rollout');

-- CDP — staged Staging then Production with 3-day gap
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('CDP 3.4 — Staging rollout', 'Staged rollout of CDP 3.4', 'CDP', 'Staging', '2026-05-19', '2026-05-21', '17:00', '19:00', 'Scheduled', 'Raj', 'Medium', 'Helm rollback to 3.3', 'Stage 1 of staged rollout'),
  ('CDP 3.4 — Production rollout', 'Stage 2 of 2 — production', 'CDP', 'Production', '2026-05-22', '2026-05-22', '20:00', '22:30', 'Scheduled', 'Raj', 'High', 'Helm rollback to 3.3 and re-route traffic via gateway', 'Stage 2 of staged rollout'),
  ('CDP infra refresh', 'Kubernetes node pool refresh', 'CDP', 'Development', '2026-06-03', '2026-06-05', null, null, 'Scheduled', 'Raj', 'Low', null, null);

-- MyConcerto — Failed deployment, fix, UAT
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('MyConcerto v3.3 — Test', 'Routine release', 'MyConcerto', 'Test / QA', '2026-05-06', '2026-05-06', '11:00', '12:00', 'Failed', 'James', 'Medium', 'Revert to v3.2.1 — run rollback-myconcerto.sh', 'Build artefact corrupted; rolled back'),
  ('MyConcerto v3.3.1 — Test', 'Re-deploy after fix', 'MyConcerto', 'Test / QA', '2026-05-08', '2026-05-08', '11:00', '12:00', 'Completed', 'James', 'Medium', null, 'Successful re-deploy of fix'),
  ('MyConcerto v3.3.1 — UAT', 'UAT promotion + week of soak', 'MyConcerto', 'UAT', '2026-05-21', '2026-05-23', '10:00', '11:30', 'Scheduled', 'Sarah', 'Low', null, null),
  ('MyConcerto v3.4 — kickoff', 'Open 3.4 development', 'MyConcerto', 'Development', '2026-06-10', '2026-06-20', '09:00', '10:00', 'Scheduled', 'Aiko', 'Low', null, null);

-- NEXUS — Cancelled + a UAT overlap with MyConcerto same week
insert into deployments (title, description, team, environment, deploy_date, deploy_end_date, deploy_time_start, deploy_time_end, status, owner, risk_level, rollback_plan, notes) values
  ('NEXUS 2.1 — UAT', 'Integration hub upgrade', 'NEXUS', 'UAT', '2026-05-18', '2026-05-18', '15:00', '17:00', 'Cancelled', 'Miguel', 'Medium', null, 'Postponed — dependency on RMT 25B not ready'),
  ('NEXUS 2.1 — UAT retry', 'Re-attempt after RMT 25B', 'NEXUS', 'UAT', '2026-05-21', '2026-05-22', '15:00', '17:00', 'Scheduled', 'Miguel', 'Medium', 'Disable new endpoints via NEXUS admin', 'Conflicts with MyConcerto same window — see calendar'),
  ('NEXUS connector refresh', 'Quarterly connector refresh', 'NEXUS', 'Production', '2026-06-15', '2026-06-15', '22:00', '23:00', 'Scheduled', 'Priya', 'Medium', null, null),
  ('NEXUS Dev cleanup', 'Drop legacy connectors', 'NEXUS', 'Development', '2026-05-29', '2026-05-29', '09:00', '10:00', 'Scheduled', 'Sarah', 'Low', null, null);

-- =====================================================================
-- Freeze period — Client UAT freeze for ACME Corp
-- =====================================================================
insert into freeze_periods (title, reason, start_date, end_date, affected_environments) values
  ('Client UAT Freeze — ACME Corp', 'ACME Corp conducting final UAT sign-off. No deployments to Production or UAT during this window.', '2026-05-25', '2026-05-30', array['UAT', 'Production']);
