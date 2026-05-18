'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@dazzling/ui/button';
import { Separator } from '@dazzling/ui/separator';
import { useTheme } from '@/components/providers/theme-provider';

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Home';
  const last = segments[segments.length - 1];
  if (!last) return 'Home';
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <header className="flex h-16 items-center border-b bg-card px-6 gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{getPageTitle(pathname)}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? '☀' : '🌙'}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm">
          Sign Out
        </Button>
      </div>
    </header>
  );
}
