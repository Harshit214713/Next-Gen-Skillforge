import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar({ onAnalyze }: { onAnalyze: () => void }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme-mode');
    const t = (saved === 'dark' || saved === 'light') ? saved : 'light';
    setTheme(t);
    document.documentElement.dataset.theme = t;
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme-mode', theme);
  }, [theme, mounted]);

  const handleToggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <nav className="sticky top-0 z-50 border-b border-background/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-8 lg:py-4">
        <Link
          href="#"
          className="flex items-center gap-2.5"
          aria-label="Next-Gen Skillforge"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">Skillforge</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#overview" className="text-muted-foreground hover:text-primary transition-colors">
            Overview
          </Link>
          <Link href="#links" className="text-muted-foreground hover:text-primary transition-colors">
            Profile Links
          </Link>
          <Link href="#skills" className="text-muted-foreground hover:text-primary transition-colors">
            Skill Graphs
          </Link>
          <Link href="#jobs" className="text-muted-foreground hover:text-primary transition-colors">
            Recommendations
          </Link>
          <Link href="#learning" className="text-muted-foreground hover:text-primary transition-colors">
            Learning Path
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className="rounded-lg p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
          <Button onClick={onAnalyze} size="sm">
            Analyze Profile
          </Button>
        </div>
      </div>
    </nav>
  );
}
