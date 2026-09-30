import { Image, Video } from 'lucide-react';
import type { GenerationMode } from '@/types';

interface ModeSelectorProps {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="relative flex rounded-2xl border border-dusk-200/80 bg-dusk-100/60 p-1 dark:border-dusk-700/80 dark:bg-dusk-900/60">
      {/* Sliding indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 ease-out ${
          mode === 'image'
            ? 'translate-x-0 from-summit-400 to-summit-600 shadow-summit-500/30'
            : 'translate-x-[calc(100%+8px)] from-accent-400 to-accent-600 shadow-accent-500/30'
        }`}
      />
      <button
        onClick={() => onChange('image')}
        className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors duration-200 ${
          mode === 'image'
            ? 'text-white'
            : 'text-dusk-500 hover:text-dusk-700 dark:text-dusk-400 dark:hover:text-dusk-200'
        }`}
      >
        <Image className="h-4 w-4" />
        Text to Image
      </button>
      <button
        onClick={() => onChange('video')}
        className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors duration-200 ${
          mode === 'video'
            ? 'text-white'
            : 'text-dusk-500 hover:text-dusk-700 dark:text-dusk-400 dark:hover:text-dusk-200'
        }`}
      >
        <Video className="h-4 w-4" />
        Cinematic Video
      </button>
    </div>
  );
}
