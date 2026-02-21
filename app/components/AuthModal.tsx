"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "../providers/UserProvider";

export default function AuthModal({ open, onCloseAction, initial }: { open: boolean; onCloseAction: () => void; initial?: 'login'|'signup' }) {
  const [mode, setMode] = useState<'login'|'signup'>(initial || 'login');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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
          setUser({ id: payload.userId, email: payload.email, isAdmin: payload.isAdmin });
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

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Login dialog' : 'Sign up dialog'}>
      <div className="absolute inset-0 bg-black/50" onClick={onCloseAction} aria-hidden="true"></div>
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-2xl fade-in-up transform-gpu">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{mode === 'login' ? 'Log in' : 'Create account'}</h3>
          <button onClick={onCloseAction} aria-label="Close dialog" className="text-slate-600">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input aria-label="Full name" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" />
          )}
          <input aria-label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input aria-label="Password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--muted)]">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-[var(--theme-primary)]">{mode === 'login' ? 'Sign up' : 'Log in'}</button>
              <button type="submit" disabled={loading} className="rounded bg-[var(--theme-primary)] px-4 py-2 text-white">{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(content, el);
}
