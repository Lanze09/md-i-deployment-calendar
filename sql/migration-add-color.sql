-- =====================================================================
-- Migration: add per-enhancement `color` column to deployments
-- Safe to run multiple times (idempotent).
-- Nullable — when null, the UI falls back to the tool's signature colour.
-- =====================================================================

alter table deployments add column if not exists color text;

-- =====================================================================
-- Optional: tint a few existing IDM enhancements to demo the per-enhancement
-- colour feature. Skip / edit to taste.
-- =====================================================================
update deployments set color = '#A100FF' where title = 'IDM v25C — UAT migration cycle 1';
update deployments set color = '#7B00CF' where title = 'IDM v25C — UAT migration cycle 2';
update deployments set color = '#EC4899' where title = 'IDM v25C — UAT migration cycle 3';
update deployments set color = '#0EA5E9' where title = 'IDM v25C — UAT migration cycle 4';
