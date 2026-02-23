"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "../providers/UserProvider";
import { validatePassword } from '@/lib/password';
import { signIn } from "next-auth/react";

export default function AuthModal({ open, onCloseAction, initial }: { open: boolean; onCloseAction: () => void; initial?: 'login'|'signup' }) {
  const [mode, setMode] = useState<'login'|'signup'>(initial || 'login');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // live validation flags from shared util
  const { lengthValid, alnumValid, matchValid } = validatePassword(password, mode === 'signup' ? confirmPassword : undefined);

  const [mounted, setMounted] = useState(false);
  const [el] = useState(() => typeof document !== 'undefined' ? document.createElement('div') : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!el) return;
    // ensure portal container sits above everything
    el.style.zIndex = '9999';
    el.style.position = 'fixed';
    el.style.inset = '0';
    document.body.appendChild(el);
    return () => {
      if (document.body.contains(el)) document.body.removeChild(el);
    };
  }, [el]);

  if (!mounted || !el) return null;
  if (!open) return null;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    // client-side validation for signup password + confirm
    if (mode === 'signup') {
      const pwd = (password || '').trim();
      const valid = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/.test(pwd);
      if (!valid) {
        setPasswordError('Password must be at least 8 characters and include letters and numbers');
        return;
      }
      setPasswordError('');

      if ((confirmPassword || '').trim() !== pwd) {
        setConfirmError('Passwords do not match');
        return;
      }
      setConfirmError('');
    }
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body: any = { email, password };
      if (mode === 'signup') body.name = name;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        // set user in provider (naive decode)
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          setUser({ id: payload.userId, email: payload.email, isAdmin: payload.isAdmin, organizationId: payload.organizationId });
        } catch (e) {}
        onCloseAction();
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGitHub() {
    setLoading(true);
    await signIn("github", { callbackUrl: "/auth/success" });
    setLoading(false);
  }

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Login dialog' : 'Sign up dialog'}>
      <div className="absolute inset-0 bg-black/50" onClick={onCloseAction} aria-hidden="true"></div>
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl fade-in-up transform-gpu overflow-hidden max-h-[92vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 min-h-[360px]">
            {/* Left: banner image */}
            <div className="hidden sm:block bg-cover bg-center" style={{ backgroundImage: `url('/banner.png')` }} aria-hidden="true"></div>

            {/* Right: form */}
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
                <button onClick={onCloseAction} aria-label="Close dialog" className="text-slate-600">✕</button>
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === 'signup' && (
                  <input aria-label="Full name" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" />
                )}
                <input aria-label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />

                <div className="relative">
                  <input aria-label="Password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type={showPassword ? 'text' : 'password'} className="w-full border rounded px-3 py-2 pr-12" />
                    <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600">
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.02-2.22 2.8-4.05 4.86-5.12"/><path d="M1 1l22 22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                </div>
                {passwordError && <div className="text-sm text-red-600 mt-1">{passwordError}</div>}

                {/* Live checklist for password requirements (signup only) */}
                {mode === 'signup' && (
                  <div className="mt-2 text-sm" aria-live="polite">
                    <ul className="space-y-1">
                      <li className={lengthValid ? 'text-green-600' : 'text-red-600'}> {lengthValid ? '✓' : '✕'} At least 8 characters</li>
                      <li className={alnumValid ? 'text-green-600' : 'text-red-600'}> {alnumValid ? '✓' : '✕'} Contains letters and numbers</li>
                      <li className={matchValid ? 'text-green-600' : 'text-red-600'}> {matchValid ? '✓' : '✕'} Passwords match</li>
                    </ul>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="relative">
                    <input aria-label="Confirm password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm password" type={showConfirmPassword ? 'text' : 'password'} className="w-full border rounded px-3 py-2 pr-12" />
                      <button type="button" onClick={() => setShowConfirmPassword(s => !s)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600">
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.02-2.22 2.8-4.05 4.86-5.12"/><path d="M1 1l22 22"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                  </div>
                )}
                {confirmError && <div className="text-sm text-red-600 mt-1">{confirmError}</div>}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--muted)]">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setPasswordError(''); setConfirmError(''); }} className="text-sm text-[var(--theme-primary)]">{mode === 'login' ? 'Sign up' : 'Log in'}</button>
                    <button
                      type="submit"
                      disabled={loading || (mode === 'signup' && !(lengthValid && alnumValid && matchValid))}
                      className="rounded bg-[var(--theme-primary)] px-4 py-2 text-white disabled:opacity-50"
                    >{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
                  </div>
                </div>
              </form>
              <div className="my-4 flex items-center">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="px-3 text-xs uppercase tracking-wide text-slate-500">or</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <button
                type="button"
                onClick={signInWithGitHub}
                disabled={loading}
                className="w-full rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Continue with GitHub
              </button>
            </div>
          </div>
        </div>
    </div>
  );

  return createPortal(content, el);
}
