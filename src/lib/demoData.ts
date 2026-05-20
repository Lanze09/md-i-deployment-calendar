import type { Deployment, FreezePeriod } from '../types';

const uid = (n: number): string => `demo-${n.toString().padStart(4, '0')}`;

export const DEMO_DEPLOYMENTS: Deployment[] = [
  // IDM — UAT migration cycles. A few rows have custom colours to show off
  // the per-enhancement colour feature when the user filters to Tool=IDM.
  { id: uid(1),  title: 'IDM v25C — UAT migration cycle 1', description: 'Customer master data migration validation', team: 'IDM', environment: 'UAT', deploy_date: '2026-05-04', deploy_end_date: '2026-05-06', deploy_time_start: '09:00', deploy_time_end: '12:00', status: 'Completed', owner: 'Lanze', risk_level: 'Medium', rollback_plan: 'Restore snapshot UAT-2026-05-03', notes: 'Cycle 1 of 4 — baseline', color: '#A100FF' },
  { id: uid(2),  title: 'IDM v25C — UAT migration cycle 2', description: 'Vendor master data migration', team: 'IDM', environment: 'UAT', deploy_date: '2026-05-11', deploy_end_date: '2026-05-13', deploy_time_start: '09:00', deploy_time_end: '12:00', status: 'Completed', owner: 'Lanze', risk_level: 'Medium', rollback_plan: 'Restore snapshot UAT-2026-05-10', notes: 'Cycle 2 — vendor data', color: '#7B00CF' },
  { id: uid(3),  title: 'IDM v25C — UAT migration cycle 3', description: 'Open AR / AP migration', team: 'IDM', environment: 'UAT', deploy_date: '2026-05-18', deploy_end_date: '2026-05-22', deploy_time_start: '09:00', deploy_time_end: '13:00', status: 'In Progress', owner: 'Miguel', risk_level: 'High', rollback_plan: 'Restore snapshot UAT-2026-05-17', notes: 'Largest dataset of the cycle', color: '#EC4899' },
  { id: uid(4),  title: 'IDM v25C — UAT migration cycle 4', description: 'Final mock + sign-off', team: 'IDM', environment: 'UAT', deploy_date: '2026-05-24', deploy_end_date: '2026-05-24', deploy_time_start: '08:00', deploy_time_end: '14:00', status: 'Scheduled', owner: 'Lanze', risk_level: 'High', rollback_plan: 'Restore snapshot UAT-2026-05-23', notes: 'Final mock cutover for ACME', color: '#0EA5E9' },
  { id: uid(5),  title: 'IDM Dev sync', description: 'Pull latest config from Prod into Dev', team: 'IDM', environment: 'Development', deploy_date: '2026-05-12', deploy_end_date: '2026-05-12', deploy_time_start: '10:00', deploy_time_end: '11:00', status: 'Completed', owner: 'Priya', risk_level: 'Low', rollback_plan: null, notes: null, color: null },
  { id: uid(6),  title: 'IDM v25D — kickoff to Test', description: 'New release branch first drop', team: 'IDM', environment: 'Test / QA', deploy_date: '2026-06-02', deploy_end_date: '2026-06-04', deploy_time_start: '09:00', deploy_time_end: '11:00', status: 'Scheduled', owner: 'Miguel', risk_level: 'Low', rollback_plan: null, notes: null, color: null },

  // DQA
  { id: uid(7),  title: 'DQA weekly drop — w/c May 04', description: 'Quality rules pack update', team: 'DQA', environment: 'Test / QA', deploy_date: '2026-05-05', deploy_end_date: '2026-05-05', deploy_time_start: '14:00', deploy_time_end: '15:00', status: 'Completed', owner: 'Sarah', risk_level: 'Low', rollback_plan: null, notes: null, color: null },
  { id: uid(8),  title: 'DQA weekly drop — w/c May 11', description: 'New duplicate detection rules', team: 'DQA', environment: 'Test / QA', deploy_date: '2026-05-12', deploy_end_date: '2026-05-12', deploy_time_start: '14:00', deploy_time_end: '15:00', status: 'Completed', owner: 'Sarah', risk_level: 'Low', rollback_plan: null, notes: null, color: null },
  { id: uid(9),  title: 'DQA weekly drop — w/c May 18', description: 'Reference data refresh', team: 'DQA', environment: 'Test / QA', deploy_date: '2026-05-19', deploy_end_date: '2026-05-19', deploy_time_start: '14:00', deploy_time_end: '15:00', status: 'Scheduled', owner: 'Sarah', risk_level: 'Low', rollback_plan: null, notes: null, color: null },
  { id: uid(10), title: 'DQA weekly drop — w/c May 25', description: 'Final pre-freeze validation pack', team: 'DQA', environment: 'Test / QA', deploy_date: '2026-05-26', deploy_end_date: '2026-05-26', deploy_time_start: '14:00', deploy_time_end: '15:00', status: 'Scheduled', owner: 'Sarah', risk_level: 'Medium', rollback_plan: null, notes: 'Last drop before client freeze', color: null },
  { id: uid(11), title: 'DQA v4.2 promotion + soak', description: 'Promote v4.2 from Test to UAT and soak-test for one week', team: 'DQA', environment: 'UAT', deploy_date: '2026-06-08', deploy_end_date: '2026-06-12', deploy_time_start: '10:00', deploy_time_end: '12:00', status: 'Scheduled', owner: 'Raj', risk_level: 'Medium', rollback_plan: 'Roll back to v4.1 via DQA admin console', notes: null, color: null },

  // RMT
  { id: uid(12), title: 'RMT 25B — Staging dry-run', description: 'Final staging verification for 25B', team: 'RMT', environment: 'Staging', deploy_date: '2026-05-13', deploy_end_date: '2026-05-14', deploy_time_start: '18:00', deploy_time_end: '21:00', status: 'Completed', owner: 'James', risk_level: 'High', rollback_plan: 'Blue/green flip to staging-prev', notes: 'Dry-run for 25B', color: null },
  { id: uid(13), title: 'RMT 25B — Production release', description: 'Quarterly major release', team: 'RMT', environment: 'Production', deploy_date: '2026-05-15', deploy_end_date: '2026-05-15', deploy_time_start: '20:00', deploy_time_end: '23:30', status: 'Completed', owner: 'James', risk_level: 'Critical', rollback_plan: 'Blue/green flip via Argo — run `argo rollout abort`', notes: 'Quarterly major release — all hands on deck', color: null },
  { id: uid(14), title: 'RMT 25B post-release watch', description: 'Post-release monitoring + hotfix window', team: 'RMT', environment: 'Production', deploy_date: '2026-05-16', deploy_end_date: '2026-05-22', deploy_time_start: '21:00', deploy_time_end: '22:00', status: 'Scheduled', owner: 'James', risk_level: 'High', rollback_plan: 'Re-flip to previous blue', notes: 'Hotfixes ship under this banner if needed', color: null },
  { id: uid(15), title: 'RMT 25C — Dev branch open', description: 'Open development branch for 25C', team: 'RMT', environment: 'Development', deploy_date: '2026-06-01', deploy_end_date: '2026-06-15', deploy_time_start: '09:00', deploy_time_end: '10:00', status: 'Scheduled', owner: 'Aiko', risk_level: 'Low', rollback_plan: null, notes: 'Development sprint window', color: null },

  // PRT
  { id: uid(16), title: 'PRT 2026.05 — UAT', description: 'Monthly payroll calendar update', team: 'PRT', environment: 'UAT', deploy_date: '2026-05-24', deploy_end_date: '2026-05-24', deploy_time_start: '10:00', deploy_time_end: '13:00', status: 'Scheduled', owner: 'Aiko', risk_level: 'Medium', rollback_plan: 'PRT admin → revert calendar', notes: 'Conflicts with IDM final UAT cutover — see calendar', color: null },
  { id: uid(17), title: 'PRT 2026.05 — Production', description: 'Monthly payroll calendar update', team: 'PRT', environment: 'Production', deploy_date: '2026-05-31', deploy_end_date: '2026-05-31', deploy_time_start: '22:00', deploy_time_end: '23:30', status: 'Scheduled', owner: 'Aiko', risk_level: 'High', rollback_plan: 'PRT admin → revert calendar', notes: null, color: null },
  { id: uid(18), title: 'PRT bonus run config', description: 'Annual bonus run configuration', team: 'PRT', environment: 'Test / QA', deploy_date: '2026-06-04', deploy_end_date: '2026-06-08', deploy_time_start: '14:00', deploy_time_end: '16:00', status: 'Scheduled', owner: 'Priya', risk_level: 'Medium', rollback_plan: null, notes: 'Multi-day rollout', color: null },

  // CDP
  { id: uid(19), title: 'CDP 3.4 — Staging rollout', description: 'Staged rollout of CDP 3.4', team: 'CDP', environment: 'Staging', deploy_date: '2026-05-19', deploy_end_date: '2026-05-21', deploy_time_start: '17:00', deploy_time_end: '19:00', status: 'Scheduled', owner: 'Raj', risk_level: 'Medium', rollback_plan: 'Helm rollback to 3.3', notes: 'Stage 1 of staged rollout', color: null },
  { id: uid(20), title: 'CDP 3.4 — Production rollout', description: 'Stage 2 of 2 — production', team: 'CDP', environment: 'Production', deploy_date: '2026-05-22', deploy_end_date: '2026-05-22', deploy_time_start: '20:00', deploy_time_end: '22:30', status: 'Scheduled', owner: 'Raj', risk_level: 'High', rollback_plan: 'Helm rollback to 3.3 and re-route traffic via gateway', notes: 'Stage 2 of staged rollout', color: null },
  { id: uid(21), title: 'CDP infra refresh', description: 'Kubernetes node pool refresh', team: 'CDP', environment: 'Development', deploy_date: '2026-06-03', deploy_end_date: '2026-06-05', deploy_time_start: null, deploy_time_end: null, status: 'Scheduled', owner: 'Raj', risk_level: 'Low', rollback_plan: null, notes: null, color: null },

  // MyConcerto
  { id: uid(22), title: 'MyConcerto v3.3 — Test', description: 'Routine release', team: 'MyConcerto', environment: 'Test / QA', deploy_date: '2026-05-06', deploy_end_date: '2026-05-06', deploy_time_start: '11:00', deploy_time_end: '12:00', status: 'Failed', owner: 'James', risk_level: 'Medium', rollback_plan: 'Revert to v3.2.1 — run rollback-myconcerto.sh', notes: 'Build artefact corrupted; rolled back', color: null },
  { id: uid(23), title: 'MyConcerto v3.3.1 — Test', description: 'Re-deploy after fix', team: 'MyConcerto', environment: 'Test / QA', deploy_date: '2026-05-08', deploy_end_date: '2026-05-08', deploy_time_start: '11:00', deploy_time_end: '12:00', status: 'Completed', owner: 'James', risk_level: 'Medium', rollback_plan: null, notes: 'Successful re-deploy of fix', color: null },
  { id: uid(24), title: 'MyConcerto v3.3.1 — UAT', description: 'UAT promotion + week of soak', team: 'MyConcerto', environment: 'UAT', deploy_date: '2026-05-21', deploy_end_date: '2026-05-23', deploy_time_start: '10:00', deploy_time_end: '11:30', status: 'Scheduled', owner: 'Sarah', risk_level: 'Low', rollback_plan: null, notes: null, color: null },
  { id: uid(25), title: 'MyConcerto v3.4 — kickoff', description: 'Open 3.4 development', team: 'MyConcerto', environment: 'Development', deploy_date: '2026-06-10', deploy_end_date: '2026-06-20', deploy_time_start: '09:00', deploy_time_end: '10:00', status: 'Scheduled', owner: 'Aiko', risk_level: 'Low', rollback_plan: null, notes: null, color: null },

  // NEXUS
  { id: uid(26), title: 'NEXUS 2.1 — UAT', description: 'Integration hub upgrade', team: 'NEXUS', environment: 'UAT', deploy_date: '2026-05-18', deploy_end_date: '2026-05-18', deploy_time_start: '15:00', deploy_time_end: '17:00', status: 'Cancelled', owner: 'Miguel', risk_level: 'Medium', rollback_plan: null, notes: 'Postponed — dependency on RMT 25B not ready', color: null },
  { id: uid(27), title: 'NEXUS 2.1 — UAT retry', description: 'Re-attempt after RMT 25B', team: 'NEXUS', environment: 'UAT', deploy_date: '2026-05-21', deploy_end_date: '2026-05-22', deploy_time_start: '15:00', deploy_time_end: '17:00', status: 'Scheduled', owner: 'Miguel', risk_level: 'Medium', rollback_plan: 'Disable new endpoints via NEXUS admin', notes: 'Conflicts with MyConcerto same window — see calendar', color: null },
  { id: uid(28), title: 'NEXUS connector refresh', description: 'Quarterly connector refresh', team: 'NEXUS', environment: 'Production', deploy_date: '2026-06-15', deploy_end_date: '2026-06-15', deploy_time_start: '22:00', deploy_time_end: '23:00', status: 'Scheduled', owner: 'Priya', risk_level: 'Medium', rollback_plan: null, notes: null, color: null },
  { id: uid(29), title: 'NEXUS Dev cleanup', description: 'Drop legacy connectors', team: 'NEXUS', environment: 'Development', deploy_date: '2026-05-29', deploy_end_date: '2026-05-29', deploy_time_start: '09:00', deploy_time_end: '10:00', status: 'Scheduled', owner: 'Sarah', risk_level: 'Low', rollback_plan: null, notes: null, color: null },
];

export const DEMO_FREEZE_PERIODS: FreezePeriod[] = [
  {
    id: 'demo-freeze-0001',
    title: 'Client UAT Freeze — ACME Corp',
    reason:
      'ACME Corp conducting final UAT sign-off. No deployments to Production or UAT during this window.',
    start_date: '2026-05-25',
    end_date: '2026-05-30',
    affected_environments: ['UAT', 'Production'],
  },
];
