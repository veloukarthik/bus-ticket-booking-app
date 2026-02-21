"use client";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "../providers/UserProvider";
import AuthModal from "./AuthModal";

export default function Header() {
  const { user, logout } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');

  return (
    <header className="w-full bg-gradient-to-r from-[rgba(14,165,233,0.06)] to-[rgba(47,191,113,0.03)] backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Homepage">
          <img src="/letsgo.png" alt="LetsGo" className="h-10 w-auto" />
          <div>
            <div className="font-semibold text-lg text-slate-800">LetsGo</div>
            <div className="text-xs text-[var(--muted)]">Premium Bus Tickets</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700" aria-label="Primary navigation">
          <a href="/" className="hover:text-[var(--theme-primary)] transition">Home</a>
          <a href="/bookings" className="hover:text-[var(--theme-primary)] transition" aria-label="Bookings">Bookings</a>
          {user ? (
            <>
              {user.isAdmin && <a href="/admin" className="hover:text-[var(--theme-primary)]">Admin</a>}
              <button onClick={logout} className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="hover:text-[var(--theme-primary)]" aria-label="Open login dialog">Log in</button>
              <button onClick={() => { setAuthMode('signup'); setShowAuth(true); }} className="ml-2 rounded-full bg-[var(--theme-primary)] px-4 py-2 text-white text-sm shadow-sm hover:brightness-95" aria-label="Open signup dialog">Sign up</button>
            </>
          )}
        </nav>

        <div className="md:hidden">
          <button aria-label="Open menu" className="p-2 rounded-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {showAuth && <AuthModal open={showAuth} onCloseAction={() => setShowAuth(false)} initial={authMode} />}
      </div>
    </header>
  );
}
