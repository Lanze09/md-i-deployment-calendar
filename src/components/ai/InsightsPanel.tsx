import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarCheck2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useGemini } from '../../hooks/useGemini';
import { isLLMConfigured } from '../../lib/llm';
import { applyFilters, cx } from '../../lib/utils';
import { buildContextBlock, buildSystemPrompt } from '../../lib/llmContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Markdown } from './Markdown';
import { NotConfiguredHint } from './NotConfiguredHint';

export interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'summary' | 'risks' | 'windows';

const TAB_META: Record<
  Tab,
  { label: string; icon: React.ReactNode; prompt: string }
> = {
  summary: {
    label: 'Summary',
    icon: <Sparkles size={14} />,
    prompt:
      'Summarize what is happening on the calendar for the visible context in 4–6 bullet points. Group by tool when more than one is visible. Mention totals, the riskiest item, and any imminent production releases.',
  },
  risks: {
    label: 'Risks & conflicts',
    icon: <AlertTriangle size={14} />,
    prompt:
      'List the most important risks and cross-team conflicts in the visible context. For each conflict, name the two tools and explain why it matters (shared environment contention, sign-off blockers, etc.). Flag any deployment inside a freeze window. End with a short "recommended actions" bullet list.',
  },
  windows: {
    label: 'Suggested windows',
    icon: <CalendarCheck2 size={14} />,
    prompt:
      'Recommend 3 to 5 specific calendar windows within the next 30 days when a *new* deployment could safely land for the currently focused tool (or each tool, if "All tools" is selected). Each suggestion must specify: target environment, date range, and one-line justification (no overlapping cross-team deployment, not inside a freeze, sensible buffer from major releases). Output as a markdown table.',
  },
};

export function InsightsPanel({ isOpen, onClose }: InsightsPanelProps) {
  const app = useApp();
  const { deployments, freezePeriods, filters, selectedTool, currentDate } = app;
  const [tab, setTab] = useState<Tab>('summary');
  const [answers, setAnswers] = useState<Partial<Record<Tab, string>>>({});
  const inFlight = useRef<Set<Tab>>(new Set());
  const { isLoading, error, ask, reset } = useGemini();

  const visible = applyFilters(deployments.deployments, filters, selectedTool);

  const generate = async (which: Tab) => {
    if (!isLLMConfigured()) return;
    if (inFlight.current.has(which)) return;
    inFlight.current.add(which);
    reset();
    const context = buildContextBlock({
      visibleDeployments: visible,
      allDeployments: deployments.deployments,
      freezePeriods: freezePeriods.freezePeriods,
      selectedTool,
      currentDate,
    });
    try {
      const result = await ask(
        `${context}\n\n## Task\n${TAB_META[which].prompt}`,
        { systemPrompt: buildSystemPrompt(), temperature: 0.3, maxOutputTokens: 1024 },
      );
      if (result) {
        setAnswers((prev) => ({ ...prev, [which]: result }));
      }
    } finally {
      inFlight.current.delete(which);
    }
  };

  // Auto-generate the active tab the first time the panel opens.
  useEffect(() => {
    if (!isOpen) return;
    if (answers[tab]) return;
    if (!isLLMConfigured()) return;
    void generate(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tab]);

  const current = answers[tab];

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        labelledBy="insights-title"
        title={
          <span className="flex items-center gap-2">
            <Sparkles size={16} className="text-accenture-400" />
            <span id="insights-title">AI Insights</span>
            <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">
              Gemini Flash
            </span>
          </span>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1 rounded-btn border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-surface-dark-tertiary">
            {(Object.keys(TAB_META) as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cx(
                  'flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-medium transition-colors',
                  tab === t
                    ? 'bg-accenture-400 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                )}
              >
                {TAB_META[t].icon}
                {TAB_META[t].label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                {visible.length} deployment{visible.length === 1 ? '' : 's'} in context
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generate(tab)}
                disabled={isLoading}
                aria-label="Regenerate"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>

          <div className="min-h-[12rem] rounded-card border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-surface-dark-tertiary">
            {!isLLMConfigured() ? (
              <NotConfiguredHint />
            ) : isLoading && !current ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Thinking…
              </div>
            ) : error ? (
              <div className="space-y-2">
                <div className="text-sm text-status-danger">{error.message}</div>
                <Button size="sm" variant="secondary" onClick={() => generate(tab)}>
                  Retry
                </Button>
              </div>
            ) : current ? (
              <Markdown text={current} />
            ) : (
              <div className="text-sm text-slate-500">No response yet.</div>
            )}
          </div>

          <p className="text-[10px] text-slate-400">
            Responses are generated on the fly and may be wrong. Verify before acting.
          </p>
        </div>
      </Modal>
  );
}
