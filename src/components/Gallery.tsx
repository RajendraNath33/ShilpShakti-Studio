import { Trash2, Download, Share2, Image, Video, X } from 'lucide-react';
import type { MediaResult } from '@/types';
import { formatDate } from '@/lib/api';

interface GalleryProps {
  history: MediaResult[];
  onClear: () => void;
  onDownload: (item: MediaResult) => void;
  onShare: (item: MediaResult) => void;
  onPreview: (item: MediaResult) => void;
}

export function Gallery({ history, onClear, onDownload, onShare, onPreview }: GalleryProps) {
  if (history.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-dusk-300 bg-dusk-50/40 p-6 text-center dark:border-dusk-700 dark:bg-dusk-900/40">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-dusk-100 dark:bg-dusk-800">
          <Image className="h-7 w-7 text-dusk-400" />
        </div>
        <p className="text-sm font-medium text-dusk-500 dark:text-dusk-400">No creations yet</p>
        <p className="mt-1 text-xs text-dusk-400 dark:text-dusk-500">
          Your generated media will be saved here automatically
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-dusk-900 dark:text-white">Gallery</h2>
          <p className="text-xs text-dusk-400">{history.length} creation{history.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-lg border border-dusk-200 px-3 py-2 text-xs font-medium text-dusk-500 transition hover:border-error-500/30 hover:text-error-500 dark:border-dusk-700 dark:text-dusk-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-xl border border-dusk-200 bg-white dark:border-dusk-700 dark:bg-dusk-900"
          >
            <button onClick={() => onPreview(item)} className="block w-full">
              <div className="relative aspect-square bg-dusk-950">
                {item.mode === 'image' ? (
                  <img src={item.url} alt={item.prompt} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <>
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.prompt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-dusk-950/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                        <Video className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </button>

            <div className="p-2.5">
              <p className="line-clamp-2 text-[10px] leading-snug text-dusk-500 dark:text-dusk-400">
                {item.prompt}
              </p>
              <p className="mt-1 text-[9px] text-dusk-400">{formatDate(item.createdAt)}</p>
            </div>

            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => onDownload(item)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-dusk-950/70 text-white backdrop-blur transition hover:bg-dusk-950"
                aria-label="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onShare(item)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-dusk-950/70 text-white backdrop-blur transition hover:bg-dusk-950"
                aria-label="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewModal({
  item,
  onClose,
  onDownload,
  onShare,
}: {
  item: MediaResult;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dusk-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative mx-4 max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-dusk-900 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-dusk-950/60 text-white backdrop-blur transition hover:bg-dusk-950"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-dusk-950">
          {item.mode === 'image' ? (
            <img src={item.url} alt={item.prompt} className="mx-auto max-h-[60vh] w-full object-contain" />
          ) : (
            <video src={item.url} poster={item.thumbnailUrl} controls autoPlay loop className="mx-auto max-h-[60vh] w-full object-contain" />
          )}
        </div>

        <div className="p-4">
          <p className="text-sm text-dusk-700 dark:text-dusk-200">{item.prompt}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-summit-500 py-2.5 text-sm font-semibold text-white transition hover:bg-summit-600"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={onShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dusk-200 py-2.5 text-sm font-semibold text-dusk-700 transition hover:bg-dusk-50 dark:border-dusk-700 dark:text-dusk-200 dark:hover:bg-dusk-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
