import { useState } from 'react';
import { Trash2, Info } from 'lucide-react';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

interface SettingsViewProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onReset: () => void;
}

export function SettingsView({ settings, onChange, onReset }: SettingsViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-dusk-900 dark:text-white">Settings</h2>
        <p className="text-xs text-dusk-400">Configure your Devbhumi AI Studio preferences</p>
      </div>

      {/* Backend config */}
      <Section title="AI Generator Backend" description="Webhook for image & video generation">
        <Field label="Generation Webhook URL">
          <input
            type="text"
            value={settings.webhookUrl}
            onChange={(e) => onChange({ ...settings, webhookUrl: e.target.value })}
            className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          />
        </Field>
        <div className="flex items-start gap-2 rounded-xl bg-dusk-50 p-3 dark:bg-dusk-800/40">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-summit-500" />
          <p className="text-xs text-dusk-500 dark:text-dusk-400">
            Receives POST requests with your prompt and settings. Respond with JSON containing <code className="font-mono">success</code> and <code className="font-mono">mediaUrl</code>.
          </p>
        </div>
      </Section>

      <Section title="Media Converter Backend" description="Webhook for video ⇄ audio conversion">
        <Field label="Converter Webhook URL">
          <input
            type="text"
            value={settings.converterWebhookUrl}
            onChange={(e) => onChange({ ...settings, converterWebhookUrl: e.target.value })}
            className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          />
        </Field>
        <div className="flex items-start gap-2 rounded-xl bg-dusk-50 p-3 dark:bg-dusk-800/40">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-summit-500" />
          <p className="text-xs text-dusk-500 dark:text-dusk-400">
            Receives file uploads (multipart) or a JSON <code className="font-mono">sourceUrl</code>. Respond with JSON containing <code className="font-mono">success</code> and <code className="font-mono">resultUrl</code>.
          </p>
        </div>
      </Section>

      <Section title="Translator Backend" description="Webhook for Hindi ⇄ English translation">
        <Field label="Translator Webhook URL">
          <input
            type="text"
            value={settings.translatorWebhookUrl}
            onChange={(e) => onChange({ ...settings, translatorWebhookUrl: e.target.value })}
            className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          />
        </Field>
        <div className="flex items-start gap-2 rounded-xl bg-dusk-50 p-3 dark:bg-dusk-800/40">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-summit-500" />
          <p className="text-xs text-dusk-500 dark:text-dusk-400">
            Receives JSON with <code className="font-mono">text</code>, <code className="font-mono">direction</code>, and <code className="font-mono">refineForAI</code>. Respond with JSON containing <code className="font-mono">translation</code> and optional <code className="font-mono">refinedPrompt</code>.
          </p>
        </div>
      </Section>

      {/* Defaults */}
      <Section title="Generation Defaults" description="Used when starting a new generation">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Aspect Ratio">
            <select
              value={settings.aspectRatio}
              onChange={(e) => onChange({ ...settings, aspectRatio: e.target.value })}
              className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
            >
              <option value="1:1">Square (1:1)</option>
              <option value="9:16">Portrait (9:16)</option>
              <option value="16:9">Landscape (16:9)</option>
              <option value="4:5">Story (4:5)</option>
              <option value="21:9">Wide (21:9)</option>
            </select>
          </Field>
          <Field label="Quality">
            <select
              value={settings.quality}
              onChange={(e) => onChange({ ...settings, quality: e.target.value as AppSettings['quality'] })}
              className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="standard">Standard</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Style Preset">
            <select
              value={settings.stylePreset}
              onChange={(e) => onChange({ ...settings, stylePreset: e.target.value })}
              className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
            >
              <option value="cinematic">Cinematic</option>
              <option value="photoreal">Photoreal</option>
              <option value="anime">Anime</option>
              <option value="digital-art">Digital Art</option>
              <option value="3d-render">3D Render</option>
              <option value="fantasy">Fantasy</option>
            </select>
          </Field>
          <Field label="Seed">
            <input
              type="text"
              value={settings.seed}
              onChange={(e) => onChange({ ...settings, seed: e.target.value })}
              placeholder="Random"
              className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 placeholder:text-dusk-400 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
            />
          </Field>
        </div>
        <Field label="Negative Prompt">
          <input
            type="text"
            value={settings.negativePrompt}
            onChange={(e) => onChange({ ...settings, negativePrompt: e.target.value })}
            placeholder="blurry, low quality, distorted"
            className="w-full rounded-xl border border-dusk-200 bg-white px-3 py-2.5 text-sm text-dusk-900 placeholder:text-dusk-400 focus:border-summit-400 focus:outline-none dark:border-dusk-700 dark:bg-dusk-900 dark:text-white"
          />
        </Field>
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-dusk-600 dark:text-dusk-300">Auto-download after generation</span>
          <button
            onClick={() => onChange({ ...settings, autoDownload: !settings.autoDownload })}
            className={`relative h-6 w-11 rounded-full transition ${settings.autoDownload ? 'bg-summit-500' : 'bg-dusk-300 dark:bg-dusk-700'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.autoDownload ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </Section>

      {/* Danger zone */}
      <Section title="Data" description="Reset preferences and cached data">
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-error-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-error-600"
            >
              <Trash2 className="h-4 w-4" />
              Confirm Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="rounded-xl border border-dusk-200 px-4 py-2.5 text-sm font-medium text-dusk-500 transition hover:bg-dusk-50 dark:border-dusk-700 dark:text-dusk-400 dark:hover:bg-dusk-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 rounded-xl border border-error-500/30 px-4 py-2.5 text-sm font-medium text-error-500 transition hover:bg-error-500/5"
          >
            <Trash2 className="h-4 w-4" />
            Reset all settings
          </button>
        )}
        <p className="text-[10px] text-dusk-400">
          Resets to defaults: {JSON.stringify(DEFAULT_SETTINGS).slice(0, 80)}…
        </p>
      </Section>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-dusk-200 bg-white/60 p-4 dark:border-dusk-700 dark:bg-dusk-900/60">
      <div>
        <h3 className="text-sm font-semibold text-dusk-800 dark:text-dusk-100">{title}</h3>
        <p className="text-xs text-dusk-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-dusk-500 dark:text-dusk-400">{label}</label>
      {children}
    </div>
  );
}
