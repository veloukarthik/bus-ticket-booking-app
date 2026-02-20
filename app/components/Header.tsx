"use client";
import Link from "next/link";
import { useUser } from "../providers/UserProvider";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/letsgo.png" alt="NueGo" className="h-8 w-auto" />
          <span className="font-semibold text-lg text-slate-800">LetsGo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
          {/* <a href="#services" className="hover:text-slate-900">Services</a>
          <a href="#about" className="hover:text-slate-900">About</a>
          <a href="#contact" className="hover:text-slate-900">Contact</a> */}
          {user ? (
            <>
              {user.isAdmin && <a href="/admin" className="hover:text-slate-900">Admin</a>}
              <a href="/bookings" className="hover:text-slate-900">Bookings</a>
              <button onClick={logout} className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm">Logout</button>
            </>
          ) : (
            <>
              <a href="/bookings" className="hover:text-slate-900">Bookings</a>
              <a href="/login" className="hover:text-slate-900">Log in</a>
              <a href="/signup" className="ml-2 rounded-full bg-sky-600 px-4 py-2 text-white text-sm shadow-sm hover:bg-sky-700">Sign up</a>
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
      </div>
    </header>
  );
}
