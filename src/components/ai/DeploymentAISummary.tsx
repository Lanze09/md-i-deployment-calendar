import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useGemini } from '../../hooks/useGemini';
import { isLLMConfigured } from '../../lib/llm';
import {
  buildSingleDeploymentContext,
  buildSystemPrompt,
} from '../../lib/llmContext';
import type { Deployment, FreezePeriod } from '../../types';
import { Markdown } from './Markdown';
import { NotConfiguredHint } from './NotConfiguredHint';

// Session-scoped cache so opening the same deployment again doesn't burn quota.
const summaryCache = new Map<string, string>();

export interface DeploymentAISummaryProps {
  deployment: Deployment;
  allDeployments: Deployment[];
  freezePeriods: FreezePeriod[];
}

export function DeploymentAISummary({
  deployment,
  allDeployments,
  freezePeriods,
}: DeploymentAISummaryProps) {
  const [text, setText] = useState<string | null>(summaryCache.get(deployment.id) ?? null);
  const { ask, isLoading, error } = useGemini();
  const lastIdRef = useRef<string>('');

  useEffect(() => {
    // Re-run when the deployment changes (different modal open).
    if (lastIdRef.current === deployment.id) return;
    lastIdRef.current = deployment.id;

    const cached = summaryCache.get(deployment.id);
    if (cached) {
      setText(cached);
      return;
    }
    if (!isLLMConfigured()) {
      setText(null);
      return;
    }

    void (async () => {
      const ctx = buildSingleDeploymentContext(deployment, allDeployments, freezePeriods);
      const result = await ask(
        `${ctx}\n\n## Task\nIn one or two sentences, describe how this deployment relates to its neighbours (other cycles in the same release, recent or upcoming work in the same tool, any freeze it falls into). Be concrete and concise. Avoid restating fields the user already sees in the detail panel.`,
        { systemPrompt: buildSystemPrompt(), temperature: 0.3, maxOutputTokens: 256 },
      );
      if (result) {
        summaryCache.set(deployment.id, result);
        setText(result);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment.id]);

  if (!isLLMConfigured()) {
    return <NotConfiguredHint variant="inline" />;
  }

  return (
    <div className="rounded-card border border-accenture-300/40 bg-accenture-400/5 px-3 py-2 text-xs">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-accenture-400">
        <Sparkles size={11} /> AI context
      </div>
      {isLoading && !text ? (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Loader2 size={11} className="animate-spin" />
          Thinking…
        </div>
      ) : error ? (
        <div className="text-status-danger">{error.message}</div>
      ) : text ? (
        <Markdown text={text} />
      ) : (
        <div className="text-slate-500">—</div>
      )}
    </div>
  );
}
