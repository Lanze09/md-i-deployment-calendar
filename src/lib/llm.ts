// =====================================================================
// Gemini Flash client — direct REST, no SDK.
//
// **Key:** The API key is read from `VITE_GEMINI_API_KEY` in `.env`.
// Vite inlines `VITE_*` values into the build, so the key is bundled into
// `dist/` when you `npm run build`. That's the chosen tradeoff for this
// project — see the comment in `.env.example`. Restart the dev server
// after changing `.env`.
//
// **Model fallback:** Free-tier availability moves around. We try
// gemini-2.5-flash first, then gemini-2.5-flash-lite, then
// gemini-1.5-flash-8b. The first one whose quota is not zero wins.
// Override the entire chain with one model via `VITE_GEMINI_MODEL`.
// =====================================================================

// Tried in order. Override with VITE_GEMINI_MODEL in .env to lock to one.
const DEFAULT_MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash-8b',
] as const;

export interface AskOptions {
  systemPrompt?: string;
  /** 0–1, controls creativity. Default 0.4 for analytical answers. */
  temperature?: number;
  maxOutputTokens?: number;
  /** Override the model. Disables fallback. */
  model?: string;
  signal?: AbortSignal;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export class LLMError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMError';
  }
}

export class MissingKeyError extends LLMError {
  constructor() {
    super(
      'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env and restart the dev server.',
    );
    this.name = 'MissingKeyError';
  }
}

function resolveKey(): string | null {
  const env = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  return env || null;
}

export function isLLMConfigured(): boolean {
  return Boolean(resolveKey());
}

function resolveModelChain(override?: string): string[] {
  if (override) return [override];
  const envOverride = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim();
  if (envOverride) return [envOverride];
  return [...DEFAULT_MODEL_CHAIN];
}

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof LLMError)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('exceeded') ||
    msg.includes('limit: 0')
  );
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

async function callOnce(
  body: Record<string, unknown>,
  model: string,
  signal?: AbortSignal,
): Promise<string> {
  const key = resolveKey();
  if (!key) throw new MissingKeyError();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    throw new LLMError('Network error reaching Gemini', err);
  }

  let data: GeminiResponse;
  try {
    data = await res.json();
  } catch (err) {
    throw new LLMError(`Gemini returned non-JSON (HTTP ${res.status})`, err);
  }

  if (!res.ok || data.error) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    throw new LLMError(`Gemini API error (${model}): ${msg}`);
  }
  if (data.promptFeedback?.blockReason) {
    throw new LLMError(`Prompt blocked: ${data.promptFeedback.blockReason}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new LLMError('Gemini returned an empty response.');
  return text;
}

async function callWithFallback(
  body: Record<string, unknown>,
  override: string | undefined,
  signal?: AbortSignal,
): Promise<string> {
  const chain = resolveModelChain(override);
  let lastError: unknown;
  for (const model of chain) {
    try {
      return await callOnce(body, model, signal);
    } catch (err) {
      // Abort aborts the whole operation — don't try the next model.
      if ((err as Error).name === 'AbortError') throw err;
      lastError = err;
      // Only fall through on quota / rate-limit errors; everything else is fatal.
      if (!isQuotaError(err)) throw err;
    }
  }
  throw lastError ?? new LLMError('All Gemini models failed.');
}

/** Single-turn ask. */
export function askGemini(prompt: string, opts: AskOptions = {}): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
    },
  };
  if (opts.systemPrompt) {
    body.systemInstruction = { parts: [{ text: opts.systemPrompt }] };
  }
  return callWithFallback(body, opts.model, opts.signal);
}

/** Multi-turn chat. */
export function chatGemini(
  history: ChatMessage[],
  opts: AskOptions = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    contents: history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.5,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
    },
  };
  if (opts.systemPrompt) {
    body.systemInstruction = { parts: [{ text: opts.systemPrompt }] };
  }
  return callWithFallback(body, opts.model, opts.signal);
}
