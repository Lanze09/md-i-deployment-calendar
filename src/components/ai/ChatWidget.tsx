import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Send, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useGemini } from '../../hooks/useGemini';
import { isLLMConfigured, type ChatMessage } from '../../lib/llm';
import { applyFilters, cx } from '../../lib/utils';
import { buildContextBlock, buildSystemPrompt } from '../../lib/llmContext';
import { Markdown } from './Markdown';
import { NotConfiguredHint } from './NotConfiguredHint';

const SUGGESTIONS = [
  'What is happening this week?',
  'Any conflicts I should know about?',
  'When can I safely deploy to UAT?',
  'Which deployments are inside a freeze?',
];

export function ChatWidget() {
  const app = useApp();
  const { deployments, freezePeriods, filters, selectedTool, currentDate } = app;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const { chat, isLoading, error } = useGemini();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isLoading]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    if (!isLLMConfigured()) return;

    const visible = applyFilters(deployments.deployments, filters, selectedTool);
    const context = buildContextBlock({
      visibleDeployments: visible,
      allDeployments: deployments.deployments,
      freezePeriods: freezePeriods.freezePeriods,
      selectedTool,
      currentDate,
    });

    // Prepend a context-injecting "user" turn that we don't show in the UI on the first turn.
    // Subsequent turns keep the conversation going without re-sending the context (Gemini chat
    // remembers it within the request).
    const isFirst = history.length === 0;
    const augmented: ChatMessage[] = isFirst
      ? [
          {
            role: 'user',
            text: `${context}\n\n---\nUser question: ${text}`,
          },
        ]
      : [...history, { role: 'user', text }];

    const display: ChatMessage[] = [...history, { role: 'user', text }];
    setHistory(display);
    setInput('');

    const reply = await chat(augmented, {
      systemPrompt: buildSystemPrompt(),
      temperature: 0.4,
      maxOutputTokens: 1024,
    });
    if (reply) {
      setHistory((h) => [...h, { role: 'model', text: reply }]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="chat-fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            data-print-hide
            className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accenture-400 text-white shadow-xl hover:bg-accenture-500"
            aria-label="Open AI chat"
          >
            <Sparkles size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed bottom-5 right-5 z-40 flex h-[34rem] w-[26rem] flex-col rounded-card border border-slate-200 bg-surface-light-primary shadow-2xl dark:border-slate-700 dark:bg-surface-dark-secondary"
            data-print-hide
            role="dialog"
            aria-label="AI assistant"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accenture-400" />
                <span className="font-display text-sm font-semibold">AI assistant</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  Gemini
                </span>
              </div>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    aria-label="Clear chat"
                    className="rounded-btn p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-surface-dark-tertiary"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-btn p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-surface-dark-tertiary"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
              {history.length === 0 && (
                <div className="space-y-3 py-4">
                  {!isLLMConfigured() ? (
                    <NotConfiguredHint />
                  ) : (
                    <>
                      <p className="text-center text-xs text-slate-500">
                        Ask anything about the deployment schedule.
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="rounded-btn border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-accenture-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-surface-dark-tertiary"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {history.map((m, i) => (
                <div
                  key={i}
                  className={cx(
                    'rounded-card px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'ml-6 bg-accenture-400/10 text-slate-800 dark:text-slate-100'
                      : 'mr-6 bg-slate-100 text-slate-800 dark:bg-surface-dark-tertiary dark:text-slate-100',
                  )}
                >
                  {m.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <Markdown text={m.text} />
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="mr-6 flex items-center gap-2 rounded-card bg-slate-100 px-3 py-2 text-xs text-slate-500 dark:bg-surface-dark-tertiary">
                  <Loader2 size={12} className="animate-spin" /> Thinking…
                </div>
              )}

              {error && (
                <div className="rounded-card border border-status-danger/40 bg-status-danger/10 px-3 py-2 text-xs text-status-danger">
                  {error.message}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-slate-200 p-2 dark:border-slate-700"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLLMConfigured() ? 'Ask anything…' : 'AI not configured — see .env'}
                disabled={isLoading || !isLLMConfigured()}
                className="flex-1 rounded-btn border border-slate-300 bg-white px-3 py-2 text-sm font-body text-slate-900 focus:border-accenture-400 disabled:opacity-60 dark:border-slate-700 dark:bg-surface-dark-tertiary dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !isLLMConfigured()}
                aria-label="Send"
                className="flex h-9 w-9 items-center justify-center rounded-btn bg-accenture-400 text-white transition-colors hover:bg-accenture-500 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
