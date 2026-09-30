import { Home, Images, Video, Settings, History, Languages, Repeat } from 'lucide-react';

export type View = 'studio' | 'converter' | 'translator' | 'gallery' | 'settings';

interface BottomNavProps {
  view: View;
  onChange: (view: View) => void;
}

export function BottomNav({ view, onChange }: BottomNavProps) {
  const items: { id: View; label: string; icon: typeof Home }[] = [
    { id: 'studio', label: 'AI Gen', icon: Home },
    { id: 'converter', label: 'Convert', icon: Repeat },
    { id: 'translator', label: 'Translate', icon: Languages },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-dusk-200/60 bg-dusk-50/90 backdrop-blur-xl md:hidden dark:border-dusk-800/60 dark:bg-dusk-950/90" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${
                active ? 'text-summit-600 dark:text-summit-400' : 'text-dusk-400 dark:text-dusk-500'
              }`}
            >
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                active ? 'bg-summit-500/10 dark:bg-summit-500/20' : ''
              }`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav({ view, onChange }: BottomNavProps) {
  const items: { id: View; label: string; icon: typeof Home; description: string }[] = [
    { id: 'studio', label: 'AI Generator', icon: Home, description: 'Generate media' },
    { id: 'converter', label: 'Media Converter', icon: Repeat, description: 'Video ⇄ Audio' },
    { id: 'translator', label: 'Translator', icon: Languages, description: 'Hindi ⇄ English' },
    { id: 'gallery', label: 'Gallery', icon: History, description: 'Past creations' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
  ];

  return (
    <nav className="hidden w-56 shrink-0 md:block">
      <div className="sticky top-20 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? 'bg-summit-500/10 text-summit-700 dark:bg-summit-500/20 dark:text-summit-300'
                  : 'text-dusk-500 hover:bg-dusk-100/60 dark:text-dusk-400 dark:hover:bg-dusk-800/60'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-[10px] text-dusk-400">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
