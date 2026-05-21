import { useCallback, useRef, useState } from 'react';
import {
  askGemini,
  chatGemini,
  type AskOptions,
  type ChatMessage,
} from '../lib/llm';

export interface UseGeminiResult {
  isLoading: boolean;
  error: Error | null;
  response: string | null;
  ask: (prompt: string, opts?: AskOptions) => Promise<string | null>;
  chat: (history: ChatMessage[], opts?: AskOptions) => Promise<string | null>;
  reset: () => void;
  /** Abort the in-flight request, if any. */
  cancel: () => void;
}

export function useGemini(): UseGeminiResult {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (fn: (signal: AbortSignal) => Promise<string>): Promise<string | null> => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
      try {
        const text = await fn(ctrl.signal);
        if (!ctrl.signal.aborted) setResponse(text);
        return text;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return null;
        setError(err as Error);
        return null;
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setLoading(false);
      }
    },
    [],
  );

  const ask = useCallback(
    (prompt: string, opts: AskOptions = {}) =>
      run((signal) => askGemini(prompt, { ...opts, signal })),
    [run],
  );

  const chat = useCallback(
    (history: ChatMessage[], opts: AskOptions = {}) =>
      run((signal) => chatGemini(history, { ...opts, signal })),
    [run],
  );

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  return { isLoading, error, response, ask, chat, reset, cancel };
}
