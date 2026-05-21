import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { TEAMS } from '../constants/teams';
import { detectConflicts, deploymentIsFrozen, isDateFrozen } from './utils';
import type { Conflict, Deployment, FreezePeriod, ToolSelection } from '../types';

export interface BuildContextInput {
  visibleDeployments: Deployment[];
  allDeployments: Deployment[];
  freezePeriods: FreezePeriod[];
  selectedTool: ToolSelection;
  currentDate: Date;
}

const SYSTEM_PROMPT = `You are an analyst assistant embedded in the Accenture MD&I Deployment Calendar.

The calendar tracks planned deployments across 7 internal tools (IDM, DQA, RMT, PRT, CDP, MyConcerto, NEXUS) to 5 environments (Development, Test / QA, UAT, Staging, Production). Each deployment is owned by a person and has a status, risk level, and a date range.

A *cross-team conflict* is two different tools deploying to the same environment with overlapping date ranges. Two deployments of the *same* tool overlapping is not a conflict — that's normal parallel work.

A *freeze period* blocks deployments to certain environments during a window (e.g. while a client is doing UAT sign-off).

When asked for summaries, observations, or suggestions:
- Be concrete: name specific deployments, dates, owners, environments.
- Be concise — markdown with short bullet points. No preamble like "Here is a summary".
- When suggesting deployment windows, recommend specific dates and explain why (no conflicts, no freeze, suitable buffer from major releases).
- Never invent deployments, owners, or dates not present in the supplied context.
- If the user asks something the supplied context cannot answer, say so plainly.`;

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/** Turn the current calendar state into a compact text block the LLM can reason over. */
export function buildContextBlock({
  visibleDeployments,
  allDeployments,
  freezePeriods,
  selectedTool,
  currentDate,
}: BuildContextInput): string {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const conflicts = detectConflicts(visibleDeployments);
  const monthIsoStart = format(monthStart, 'yyyy-MM-dd');
  const monthIsoEnd = format(monthEnd, 'yyyy-MM-dd');

  const lines: string[] = [];
  lines.push(`# Calendar context`);
  lines.push(`- Today: ${format(new Date(), 'yyyy-MM-dd')}`);
  lines.push(`- Viewing month: ${format(currentDate, 'MMMM yyyy')}`);
  lines.push(`- Tool focus: ${selectedTool === 'all' ? 'All tools' : `${selectedTool} (${TEAMS[selectedTool].fullName})`}`);
  lines.push(`- Visible (filtered) deployments: ${visibleDeployments.length}`);
  lines.push(`- Total deployments in database: ${allDeployments.length}`);
  lines.push('');

  lines.push(`## Deployments (visible, sorted by start date)`);
  if (visibleDeployments.length === 0) {
    lines.push('_(none)_');
  } else {
    const sorted = [...visibleDeployments].sort((a, b) =>
      a.deploy_date.localeCompare(b.deploy_date),
    );
    for (const d of sorted) {
      const range =
        d.deploy_date === d.deploy_end_date
          ? d.deploy_date
          : `${d.deploy_date} → ${d.deploy_end_date}`;
      const time = d.deploy_time_start
        ? ` ${d.deploy_time_start}${d.deploy_time_end ? `–${d.deploy_time_end}` : ''}`
        : '';
      const frozen = deploymentIsFrozen(d, freezePeriods);
      const freezeTag = frozen ? ` ⚠ inside freeze "${frozen.title}"` : '';
      lines.push(
        `- [${range}${time}] ${d.team} → ${d.environment} — "${d.title}" — owner: ${d.owner}, status: ${d.status}, risk: ${d.risk_level}${freezeTag}`,
      );
    }
  }
  lines.push('');

  lines.push(`## Cross-team conflicts in this view`);
  if (conflicts.length === 0) {
    lines.push('_(none)_');
  } else {
    // Group conflict-day rows by environment + the set of teams to avoid spam.
    const seen = new Set<string>();
    for (const c of conflicts) {
      const teams = Array.from(new Set(c.deployments.map((d) => d.team))).sort().join(' × ');
      const key = `${c.environment}|${teams}|${c.date}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(
        `- ${c.date} · ${c.environment}: ${c.deployments
          .map((d) => `${d.team} "${d.title}" (${d.owner})`)
          .join(' ⚡ ')}`,
      );
    }
  }
  lines.push('');

  lines.push(`## Freeze periods overlapping ${format(currentDate, 'MMMM yyyy')}`);
  const monthFreezes = freezePeriods.filter(
    (f) => f.start_date <= monthIsoEnd && f.end_date >= monthIsoStart,
  );
  if (monthFreezes.length === 0) {
    lines.push('_(none)_');
  } else {
    for (const f of monthFreezes) {
      lines.push(
        `- ${f.start_date} → ${f.end_date}: "${f.title}" — affects: ${
          f.affected_environments.length ? f.affected_environments.join(', ') : 'all'
        }${f.reason ? ` — ${f.reason}` : ''}`,
      );
    }
  }

  return lines.join('\n');
}

/** A focused context for a single deployment — used by the auto-summary in the detail modal. */
export function buildSingleDeploymentContext(
  deployment: Deployment,
  allDeployments: Deployment[],
  freezePeriods: FreezePeriod[],
): string {
  const conflicts = allDeployments.filter(
    (d) =>
      d.id !== deployment.id &&
      d.status !== 'Cancelled' &&
      d.environment === deployment.environment &&
      d.team !== deployment.team &&
      d.deploy_date <= deployment.deploy_end_date &&
      d.deploy_end_date >= deployment.deploy_date,
  );
  const sameToolNeighbours = allDeployments.filter(
    (d) =>
      d.id !== deployment.id &&
      d.team === deployment.team &&
      Math.abs(parseISO(d.deploy_date).getTime() - parseISO(deployment.deploy_date).getTime()) <
        14 * 24 * 60 * 60 * 1000,
  );
  const frozen = deploymentIsFrozen(deployment, freezePeriods);

  const lines: string[] = [];
  lines.push(`## Deployment under review`);
  lines.push(
    `- "${deployment.title}" — ${deployment.team} → ${deployment.environment}, ${deployment.deploy_date}${
      deployment.deploy_date !== deployment.deploy_end_date ? ` → ${deployment.deploy_end_date}` : ''
    }, owner ${deployment.owner}, status ${deployment.status}, risk ${deployment.risk_level}`,
  );
  if (deployment.description) lines.push(`- Description: ${deployment.description}`);
  if (deployment.rollback_plan) lines.push(`- Rollback plan: ${deployment.rollback_plan}`);

  lines.push('');
  lines.push(`## Cross-team overlaps on ${deployment.environment}`);
  if (conflicts.length === 0) lines.push('_(none)_');
  else {
    for (const c of conflicts) {
      lines.push(
        `- ${c.team} "${c.title}" (${c.owner}), ${c.deploy_date}${
          c.deploy_date !== c.deploy_end_date ? ` → ${c.deploy_end_date}` : ''
        }, status ${c.status}`,
      );
    }
  }

  lines.push('');
  lines.push(`## Nearby ${deployment.team} deployments (±2 weeks)`);
  if (sameToolNeighbours.length === 0) lines.push('_(none)_');
  else {
    for (const n of sameToolNeighbours.sort((a, b) => a.deploy_date.localeCompare(b.deploy_date))) {
      lines.push(`- ${n.deploy_date} · ${n.environment} · "${n.title}" (${n.status})`);
    }
  }

  if (frozen) {
    lines.push('');
    lines.push(`## Inside freeze`);
    lines.push(`- "${frozen.title}" (${frozen.start_date} → ${frozen.end_date}): ${frozen.reason ?? ''}`);
  }

  return lines.join('\n');
}

/** A focused context for a specific cross-team conflict on a specific date. */
export function buildConflictContext(
  deployment: Deployment,
  conflictingDeployments: Deployment[],
  freezePeriods: FreezePeriod[],
): string {
  const lines: string[] = [];
  lines.push(`## Conflict under review`);
  lines.push(`- Environment: ${deployment.environment}`);
  lines.push('');
  lines.push(`## Overlapping deployments`);
  for (const d of [deployment, ...conflictingDeployments]) {
    const frozen = isDateFrozen(d.deploy_date, freezePeriods);
    lines.push(
      `- ${d.team} "${d.title}" (${d.owner}): ${d.deploy_date}${
        d.deploy_date !== d.deploy_end_date ? ` → ${d.deploy_end_date}` : ''
      }, status ${d.status}, risk ${d.risk_level}${frozen ? `, inside freeze "${frozen.title}"` : ''}`,
    );
  }
  return lines.join('\n');
}
