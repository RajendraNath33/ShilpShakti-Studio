import { useState } from 'react';
import { Sliders, X } from 'lucide-react';
import type { AppSettings } from '@/types';
import { ASPECT_RATIOS, STYLE_PRESETS, QUALITY_OPTIONS } from '@/types';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-dusk-200 bg-dusk-50/60 px-4 py-3 text-sm font-semibold text-dusk-700 transition hover:bg-dusk-100/60 dark:border-dusk-700 dark:bg-dusk-900/60 dark:text-dusk-200 dark:hover:bg-dusk-800/60"
      >
        <span className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-summit-500" />
          Advanced Settings
        </span>
        <span className="text-xs font-normal text-dusk-400">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && (
        <div className="space-y-5 rounded-2xl border border-dusk-200 bg-white/60 p-4 animate-slide-up dark:border-dusk-700 dark:bg-dusk-900/60">
          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => onChange({ ...settings, aspectRatio: ar.value })}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    settings.aspectRatio === ar.value
                      ? 'bg-summit-500 text-white'
                      : 'border border-dusk-200 bg-dusk-50 text-dusk-600 hover:border-summit-400 dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <AspectIcon ratio={ar.value} active={settings.aspectRatio === ar.value} />
                    {ar.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style Preset */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
              Style Preset
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STYLE_PRESETS.map((sp) => (
                <button
                  key={sp.value}
                  onClick={() => onChange({ ...settings, stylePreset: sp.value })}
                  className={`rounded-xl border p-3 text-left transition ${
                    settings.stylePreset === sp.value
                      ? 'border-summit-400 bg-summit-50 dark:border-summit-500 dark:bg-summit-950/40'
                      : 'border-dusk-200 bg-dusk-50 hover:border-dusk-300 dark:border-dusk-700 dark:bg-dusk-800/60'
                  }`}
                >
                  <div className="text-xs font-semibold text-dusk-800 dark:text-dusk-100">{sp.label}</div>
                  <div className="mt-0.5 text-[10px] text-dusk-400">{sp.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
              Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q.value}
                  onClick={() => onChange({ ...settings, quality: q.value })}
                  className={`rounded-xl border px-3 py-2.5 text-center transition ${
                    settings.quality === q.value
                      ? 'border-summit-400 bg-summit-50 dark:border-summit-500 dark:bg-summit-950/40'
                      : 'border-dusk-200 bg-dusk-50 hover:border-dusk-300 dark:border-dusk-700 dark:bg-dusk-800/60'
                  }`}
                >
                  <div className="text-xs font-semibold text-dusk-800 dark:text-dusk-100">{q.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Seed + Negative Prompt */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
                Seed (optional)
              </label>
              <input
                type="text"
                value={settings.seed}
                onChange={(e) => onChange({ ...settings, seed: e.target.value })}
                placeholder="Random"
                className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 placeholder:text-dusk-400 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
                Negative Prompt
              </label>
              <input
                type="text"
                value={settings.negativePrompt}
                onChange={(e) => onChange({ ...settings, negativePrompt: e.target.value })}
                placeholder="blurry, low quality, distorted"
                className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 placeholder:text-dusk-400 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
              />
            </div>
          </div>

          {/* Webhook URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">
              Backend Webhook URL
            </label>
            <input
              type="text"
              value={settings.webhookUrl}
              onChange={(e) => onChange({ ...settings, webhookUrl: e.target.value })}
              placeholder="/generate-ai-media"
              className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 placeholder:text-dusk-400 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
            />
            <p className="text-[10px] text-dusk-400">
              Your n8n webhook endpoint. Defaults to <code className="font-mono">/generate-ai-media</code>.
            </p>
          </div>

          {/* Auto download */}
          <label className="flex items-center justify-between">
            <span className="text-xs font-medium text-dusk-600 dark:text-dusk-300">
              Auto-download after generation
            </span>
            <button
              onClick={() => onChange({ ...settings, autoDownload: !settings.autoDownload })}
              className={`relative h-6 w-11 rounded-full transition ${
                settings.autoDownload ? 'bg-summit-500' : 'bg-dusk-300 dark:bg-dusk-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  settings.autoDownload ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dusk-200 py-2 text-xs font-medium text-dusk-500 transition hover:bg-dusk-100 dark:border-dusk-700 dark:text-dusk-400 dark:hover:bg-dusk-800"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function AspectIcon({ ratio, active }: { ratio: string; active: boolean }) {
  const [w, h] = ratio.split(':').map(Number);
  const max = 18;
  const scale = max / Math.max(w, h);
  const bw = Math.round(w * scale);
  const bh = Math.round(h * scale);
  return (
    <div
      className={`rounded-sm border-2 ${active ? 'border-white' : 'border-current'}`}
      style={{ width: `${bw}px`, height: `${bh}px` }}
    />
  );
}
