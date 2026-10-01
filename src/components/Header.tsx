import { Moon, Sun, Menu } from 'lucide-react';
import type { Theme } from '@/lib/api';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenMenu: () => void;
}

export function Header({ theme, onToggleTheme, onOpenMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-dusk-200/60 bg-dusk-50/80 backdrop-blur-xl dark:border-dusk-800/60 dark:bg-dusk-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-dusk-600 transition hover:bg-dusk-200/60 md:hidden dark:text-dusk-300 dark:hover:bg-dusk-800/60"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            {/* Naya High-Tech Logo yahan lagaya gaya hai */}
            <img
              src="/logo (2).png"
              alt="Shilp Shakti Logo"
              className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]"
            />
            <div className="leading-tight">
              <h1 className="font-display text-base font-bold tracking-tight text-dusk-900 dark:text-white">
                Devbhumi<span className="text-summit-500"> AI</span>
              </h1>
              <p className="hidden text-[10px] font-medium uppercase tracking-wider text-dusk-400 sm:block dark:text-dusk-500">
                Media Studio
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-dusk-600 transition hover:bg-dusk-200/60 dark:text-dusk-300 dark:hover:bg-dusk-800/60"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
