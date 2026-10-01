import type { AppSettings, GenerateResponse, GenerationMode, MediaResult, ConvertResponse, ConversionDirection, TranslateResponse, TranslationDirection } from '@/types';

const HISTORY_KEY = 'devbhumi:history';
const SETTINGS_KEY = 'devbhumi:settings';
const THEME_KEY = 'devbhumi:theme';
const MAX_HISTORY = 50;

// All backend calls go through the Vercel serverless proxy (api/studio.ts),
// which adds the secret key and forwards to the n8n router.
const STUDIO_ENDPOINT = '/api/studio';

export function loadHistory(): MediaResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MediaResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: MediaResult[]): void {
  try {
    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — silently drop oldest entries.
  }
}

export function loadSettings(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AppSettings>;
  } catch {
    return {};
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export type Theme = 'dark' | 'light';

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export interface GeneratePayload {
  mode: GenerationMode;
  prompt: string;
  aspectRatio: string;
  stylePreset: string;
  quality: string;
  seed: string;
  negativePrompt: string;
}

function timeoutSignal(ms: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller;
}

interface StudioReply {
  success?: boolean;
  error?: string;
  outputUrl?: string;
  translatedText?: string;
}

function friendlyError(code: string | undefined, status: number): string {
  switch (code) {
    case 'unauthorized':
      return 'Server configuration error (API key). Please contact the admin.';
    case 'provider_error':
      return 'The AI provider rejected the request (video generation may need provider credits).';
    case 'no_output':
      return 'The AI provider returned no media. Please try again.';
    case 'llm_failed':
      return 'The translation model failed. Please try again.';
    case 'convert_failed':
      return 'Conversion failed. Make sure the link is a direct, public video/audio URL.';
    case 'upstream timeout':
      return 'The backend took too long to respond. Please try again.';
    default:
      return code || `Backend returned status ${status}.`;
  }
}

async function callStudio(
  body: Record<string, unknown>,
  timeoutMs: number,
  timeoutMessage: string,
  unreachableMessage: string
): Promise<{ ok: true; data: StudioReply } | { ok: false; error: string }> {
  const controller = timeoutSignal(timeoutMs);

  let response: Response;
  try {
    response = await fetch(STUDIO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: timeoutMessage };
    }
    return { ok: false, error: unreachableMessage };
  }

  let data: StudioReply | null = null;
  try {
    data = (await response.json()) as StudioReply;
  } catch {
    data = null;
  }

  if (!data) {
    return { ok: false, error: 'Received an unexpected response format from the backend.' };
  }
  if (!response.ok || data.success === false) {
    return { ok: false, error: friendlyError(data.error, response.status) };
  }
  return { ok: true, data };
}

function sizeFromRatio(ratio: string): { width: number; height: number } {
  const [a, b] = ratio.split(':').map(Number);
  if (!a || !b) return { width: 1024, height: 768 };
  const round8 = (n: number) => Math.max(256, Math.round(n / 8) * 8);
  return a >= b
    ? { width: 1024, height: round8((1024 * b) / a) }
    : { width: round8((1024 * a) / b), height: 1024 };
}

export async function generateMedia(
  payload: GeneratePayload,
  _webhookUrl: string
): Promise<GenerateResponse> {
  const timeoutMs = payload.mode === 'video' ? 180_000 : 90_000;
  const style = payload.stylePreset && !['none', 'default'].includes(payload.stylePreset.toLowerCase())
    ? `, ${payload.stylePreset} style`
    : '';
  const { width, height } = sizeFromRatio(payload.aspectRatio);
  const seed = parseInt(payload.seed, 10);

  const r = await callStudio(
    {
      action: 'generate-media',
      mediaType: payload.mode,
      prompt: `${payload.prompt}${style}`,
      width,
      height,
      ...(Number.isFinite(seed) ? { seed } : {}),
    },
    timeoutMs,
    `The request timed out after ${timeoutMs / 1000}s. Video generation can take longer — try again or use Draft quality.`,
    'Could not reach the AI backend. Check your connection and try again.'
  );

  if (!r.ok) return { success: false, error: r.error };
  if (!r.data.outputUrl) return { success: false, error: 'Generation failed for an unknown reason.' };
  return { success: true, mediaUrl: r.data.outputUrl };
}

export function downloadFile(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareMedia(url: string, prompt: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share({
      title: 'Devbhumi AI Media',
      text: prompt,
      url,
    });
    return true;
  } catch {
    return false;
  }
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

export function formatDate(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const VALID_TARGETS = ['mp3', 'wav', 'aac', 'm4a', 'mp4', 'webm'];

function pickTarget(direction: ConversionDirection, format: string): string {
  const f = (format || '').toLowerCase();
  if (VALID_TARGETS.includes(f)) return f;
  return String(direction).toLowerCase().startsWith('video') ? 'mp3' : 'mp4';
}

export async function convertMedia(
  _file: File,
  _direction: ConversionDirection,
  _webhookUrl: string,
  _options: { format: string; quality: string }
): Promise<ConvertResponse> {
  return {
    success: false,
    error: 'Direct file upload is not available yet. Please paste a direct public URL of the video/audio instead.',
  };
}

export async function convertMediaByUrl(
  sourceUrl: string,
  direction: ConversionDirection,
  _webhookUrl: string,
  options: { format: string; quality: string }
): Promise<ConvertResponse> {
  const r = await callStudio(
    {
      action: 'convert-media',
      url: sourceUrl,
      target: pickTarget(direction, options.format),
    },
    300_000,
    'The conversion timed out after 5 minutes. Try a smaller file.',
    'Could not reach the conversion backend. Check your connection and try again.'
  );

  if (!r.ok) return { success: false, error: r.error };
  if (!r.data.outputUrl) return { success: false, error: 'Conversion failed for an unknown reason.' };
  return { success: true, resultUrl: r.data.outputUrl };
}

export async function translatePrompt(
  text: string,
  direction: TranslationDirection,
  _webhookUrl: string,
  refineForAI: boolean
): Promise<TranslateResponse> {
  const target = String(direction).toLowerCase().startsWith('en') ? 'hi' : 'en';

  const r = await callStudio(
    { action: 'translate-prompt', text, target, refine: refineForAI },
    45_000,
    'The translation request timed out. Please try again.',
    'Could not reach the translation backend. Check your connection and try again.'
  );

  if (!r.ok) return { success: false, error: r.error };
  if (!r.data.translatedText) return { success: false, error: 'Translation failed for an unknown reason.' };
  return { success: true, translation: r.data.translatedText };
}
