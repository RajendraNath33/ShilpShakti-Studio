import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Zap, Repeat, Languages } from 'lucide-react';
import type { AppSettings, GenerateResponse, GenerationMode, GenerationStatus, MediaResult } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import {
  type Theme,
  generateMedia,
  generateId,
  downloadFile,
  shareMedia,
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  loadTheme,
  saveTheme,
} from '@/lib/api';
import { useCountdown, useToast } from '@/lib/hooks';
import { MountainBackdrop } from '@/components/MountainBackdrop';
import { Header } from '@/components/Header';
import { ModeSelector } from '@/components/ModeSelector';
import { PromptInput } from '@/components/PromptInput';
import { SettingsPanel } from '@/components/SettingsPanel';
import { MediaPreview } from '@/components/MediaPreview';
import { BottomNav, SideNav, type View } from '@/components/BottomNav';
import { Gallery, PreviewModal } from '@/components/Gallery';
import { SettingsView } from '@/components/SettingsView';
import { MediaConverter } from '@/components/MediaConverter';
import { TranslatorTool } from '@/components/TranslatorTool';
import { Toast } from '@/components/Toast';
import { AuthGate } from '@/components/AuthGate';

function Studio() {
  // Theme
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS, ...loadSettings() }));
  useEffect(() => { saveSettings(settings); }, [settings]);

  // Generation state
  const [mode, setMode] = useState<GenerationMode>('image');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [result, setResult] = useState<MediaResult | null>(null);
  const elapsed = useCountdown(0, status === 'loading');

  // History
  const [history, setHistory] = useState<MediaResult[]>(() => loadHistory());
  useEffect(() => { saveHistory(history); }, [history]);

  // Navigation
  const [view, setView] = useState<View>('studio');
  const [previewItem, setPreviewItem] = useState<MediaResult | null>(null);

  // Toast
  const { toast, show } = useToast();
  const showToast = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => show(message, type), [show]);

  // Sync mode from URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'image' || urlMode === 'video') setMode(urlMode);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt first', 'error');
      return;
    }
    if (!settings.webhookUrl) {
      showToast('Please set a backend webhook URL in Settings', 'error');
      return;
    }

    setStatus('loading');
    setResponse(null);
    setResult(null);

    const res = await generateMedia(
      {
        mode,
        prompt: prompt.trim(),
        aspectRatio: settings.aspectRatio,
        stylePreset: settings.stylePreset,
        quality: settings.quality,
        seed: settings.seed,
        negativePrompt: settings.negativePrompt,
      },
      settings.webhookUrl
    );

    setResponse(res);

    if (!res.success || !res.mediaUrl) {
      setStatus('error');
      return;
    }

    const media: MediaResult = {
      id: generateId(),
      mode,
      prompt: prompt.trim(),
      url: res.mediaUrl,
      thumbnailUrl: res.thumbnailUrl,
      createdAt: Date.now(),
      aspectRatio: settings.aspectRatio,
      duration: res.metadata?.duration,
    };

    setResult(media);
    setHistory((h) => [media, ...h]);
    setStatus('success');

    if (settings.autoDownload) {
      downloadFile(res.mediaUrl!, `devbhumi-${mode}-${media.id}.${mode === 'image' ? 'png' : 'mp4'}`);
    }
  }, [prompt, settings, mode, showToast]);

  const handleDownload = useCallback((item?: MediaResult) => {
    const target = item || result;
    if (!target) return;
    const ext = target.mode === 'image' ? 'png' : 'mp4';
    downloadFile(target.url, `devbhumi-${target.mode}-${target.id}.${ext}`);
    showToast('Download started', 'success');
  }, [result, showToast]);

  const handleShare = useCallback(async (item?: MediaResult) => {
    const target = item || result;
    if (!target) return;
    const shared = await shareMedia(target.url, target.prompt);
    if (!shared) {
      try {
        await navigator.clipboard.writeText(target.url);
        showToast('Link copied to clipboard', 'info');
      } catch {
        showToast('Sharing not available on this device', 'error');
      }
    }
  }, [result, showToast]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    showToast('Gallery cleared', 'info');
  }, [showToast]);

  const handleResetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    showToast('Settings reset to defaults', 'info');
  }, [showToast]);

  const handleUseAsPrompt = useCallback((text: string) => {
    setPrompt(text);
    setView('studio');
  }, []);

  const studioContent = useMemo(() => (
    <div className="space-y-5">
      <ModeSelector mode={mode} onChange={setMode} />
      <PromptInput mode={mode} prompt={prompt} onChange={setPrompt} />
      <SettingsPanel settings={settings} onChange={setSettings} />

      <button
        onClick={handleGenerate}
        disabled={status === 'loading' || !prompt.trim()}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-summit-500 to-summit-600 py-4 text-base font-bold text-white shadow-xl shadow-summit-500/30 transition-all hover:shadow-summit-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {status === 'loading' ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" fill="currentColor" />
            Generate {mode === 'image' ? 'Image' : 'Video'}
          </>
        )}
      </button>

      <MediaPreview
        status={status}
        mode={mode}
        prompt={prompt}
        result={result}
        response={response}
        elapsedSeconds={elapsed}
        onDownload={() => handleDownload()}
        onShare={() => handleShare()}
        onRegenerate={handleGenerate}
      />
    </div>
  ), [mode, prompt, settings, status, result, response, elapsed, handleGenerate, handleDownload, handleShare]);

  return (
    <div className="relative min-h-screen text-dusk-900 dark:text-white">
      <MountainBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onOpenMenu={() => setView(view === 'settings' ? 'studio' : 'settings')}
        />

        <main className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 pb-24 pt-6 md:pb-6">
          <SideNav view={view} onChange={setView} />

          <div className="flex-1 min-w-0">
            {view === 'studio' && (
              <div className="mx-auto max-w-2xl animate-fade-in">
                <div className="mb-6 text-center">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-summit-500/20 bg-summit-500/5 px-3 py-1 text-xs font-medium text-summit-600 dark:text-summit-400">
                    <Sparkles className="h-3 w-3" />
                    Mountain-Inspired AI Generation
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-dusk-900 dark:text-white">
                    Create stunning media
                  </h2>
                  <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">
                    Transform your words into breathtaking images and cinematic videos
                  </p>
                </div>
                {studioContent}
              </div>
            )}

            {view === 'converter' && (
              <div className="mx-auto max-w-2xl animate-fade-in">
                <div className="mb-6 text-center">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-summit-500/20 bg-summit-500/5 px-3 py-1 text-xs font-medium text-summit-600 dark:text-summit-400">
                    <Repeat className="h-3 w-3" />
                    Media Conversion
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-dusk-900 dark:text-white">
                    Video ⇄ Audio Converter
                  </h2>
                  <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">
                    Extract audio from video or create video from audio tracks
                  </p>
                </div>
                <MediaConverter settings={settings} showToast={showToast} />
              </div>
            )}

            {view === 'translator' && (
              <div className="mx-auto max-w-2xl animate-fade-in">
                <div className="mb-6 text-center">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-summit-500/20 bg-summit-500/5 px-3 py-1 text-xs font-medium text-summit-600 dark:text-summit-400">
                    <Languages className="h-3 w-3" />
                    Bilingual Prompt Helper
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-dusk-900 dark:text-white">
                    Hindi ⇄ English Translator
                  </h2>
                  <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">
                    Translate regional Hindi prompts into professional English AI prompts
                  </p>
                </div>
                <TranslatorTool settings={settings} showToast={showToast} onUseAsPrompt={handleUseAsPrompt} />
              </div>
            )}

            {view === 'gallery' && (
              <div className="mx-auto max-w-3xl animate-fade-in">
                <Gallery
                  history={history}
                  onClear={handleClearHistory}
                  onDownload={(item) => handleDownload(item)}
                  onShare={(item) => handleShare(item)}
                  onPreview={setPreviewItem}
                />
              </div>
            )}

            {view === 'settings' && (
              <div className="mx-auto max-w-2xl animate-fade-in">
                <SettingsView
                  settings={settings}
                  onChange={setSettings}
                  onReset={handleResetSettings}
                />
              </div>
            )}
          </div>
        </main>

        <BottomNav view={view} onChange={setView} />
      </div>

      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onDownload={() => handleDownload(previewItem)}
          onShare={() => handleShare(previewItem)}
        />
      )}

      <Toast toast={toast} onDismiss={() => show('', 'info')} />
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <Studio />
    </AuthGate>
  );
}
