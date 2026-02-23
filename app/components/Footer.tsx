export default function Footer() {
  return (
    <footer
      className="border-t border-slate-200/70 py-10"
      style={{
        background:
          "radial-gradient(120% 160% at 0% 100%, rgba(14,165,233,0.20), transparent 40%), radial-gradient(120% 160% at 100% 0%, rgba(47,191,113,0.18), transparent 42%), linear-gradient(120deg, #eaf7ff 0%, #f7fff5 65%, #fff9ec 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 text-sm text-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="font-semibold text-[var(--theme-ink)]">LetsGo</div>
            <div className="text-xs text-slate-600">Modern bus ticketing made delightful</div>
            <div className="mt-3 text-xs">© {new Date().getFullYear()} LetsGo. All rights reserved.</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <a href="#" className="hover:text-[var(--theme-primary)]">Privacy</a>
              <a href="#" className="hover:text-[var(--theme-primary)]">Terms</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="twitter" className="text-slate-600 hover:text-[var(--theme-primary)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.4.7-2.2.9C16.8 6 15.8 5.5 14.7 5.5c-1.7 0-3 1.3-3 3 0 .2 0 .4.1.6-2.5-.1-4.7-1.3-6.2-3-.3.5-.4 1.1-.4 1.7 0 1.1.6 2 1.4 2.6-.5 0-1-.1-1.5-.4v.1c0 1.5 1 2.7 2.4 3-.2.1-.4.1-.6.1-.1 0-.2 0-.3-.1.2 1 1.2 1.8 2.3 1.9-1 .7-2.2 1-3.5 1-.2 0-.3 0-.5 0 1.2.8 2.6 1.2 4.2 1.2 5 0 7.8-4.2 7.8-7.8v-.4c.5-.4 1-1 1.3-1.6-.5.2-1 .4-1.6.5z" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="facebook" className="text-slate-600 hover:text-[var(--theme-primary)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.2 8.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.8 3.6-3.8 1 0 2 .1 2 .1v2.3h-1.2c-1.2 0-1.6.8-1.6 1.6V12H18l-.5 3h-2v7C18.3 21.2 22 17 22 12z" fill="currentColor"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
