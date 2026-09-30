import { Loader2, AlertCircle, Download, Share2, RotateCcw, Check, Video, Image, Clock, Cpu } from 'lucide-react';
import type { GenerationMode, GenerationStatus, MediaResult } from '@/types';
import type { GenerateResponse } from '@/types';
import { formatTime } from '@/lib/api';

interface MediaPreviewProps {
  status: GenerationStatus;
  mode: GenerationMode;
  prompt: string;
  result: MediaResult | null;
  response: GenerateResponse | null;
  elapsedSeconds: number;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
}

export function MediaPreview({
  status,
  mode,
  prompt,
  result,
  response,
  elapsedSeconds,
  onDownload,
  onShare,
  onRegenerate,
}: MediaPreviewProps) {
  if (status === 'idle') {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-dusk-300 bg-dusk-50/40 p-6 text-center dark:border-dusk-700 dark:bg-dusk-900/40">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-dusk-100 dark:bg-dusk-800">
          {mode === 'image' ? (
            <Image className="h-7 w-7 text-dusk-400" />
          ) : (
            <Video className="h-7 w-7 text-dusk-400" />
          )}
        </div>
        <p className="text-sm font-medium text-dusk-500 dark:text-dusk-400">
          Your {mode === 'image' ? 'image' : 'video'} will appear here
        </p>
        <p className="mt-1 text-xs text-dusk-400 dark:text-dusk-500">
          Write a prompt and tap Generate Media
        </p>
      </div>
    );
  }

  if (status === 'loading') {
    return <LoadingCard mode={mode} elapsed={elapsedSeconds} />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-error-500/30 bg-error-500/5 p-6 text-center animate-scale-in">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-500/10">
          <AlertCircle className="h-7 w-7 text-error-500" />
        </div>
        <p className="text-sm font-semibold text-error-600 dark:text-error-400">Generation failed</p>
        <p className="mt-2 max-w-sm text-xs text-dusk-500 dark:text-dusk-400">
          {response?.error || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={onRegenerate}
          className="mt-4 flex items-center gap-2 rounded-xl bg-error-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-error-600"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Success
  if (!result) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-dusk-200 bg-white animate-scale-in dark:border-dusk-700 dark:bg-dusk-900">
      {/* Media display */}
      <div className="relative bg-dusk-950">
        {mode === 'image' ? (
          <img
            src={result.url}
            alt={prompt}
            className="mx-auto max-h-[420px] w-full object-contain"
            loading="lazy"
          />
        ) : (
          <video
            src={result.url}
            poster={result.thumbnailUrl}
            controls
            playsInline
            className="mx-auto max-h-[420px] w-full object-contain"
          />
        )}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-dusk-950/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
          <Check className="h-3 w-3 text-success-500" />
          Ready
        </div>
      </div>

      {/* Metadata bar */}
      {response?.metadata && (
        <div className="flex flex-wrap items-center gap-3 border-b border-dusk-100 px-4 py-2.5 dark:border-dusk-800">
          {response.metadata.model && (
            <span className="flex items-center gap-1 text-[10px] text-dusk-400">
              <Cpu className="h-3 w-3" />
              {response.metadata.model}
            </span>
          )}
          {response.metadata.processingTime != null && (
            <span className="flex items-center gap-1 text-[10px] text-dusk-400">
              <Clock className="h-3 w-3" />
              {formatTime(response.metadata.processingTime)}
            </span>
          )}
          {response.metadata.resolution && (
            <span className="text-[10px] text-dusk-400">{response.metadata.resolution}</span>
          )}
          {response.metadata.seed != null && (
            <span className="text-[10px] text-dusk-400">seed: {response.metadata.seed}</span>
          )}
        </div>
      )}

      {/* Prompt display */}
      <div className="px-4 py-3">
        <p className="line-clamp-2 text-xs text-dusk-500 dark:text-dusk-400">{prompt}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-dusk-100 p-3 dark:border-dusk-800">
        <button
          onClick={onDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-summit-500 py-2.5 text-sm font-semibold text-white transition hover:bg-summit-600 active:scale-95"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={onShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dusk-200 py-2.5 text-sm font-semibold text-dusk-700 transition hover:bg-dusk-50 active:scale-95 dark:border-dusk-700 dark:text-dusk-200 dark:hover:bg-dusk-800"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 rounded-xl border border-dusk-200 px-3 py-2.5 text-sm font-semibold text-dusk-600 transition hover:bg-dusk-50 active:scale-95 dark:border-dusk-700 dark:text-dusk-300 dark:hover:bg-dusk-800"
          aria-label="Regenerate"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LoadingCard({ mode, elapsed }: { mode: GenerationMode; elapsed: number }) {
  const phases = mode === 'video'
    ? ['Interpreting prompt', 'Generating keyframes', 'Rendering frames', 'Encoding video']
    : ['Interpreting prompt', 'Generating pixels', 'Upscaling', 'Finalizing'];

  const phaseIndex = Math.min(Math.floor(elapsed / 8), phases.length - 1);

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dusk-200 bg-white/60 p-6 dark:border-dusk-700 dark:bg-dusk-900/60">
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-dusk-100 dark:border-dusk-800" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-summit-500" />
        <Loader2 className="h-6 w-6 animate-spin text-summit-500" />
      </div>

      <p className="text-sm font-semibold text-dusk-700 dark:text-dusk-200">
        {mode === 'image' ? 'Generating image' : 'Rendering video'}…
      </p>

      <div className="mt-3 w-full max-w-xs space-y-2">
        {phases.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < phaseIndex
                  ? 'bg-summit-500'
                  : i === phaseIndex
                  ? 'bg-summit-400 animate-pulse-soft'
                  : 'bg-dusk-200 dark:bg-dusk-800'
              }`}
            />
            <span
              className={`text-[10px] font-medium ${
                i <= phaseIndex ? 'text-dusk-600 dark:text-dusk-300' : 'text-dusk-400'
              }`}
            >
              {p}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-dusk-400">
        {elapsed > 0 ? `${elapsed}s elapsed` : 'Starting…'}
        {mode === 'video' && elapsed > 15 && ' — videos can take up to 3 min'}
      </p>
    </div>
  );
}
