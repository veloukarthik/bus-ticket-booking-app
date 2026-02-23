"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { validatePassword } from '@/lib/password';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"CUSTOMER" | "OWNER">("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const { lengthValid, alnumValid, matchValid } = validatePassword(password, confirmPassword);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, accountType }), headers: { 'Content-Type': 'application/json' } });
    
    try {
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="hidden sm:block bg-cover bg-center" style={{ backgroundImage: `url('/banner.png')` }} aria-hidden="true"></div>
        <div className="p-6 flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-4">Create account</h1>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="border p-2 rounded" />
            <select value={accountType} onChange={e=>setAccountType(e.target.value as "CUSTOMER" | "OWNER")} className="border p-2 rounded">
              <option value="CUSTOMER">Customer (Book rides)</option>
              <option value="OWNER">Vehicle Owner (List rides)</option>
            </select>
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

            <div className="relative">
              <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm password" type={showConfirm ? 'text' : 'password'} className="border p-2 rounded pr-10 w-full" />
              <button type="button" onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600">
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.02-2.22 2.8-4.05 4.86-5.12"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            <div className="mt-2 text-sm" aria-live="polite">
              <ul className="space-y-1">
                <li className={lengthValid ? 'text-green-600' : 'text-red-600'}>{lengthValid ? '✓' : '✕'} At least 8 characters</li>
                <li className={alnumValid ? 'text-green-600' : 'text-red-600'}>{alnumValid ? '✓' : '✕'} Contains letters and numbers</li>
                <li className={matchValid ? 'text-green-600' : 'text-red-600'}>{matchValid ? '✓' : '✕'} Passwords match</li>
              </ul>
            </div>

            <button disabled={!(lengthValid && alnumValid && matchValid)} className="mt-2 rounded bg-[var(--theme-primary)] py-2 text-white disabled:opacity-50">Create account</button>
          </form>
        </div>
      </div>
    </div>
  );
}
