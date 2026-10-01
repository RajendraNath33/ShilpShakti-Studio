import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { auth, googleProvider, firebaseReady } from '@/lib/firebase';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.4 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dusk-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <h1 className="font-display text-2xl font-bold">
          Devbhumi <span className="text-summit-400">AI</span>
        </h1>
        <p className="mb-6 mt-1 text-xs uppercase tracking-widest text-white/50">Media Studio</p>
        {children}
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async () => {
    if (!auth) return;
    setError('');
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const code = (e as { code?: string }).code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // user closed the popup — no error message needed
      } else if (code === 'auth/unauthorized-domain') {
        setError('This website is not authorized in Firebase (Authentication → Settings → Authorized domains).');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by the browser. Please allow popups for this site and try again.');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady) {
    return (
      <Screen>
        <p className="text-sm text-red-300">
          Firebase settings are missing. Add the VITE_FIREBASE_* variables in Vercel and redeploy.
        </p>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <p className="mb-5 text-sm text-white/70">Sign in to create images, convert media and translate prompts.</p>
        <button
          onClick={login}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3 text-sm font-semibold text-gray-800 shadow-lg transition active:scale-[0.98] disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error && <p className="mt-4 text-xs text-red-300">{error}</p>}
      </Screen>
    );
  }

  return (
    <>
      <div className="fixed right-4 top-[76px] z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1 pl-1 pr-2 backdrop-blur">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-summit-500 text-xs font-bold text-white">
            {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <button
          onClick={() => auth && signOut(auth)}
          title="Sign out"
          aria-label="Sign out"
          className="text-white/70 transition hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      {children}
    </>
  );
}
