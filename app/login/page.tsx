"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      router.push('/');
    } else {
      alert(data.error || 'Login failed');
    }
  }

  async function signInWithGitHub() {
    await signIn("github", { callbackUrl: "/auth/success" });
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="hidden sm:block bg-cover bg-center" style={{ backgroundImage: `url('/banner.png')` }} aria-hidden="true"></div>
        <div className="p-6 flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-4">Log in</h1>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" />
            <div className="relative">
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type={showPassword ? 'text' : 'password'} className="border p-2 rounded pr-10 w-full" />
              <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.02-2.22 2.8-4.05 4.86-5.12"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <button className="mt-2 rounded bg-[var(--theme-primary)] py-2 text-white">Sign in</button>
          </form>
          <div className="my-4 flex items-center">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="px-3 text-xs uppercase tracking-wide text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <button
            type="button"
            onClick={signInWithGitHub}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
