import { useState } from 'react';
import { Sparkles, Shuffle, ChevronDown, ChevronUp } from 'lucide-react';
import type { GenerationMode } from '@/types';
import { SAMPLE_PROMPTS } from '@/types';

interface PromptInputProps {
  mode: GenerationMode;
  prompt: string;
  onChange: (value: string) => void;
}

export function PromptInput({ mode, prompt, onChange }: PromptInputProps) {
  const [showSamples, setShowSamples] = useState(false);
  const samples = SAMPLE_PROMPTS[mode];

  const pickRandom = () => {
    const random = samples[Math.floor(Math.random() * samples.length)];
    onChange(random);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-dusk-700 dark:text-dusk-200">
          <Sparkles className="h-4 w-4 text-summit-500" />
          Prompt
        </label>
        <button
          onClick={pickRandom}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-summit-600 transition hover:bg-summit-50 dark:text-summit-400 dark:hover:bg-summit-950/40"
        >
          <Shuffle className="h-3.5 w-3.5" />
          Surprise me
        </button>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            mode === 'image'
              ? 'Describe the image you want to create... e.g., "Misty Himalayan peaks at sunrise, golden light on snow-capped summits"'
              : 'Describe the cinematic video... e.g., "Drone shot soaring over Himalayan peaks at sunrise, clouds drifting between summits"'
          }
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-2xl border border-dusk-200 bg-white/80 px-4 py-3.5 text-sm text-dusk-900 placeholder:text-dusk-400 transition focus:border-summit-400 focus:outline-none focus:ring-2 focus:ring-summit-400/20 dark:border-dusk-700 dark:bg-dusk-900/80 dark:text-white dark:placeholder:text-dusk-500"
        />
        <div className="absolute bottom-3 right-3 text-[10px] font-medium text-dusk-400 dark:text-dusk-500">
          {prompt.length}/2000
        </div>
      </div>

      <button
        onClick={() => setShowSamples((s) => !s)}
        className="flex items-center gap-1 text-xs font-medium text-dusk-500 transition hover:text-dusk-700 dark:text-dusk-400 dark:hover:text-dusk-200"
      >
        {showSamples ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Sample prompts
      </button>

      {showSamples && (
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {samples.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(s);
                setShowSamples(false);
              }}
              className="max-w-full truncate rounded-xl border border-dusk-200 bg-dusk-50/80 px-3 py-2 text-left text-xs text-dusk-600 transition hover:border-summit-400 hover:bg-summit-50 hover:text-summit-700 dark:border-dusk-700 dark:bg-dusk-800/60 dark:text-dusk-300 dark:hover:border-summit-500 dark:hover:bg-summit-950/40 dark:hover:text-summit-300"
            >
              {s.length > 60 ? `${s.slice(0, 60)}…` : s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
