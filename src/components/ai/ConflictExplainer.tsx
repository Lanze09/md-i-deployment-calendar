import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useGemini } from '../../hooks/useGemini';
import { isLLMConfigured } from '../../lib/llm';
import {
  buildConflictContext,
  buildSystemPrompt,
} from '../../lib/llmContext';
import type { Deployment, FreezePeriod } from '../../types';
import { Markdown } from './Markdown';
import { NotConfiguredHint } from './NotConfiguredHint';

export interface ConflictExplainerProps {
  deployment: Deployment;
  conflicts: Deployment[];
  freezePeriods: FreezePeriod[];
}

export function ConflictExplainer({
  deployment,
  conflicts,
  freezePeriods,
}: ConflictExplainerProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const { ask, isLoading, error } = useGemini();

  if (!isLLMConfigured()) {
    return (
      <div className="mt-2">
        <NotConfiguredHint variant="inline" />
      </div>
    );
  }

  const generate = async () => {
    const ctx = buildConflictContext(deployment, conflicts, freezePeriods);
    const result = await ask(
      `${ctx}\n\n## Task\nExplain why these overlapping deployments are a conflict. Then suggest 1–2 concrete resolutions (e.g., shift a window, sequence the deployments, request a freeze waiver). Use a short markdown list. No preamble.`,
      { systemPrompt: buildSystemPrompt(), temperature: 0.3, maxOutputTokens: 512 },
    );
    if (result) setExplanation(result);
  };

  return (
    <div className="mt-2">
      {!explanation && !isLoading && (
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-1 rounded-pill bg-accenture-400/10 px-2.5 py-1 text-xs font-medium text-accenture-400 hover:bg-accenture-400/20"
        >
          <Sparkles size={12} /> Explain & suggest resolution
        </button>
      )}
      {isLoading && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Loader2 size={11} className="animate-spin" />
          Thinking…
        </div>
      )}
      {error && <div className="text-xs text-status-danger">{error.message}</div>}
      {explanation && (
        <div className="mt-1 rounded-card bg-white/60 px-2 py-1.5 dark:bg-surface-dark-tertiary/40">
          <Markdown text={explanation} />
        </div>
      )}
    </div>
  );
}
