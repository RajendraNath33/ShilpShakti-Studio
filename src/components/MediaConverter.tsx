import { useCallback, useRef, useState } from 'react';
import {
  Upload, Link, Film, Music, ArrowRightLeft, Download, Share2,
  Loader2, AlertCircle, Check, FileVideo, FileAudio, X, Zap,
} from 'lucide-react';
import type { AppSettings, ConversionDirection, ConversionStatus, ConversionResult, ConvertResponse } from '@/types';
import { convertMedia, convertMediaByUrl, downloadFile, shareMedia, generateId, formatTime } from '@/lib/api';

interface MediaConverterProps {
  settings: AppSettings;
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
}

type InputMode = 'upload' | 'url';

const AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
const VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];

export function MediaConverter({ settings, showToast }: MediaConverterProps) {
  const [direction, setDirection] = useState<ConversionDirection>('video-to-audio');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [quality, setQuality] = useState('standard');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [response, setResponse] = useState<ConvertResponse | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoToAudio = direction === 'video-to-audio';
  const formats = isVideoToAudio ? AUDIO_FORMATS : VIDEO_FORMATS;

  const handleDirectionToggle = useCallback(() => {
    setDirection((d) => (d === 'video-to-audio' ? 'audio-to-video' : 'video-to-audio'));
    setOutputFormat(isVideoToAudio ? 'mp4' : 'mp3');
    setFile(null);
    setSourceUrl('');
    setStatus('idle');
    setResult(null);
    setResponse(null);
  }, [isVideoToAudio]);

  const handleFileSelect = useCallback((selected: File | null) => {
    if (!selected) return;
    if (isVideoToAudio && !selected.type.startsWith('video/')) {
      showToast('Please select a video file', 'error');
      return;
    }
    if (!isVideoToAudio && !selected.type.startsWith('audio/')) {
      showToast('Please select an audio file', 'error');
      return;
    }
    if (selected.size > 500 * 1024 * 1024) {
      showToast('File too large (max 500MB)', 'error');
      return;
    }
    setFile(selected);
    setStatus('idle');
    setResult(null);
  }, [isVideoToAudio, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped);
  }, [handleFileSelect]);

  const handleConvert = useCallback(async () => {
    if (inputMode === 'upload' && !file) {
      showToast('Please select a file first', 'error');
      return;
    }
    if (inputMode === 'url' && !sourceUrl.trim()) {
      showToast('Please enter a media URL', 'error');
      return;
    }
    if (!settings.converterWebhookUrl) {
      showToast('Please set a converter webhook URL in Settings', 'error');
      return;
    }

    setStatus('converting');
    setResponse(null);
    setResult(null);
    setElapsed(0);

    const startTime = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 100);

    let res: ConvertResponse;
    if (inputMode === 'upload' && file) {
      res = await convertMedia(file, direction, settings.converterWebhookUrl, { format: outputFormat, quality });
    } else {
      res = await convertMediaByUrl(sourceUrl.trim(), direction, settings.converterWebhookUrl, { format: outputFormat, quality });
    }

    clearInterval(timer);
    setResponse(res);

    if (!res.success || !res.resultUrl) {
      setStatus('error');
      return;
    }

    const convResult: ConversionResult = {
      id: generateId(),
      direction,
      sourceName: file?.name || sourceUrl,
      resultUrl: res.resultUrl,
      thumbnailUrl: res.thumbnailUrl,
      createdAt: Date.now(),
      fileSize: res.metadata?.fileSize,
      duration: res.metadata?.duration,
      format: outputFormat,
    };

    setResult(convResult);
    setStatus('success');
    showToast('Conversion complete', 'success');

    if (settings.autoDownload) {
      downloadFile(res.resultUrl, `devbhumi-converted-${convResult.id}.${outputFormat}`);
    }
  }, [file, sourceUrl, inputMode, direction, outputFormat, quality, settings, showToast]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadFile(result.resultUrl, `devbhumi-converted-${result.id}.${result.format}`);
    showToast('Download started', 'success');
  }, [result, showToast]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const shared = await shareMedia(result.resultUrl, `Converted ${result.sourceName}`);
    if (!shared) {
      try {
        await navigator.clipboard.writeText(result.resultUrl);
        showToast('Link copied to clipboard', 'info');
      } catch {
        showToast('Sharing not available on this device', 'error');
      }
    }
  }, [result, showToast]);

  return (
    <div className="space-y-5">
      {/* Direction selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl border border-dusk-200 bg-dusk-100/60 p-1 dark:border-dusk-700 dark:bg-dusk-900/60">
          <DirectionButton
            active={isVideoToAudio}
            onClick={() => !isVideoToAudio && handleDirectionToggle()}
            icon={Film}
            label="Video"
            sublabel="to Audio"
          />
          <button
            onClick={handleDirectionToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-summit-500 text-white shadow-lg shadow-summit-500/30 transition active:scale-90"
            aria-label="Swap direction"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>
          <DirectionButton
            active={!isVideoToAudio}
            onClick={() => isVideoToAudio && handleDirectionToggle()}
            icon={Music}
            label="Audio"
            sublabel="to Video"
          />
        </div>
      </div>

      {/* Input mode toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setInputMode('upload')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
            inputMode === 'upload'
              ? 'bg-summit-500/10 text-summit-600 dark:text-summit-400'
              : 'text-dusk-400 hover:text-dusk-600 dark:text-dusk-500'
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
            inputMode === 'url'
              ? 'bg-summit-500/10 text-summit-600 dark:text-summit-400'
              : 'text-dusk-400 hover:text-dusk-600 dark:text-dusk-500'
          }`}
        >
          <Link className="h-4 w-4" />
          Paste URL
        </button>
      </div>

      {/* Input area */}
      {inputMode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragOver
              ? 'border-summit-400 bg-summit-50 dark:bg-summit-950/30'
              : file
              ? 'border-summit-400/40 bg-summit-50/30 dark:bg-summit-950/20'
              : 'border-dusk-300 bg-dusk-50/40 hover:border-summit-400/60 dark:border-dusk-700 dark:bg-dusk-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={isVideoToAudio ? 'video/*' : 'audio/*'}
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {file ? (
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-summit-500/10">
                {isVideoToAudio ? <FileVideo className="h-7 w-7 text-summit-500" /> : <FileAudio className="h-7 w-7 text-summit-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-dusk-800 dark:text-dusk-100">{file.name}</p>
                <p className="text-xs text-dusk-400">{formatFileSize(file.size)} · {file.type || 'unknown'}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); setResult(null); }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-dusk-400 hover:text-error-500"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dusk-100 dark:bg-dusk-800">
                <Upload className="h-7 w-7 text-dusk-400" />
              </div>
              <p className="text-sm font-medium text-dusk-600 dark:text-dusk-300">
                Tap to upload or drag & drop
              </p>
              <p className="text-xs text-dusk-400">
                {isVideoToAudio ? 'MP4, WebM, MOV, AVI, MKV' : 'MP3, WAV, AAC, FLAC, OGG'} · max 500MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/media-file.mp4"
            className="w-full rounded-xl border border-dusk-200 bg-white px-4 py-3.5 text-sm text-dusk-900 placeholder:text-dusk-400 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          />
          <p className="text-xs text-dusk-400">
            Paste a direct URL to your {isVideoToAudio ? 'video' : 'audio'} file
          </p>
        </div>
      )}

      {/* Output settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
            Output Format
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          >
            {formats.map((f) => (
              <option key={f} value={f}>{f.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
            Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          >
            <option value="draft">Draft (fast)</option>
            <option value="standard">Standard</option>
            <option value="high">High (slow)</option>
          </select>
        </div>
      </div>

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={status === 'converting' || (inputMode === 'upload' ? !file : !sourceUrl.trim())}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-summit-500 to-summit-600 py-4 text-base font-bold text-white shadow-xl shadow-summit-500/30 transition-all hover:shadow-summit-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {status === 'converting' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Converting…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" fill="currentColor" />
            Convert to {outputFormat.toUpperCase()}
          </>
        )}
      </button>

      {/* Result / status */}
      {status === 'converting' && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dusk-200 bg-white/60 p-6 dark:border-dusk-700 dark:bg-dusk-900/60">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-summit-500" />
            <Loader2 className="h-6 w-6 animate-spin text-summit-500" />
          </div>
          <p className="text-sm font-semibold text-dusk-700 dark:text-dusk-200">
            Converting {isVideoToAudio ? 'video to audio' : 'audio to video'}…
          </p>
          <p className="mt-2 text-xs text-dusk-400">
            {elapsed > 0 ? `${elapsed}s elapsed` : 'Starting…'} — large files may take a few minutes
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-error-500/30 bg-error-500/5 p-6 text-center animate-scale-in">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-500/10">
            <AlertCircle className="h-7 w-7 text-error-500" />
          </div>
          <p className="text-sm font-semibold text-error-600 dark:text-error-400">Conversion failed</p>
          <p className="mt-2 max-w-sm text-xs text-dusk-500 dark:text-dusk-400">
            {response?.error || 'An unexpected error occurred.'}
          </p>
        </div>
      )}

      {status === 'success' && result && (
        <div className="overflow-hidden rounded-2xl border border-dusk-200 bg-white animate-scale-in dark:border-dusk-700 dark:bg-dusk-900">
          <div className="relative bg-dusk-950">
            {isVideoToAudio ? (
              <div className="flex flex-col items-center gap-3 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-summit-500/10">
                  <Music className="h-8 w-8 text-summit-400" />
                </div>
                <audio src={result.resultUrl} controls className="w-full" />
              </div>
            ) : (
              <video src={result.resultUrl} poster={result.thumbnailUrl} controls playsInline className="mx-auto max-h-[420px] w-full object-contain" />
            )}
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-dusk-950/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
              <Check className="h-3 w-3 text-success-500" />
              Converted
            </div>
          </div>

          {response?.metadata && (
            <div className="flex flex-wrap items-center gap-3 border-b border-dusk-100 px-4 py-2.5 dark:border-dusk-800">
              {response.metadata.codec && (
                <span className="text-[10px] text-dusk-400">codec: {response.metadata.codec}</span>
              )}
              {response.metadata.bitrate && (
                <span className="text-[10px] text-dusk-400">{response.metadata.bitrate}</span>
              )}
              {result.fileSize != null && (
                <span className="text-[10px] text-dusk-400">{formatFileSize(result.fileSize)}</span>
              )}
              {result.duration != null && (
                <span className="text-[10px] text-dusk-400">{formatTime(result.duration * 1000)}</span>
              )}
            </div>
          )}

          <div className="px-4 py-3">
            <p className="truncate text-xs text-dusk-500 dark:text-dusk-400">{result.sourceName}</p>
          </div>

          <div className="flex gap-2 border-t border-dusk-100 p-3 dark:border-dusk-800">
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-summit-500 py-2.5 text-sm font-semibold text-white transition hover:bg-summit-600 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dusk-200 py-2.5 text-sm font-semibold text-dusk-700 transition hover:bg-dusk-50 active:scale-95 dark:border-dusk-700 dark:text-dusk-200 dark:hover:bg-dusk-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DirectionButton({
  active,
  onClick,
  icon: Icon,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Film;
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
      <Icon className="h-5 w-5" />
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[9px] opacity-80">{sublabel}</span>
    </button>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
