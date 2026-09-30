import { useCallback, useState } from 'react';
import {
  Languages, ArrowRightLeft, Copy, Check, Loader2, AlertCircle,
  Sparkles, Zap, ArrowRight, Trash2, Shuffle,
} from 'lucide-react';
import type { AppSettings, TranslationDirection, TranslationResult, TranslateResponse } from '@/types';
import { SAMPLE_HINDI_PROMPTS } from '@/types';
import { translatePrompt, generateId } from '@/lib/api';

interface TranslatorToolProps {
  settings: AppSettings;
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  onUseAsPrompt: (text: string) => void;
}

export function TranslatorTool({ settings, showToast, onUseAsPrompt }: TranslatorToolProps) {
  const [direction, setDirection] = useState<TranslationDirection>('hi-to-en');
  const [sourceText, setSourceText] = useState('');
  const [refineForAI, setRefineForAI] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<TranslateResponse | null>(null);
  const [history, setHistory] = useState<TranslationResult[]>(() => {
    try {
      const raw = localStorage.getItem('devbhumi:translations');
      return raw ? (JSON.parse(raw) as TranslationResult[]) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);

  const isHiToEn = direction === 'hi-to-en';

  const handleToggleDirection = useCallback(() => {
    setDirection((d) => (d === 'hi-to-en' ? 'en-to-hi' : 'hi-to-en'));
    setStatus('idle');
    setResponse(null);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      showToast('Please enter text to translate', 'error');
      return;
    }
    if (!settings.translatorWebhookUrl) {
      showToast('Please set a translator webhook URL in Settings', 'error');
      return;
    }

    setStatus('loading');
    setResponse(null);

    const res = await translatePrompt(sourceText.trim(), direction, settings.translatorWebhookUrl, refineForAI);
    setResponse(res);

    if (!res.success || !res.translation) {
      setStatus('error');
      return;
    }

    const entry: TranslationResult = {
      id: generateId(),
      direction,
      sourceText: sourceText.trim(),
      translatedText: res.translation,
      refinedPrompt: res.refinedPrompt,
      createdAt: Date.now(),
    };

    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem('devbhumi:translations', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setStatus('success');
  }, [sourceText, direction, refineForAI, settings, showToast, history]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  }, [showToast]);

  const handleUseAsPrompt = useCallback(() => {
    const text = response?.refinedPrompt || response?.translation || '';
    if (!text) return;
    onUseAsPrompt(text);
    showToast('Sent to AI Generator as prompt', 'success');
  }, [response, onUseAsPrompt, showToast]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('devbhumi:translations');
    } catch {
      // ignore
    }
    showToast('Translation history cleared', 'info');
  }, [showToast]);

  const handleSample = useCallback(() => {
    const random = SAMPLE_HINDI_PROMPTS[Math.floor(Math.random() * SAMPLE_HINDI_PROMPTS.length)];
    setSourceText(random);
    setDirection('hi-to-en');
  }, []);

  return (
    <div className="space-y-5">
      {/* Direction selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl border border-dusk-200 bg-dusk-100/60 p-1 dark:border-dusk-700 dark:bg-dusk-900/60">
          <LangButton
            active={isHiToEn}
            onClick={() => !isHiToEn && handleToggleDirection()}
            label="Hindi"
            sublabel="हिन्दी"
          />
          <button
            onClick={handleToggleDirection}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-summit-500 text-white shadow-lg shadow-summit-500/30 transition active:scale-90"
            aria-label="Swap language"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>
          <LangButton
            active={!isHiToEn}
            onClick={() => isHiToEn && handleToggleDirection()}
            label="English"
            sublabel="ENG"
          />
        </div>
      </div>

      {/* Source text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-dusk-700 dark:text-dusk-200">
            <Languages className="h-4 w-4 text-summit-500" />
            {isHiToEn ? 'Hindi Text' : 'English Text'}
          </label>
          <button
            onClick={handleSample}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-summit-600 transition hover:bg-summit-50 dark:text-summit-400 dark:hover:bg-summit-950/40"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Sample
          </button>
        </div>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={
            isHiToEn
              ? 'हिंदी में लिखें... जैसे: "हिमालय की बर्फीली चोटियों पर सूर्योदय, सिनेमैटिक"'
              : 'Type in English... e.g., "Misty Himalayan peaks at sunrise, cinematic"'
          }
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-2xl border border-dusk-200 bg-white/80 px-4 py-3.5 text-sm text-dusk-900 placeholder:text-dusk-400 transition focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900/80 dark:text-white dark:placeholder:text-dusk-500"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <button
              onClick={() => setRefineForAI((r) => !r)}
              className={`relative h-5 w-9 rounded-full transition ${refineForAI ? 'bg-summit-500' : 'bg-dusk-300 dark:bg-dusk-700'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${refineForAI ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-xs font-medium text-dusk-600 dark:text-dusk-300">
              Refine for AI prompt
            </span>
          </label>
          <span className="text-[10px] font-medium text-dusk-400">{sourceText.length}/2000</span>
        </div>
      </div>

      {/* Translate button */}
      <button
        onClick={handleTranslate}
        disabled={status === 'loading' || !sourceText.trim()}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-summit-500 to-summit-600 py-4 text-base font-bold text-white shadow-xl shadow-summit-500/30 transition-all hover:shadow-summit-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {status === 'loading' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Translating…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" fill="currentColor" />
            Translate {isHiToEn ? 'to English' : 'to Hindi'}
          </>
        )}
      </button>

      {/* Result */}
      {status === 'loading' && (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dusk-200 bg-white/60 p-6 dark:border-dusk-700 dark:bg-dusk-900/60">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-summit-500" />
            <p className="text-sm text-dusk-500 dark:text-dusk-400">
              {refineForAI ? 'Translating & refining for AI…' : 'Translating…'}
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-error-500/30 bg-error-500/5 p-6 text-center animate-scale-in">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-error-500/10">
            <AlertCircle className="h-6 w-6 text-error-500" />
          </div>
          <p className="text-sm font-semibold text-error-600 dark:text-error-400">Translation failed</p>
          <p className="mt-1 max-w-sm text-xs text-dusk-500 dark:text-dusk-400">
            {response?.error || 'An unexpected error occurred.'}
          </p>
        </div>
      )}

      {status === 'success' && response?.translation && (
        <div className="space-y-3 animate-scale-in">
          {/* Main translation */}
          <div className="rounded-2xl border border-summit-500/30 bg-summit-50/40 p-4 dark:bg-summit-950/20">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-summit-600 dark:text-summit-400">
                <Languages className="h-3.5 w-3.5" />
                {isHiToEn ? 'English Translation' : 'Hindi Translation'}
              </span>
              <button
                onClick={() => handleCopy(response.translation!)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-dusk-400 transition hover:text-summit-500"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-dusk-800 dark:text-dusk-100">
              {response.translation}
            </p>
            {response.detectedLanguage && (
              <p className="mt-2 text-[10px] text-dusk-400">
                Detected: {response.detectedLanguage}
                {response.confidence != null && ` · ${Math.round(response.confidence * 100)}% confidence`}
              </p>
            )}
          </div>

          {/* Refined AI prompt */}
          {response.refinedPrompt && response.refinedPrompt !== response.translation && (
            <div className="rounded-2xl border border-accent-500/30 bg-accent-400/5 p-4 dark:bg-accent-500/10">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Refined AI Prompt
                </span>
                <button
                  onClick={() => handleCopy(response.refinedPrompt!)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-dusk-400 transition hover:text-accent-500"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <p className="text-sm leading-relaxed text-dusk-800 dark:text-dusk-100">
                {response.refinedPrompt}
              </p>
            </div>
          )}

          {/* Use as prompt */}
          <button
            onClick={handleUseAsPrompt}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-summit-500/30 bg-summit-500/5 py-3 text-sm font-semibold text-summit-600 transition hover:bg-summit-500/10 active:scale-95 dark:text-summit-400"
          >
            <ArrowRight className="h-4 w-4" />
            Use in AI Generator
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-dusk-700 dark:text-dusk-200">Recent Translations</h3>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1 text-xs text-dusk-400 transition hover:text-error-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {history.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-dusk-200 bg-white/60 p-3 dark:border-dusk-700 dark:bg-dusk-900/60"
              >
                <div className="flex items-center gap-2 text-[10px] text-dusk-400">
                  <span className="rounded-md bg-dusk-100 px-1.5 py-0.5 font-medium dark:bg-dusk-800">
                    {entry.direction === 'hi-to-en' ? 'HI → EN' : 'EN → HI'}
                  </span>
                  {entry.refinedPrompt && (
                    <span className="rounded-md bg-accent-400/10 px-1.5 py-0.5 font-medium text-accent-500">
                      AI Refined
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs text-dusk-500 dark:text-dusk-400">
                  {entry.sourceText}
                </p>
                <p className="mt-1 text-sm font-medium text-dusk-800 dark:text-dusk-100">
                  {entry.refinedPrompt || entry.translatedText}
                </p>
                <button
                  onClick={() => handleCopy(entry.refinedPrompt || entry.translatedText)}
                  className="mt-1.5 flex items-center gap-1 text-[10px] text-dusk-400 transition hover:text-summit-500"
                >
                  <Copy className="h-3 w-3" />
                  Copy result
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LangButton({
  active,
  onClick,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition ${
        active
          ? 'bg-gradient-to-br from-summit-400 to-summit-600 text-white shadow-lg shadow-summit-500/30'
          : 'text-dusk-400 hover:text-dusk-600 dark:text-dusk-500'
      }`}
    >
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[9px] opacity-80">{sublabel}</span>
    </button>
  );
}
