import type { AppSettings, GenerateResponse, GenerationMode, MediaResult, ConvertResponse, ConversionDirection, TranslateResponse, TranslationDirection } from '@/types';

const HISTORY_KEY = 'devbhumi:history';
const SETTINGS_KEY = 'devbhumi:settings';
const THEME_KEY = 'devbhumi:theme';
const MAX_HISTORY = 50;

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

export async function generateMedia(
  payload: GeneratePayload,
  webhookUrl: string
): Promise<GenerateResponse> {
  const timeoutMs = payload.mode === 'video' ? 180_000 : 90_000;
  const controller = timeoutSignal(timeoutMs);

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error: `The request timed out after ${timeoutMs / 1000}s. Video generation can take longer — try again or use Draft quality.`,
      };
    }
    return {
      success: false,
      error: 'Could not reach the AI backend. Check your connection and try again.',
    };
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.text();
      try {
        const json = JSON.parse(body) as { error?: string; message?: string };
        detail = json.error || json.message || body;
      } catch {
        detail = body;
      }
    } catch {
      // ignore
    }
    return {
      success: false,
      error: `Backend returned ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`,
    };
  }

  let data: GenerateResponse;
  try {
    data = (await response.json()) as GenerateResponse;
  } catch {
    // Maybe the backend returned a direct URL as text/plain.
    try {
      const text = (await response.text()).trim();
      if (text.startsWith('http')) {
        return { success: true, mediaUrl: text };
      }
    } catch {
      // ignore
    }
    return { success: false, error: 'Received an unexpected response format from the backend.' };
  }

  if (!data.success && !data.mediaUrl) {
    return {
      success: false,
      error: data.error || 'Generation failed for an unknown reason.',
    };
  }

  return data;
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

export async function convertMedia(
  file: File,
  direction: ConversionDirection,
  webhookUrl: string,
  options: { format: string; quality: string }
): Promise<ConvertResponse> {
  const timeoutMs = 300_000;
  const controller = timeoutSignal(timeoutMs);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('direction', direction);
  formData.append('format', options.format);
  formData.append('quality', options.quality);

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error: 'The conversion timed out after 5 minutes. Large files can take longer — try a smaller file or lower quality.',
      };
    }
    return {
      success: false,
      error: 'Could not reach the conversion backend. Check your connection and try again.',
    };
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.text();
      try {
        const json = JSON.parse(body) as { error?: string; message?: string };
        detail = json.error || json.message || body;
      } catch {
        detail = body;
      }
    } catch {
      // ignore
    }
    return {
      success: false,
      error: `Backend returned ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`,
    };
  }

  let data: ConvertResponse;
  try {
    data = (await response.json()) as ConvertResponse;
  } catch {
    try {
      const text = (await response.text()).trim();
      if (text.startsWith('http')) {
        return { success: true, resultUrl: text };
      }
    } catch {
      // ignore
    }
    return { success: false, error: 'Received an unexpected response format from the backend.' };
  }

  if (!data.success && !data.resultUrl) {
    return {
      success: false,
      error: data.error || 'Conversion failed for an unknown reason.',
    };
  }

  return data;
}

export async function convertMediaByUrl(
  sourceUrl: string,
  direction: ConversionDirection,
  webhookUrl: string,
  options: { format: string; quality: string }
): Promise<ConvertResponse> {
  const timeoutMs = 300_000;
  const controller = timeoutSignal(timeoutMs);

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sourceUrl,
        direction,
        format: options.format,
        quality: options.quality,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error: 'The conversion timed out after 5 minutes. Try a smaller file or lower quality.',
      };
    }
    return {
      success: false,
      error: 'Could not reach the conversion backend. Check your connection and try again.',
    };
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.text();
      try {
        const json = JSON.parse(body) as { error?: string; message?: string };
        detail = json.error || json.message || body;
      } catch {
        detail = body;
      }
    } catch {
      // ignore
    }
    return {
      success: false,
      error: `Backend returned ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`,
    };
  }

  let data: ConvertResponse;
  try {
    data = (await response.json()) as ConvertResponse;
  } catch {
    try {
      const text = (await response.text()).trim();
      if (text.startsWith('http')) {
        return { success: true, resultUrl: text };
      }
    } catch {
      // ignore
    }
    return { success: false, error: 'Received an unexpected response format from the backend.' };
  }

  if (!data.success && !data.resultUrl) {
    return {
      success: false,
      error: data.error || 'Conversion failed for an unknown reason.',
    };
  }

  return data;
}

export async function translatePrompt(
  text: string,
  direction: TranslationDirection,
  webhookUrl: string,
  refineForAI: boolean
): Promise<TranslateResponse> {
  const timeoutMs = 30_000;
  const controller = timeoutSignal(timeoutMs);

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text,
        direction,
        refineForAI,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error: 'The translation request timed out. Please try again.',
      };
    }
    return {
      success: false,
      error: 'Could not reach the translation backend. Check your connection and try again.',
    };
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.text();
      try {
        const json = JSON.parse(body) as { error?: string; message?: string };
        detail = json.error || json.message || body;
      } catch {
        detail = body;
      }
    } catch {
      // ignore
    }
    return {
      success: false,
      error: `Backend returned ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`,
    };
  }

  let data: TranslateResponse;
  try {
    data = (await response.json()) as TranslateResponse;
  } catch {
    return { success: false, error: 'Received an unexpected response format from the backend.' };
  }

  if (!data.success && !data.translation) {
    return {
      success: false,
      error: data.error || 'Translation failed for an unknown reason.',
    };
  }

  return data;
}
