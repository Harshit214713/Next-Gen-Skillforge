'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('theme-mode');
      const t = saved === 'dark' || saved === 'light' ? saved : 'light';
      setTheme(t);
      document.documentElement.dataset.theme = t;
      document.documentElement.classList.toggle('dark', t === 'dark');
    } catch {
      setTheme('light');
      document.documentElement.dataset.theme = 'light';
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme-mode', theme);
    } catch {
      // Storage unavailable or restricted
    }
  }, [theme, mounted]);

  const handleToggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">Skillforge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-lg p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <span className="inline-block h-4 w-4" />
            )}
          </button>

          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center rounded-md bg-primary text-xs font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors px-3"
          >
            Get Started
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground md:hidden transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-3 md:hidden backdrop-blur-md">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="#features"
              onClick={closeMobile}
              className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={closeMobile}
              className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className="rounded-md px-3 py-2 text-primary font-semibold hover:bg-primary/10 transition-colors"
            >
              Get Started →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
