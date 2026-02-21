"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }), headers: { 'Content-Type': 'application/json' } });
    
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
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold">Sign up</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border p-2" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="border p-2" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="border p-2" />
  <button className="mt-2 rounded bg-[var(--theme-primary)] py-2 text-white">Create account</button>
      </form>
    </div>
  );
}
