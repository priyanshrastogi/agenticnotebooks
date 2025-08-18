'use client';

import { MonitorIcon,MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect,useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Icon to display based on current theme
  const ThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <MoonIcon className="text-muted-foreground mr-2 h-4 w-4" />;
      case 'light':
        return <SunIcon className="text-muted-foreground mr-2 h-4 w-4" />;
      case 'system':
      default:
        return <MonitorIcon className="text-muted-foreground mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="flex w-full items-center px-2 py-1.5 text-sm">
      <ThemeIcon />
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger
          className="h-auto w-full border-0 p-0 font-normal shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Select theme"
        >
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="light" className="flex items-center">
            Light
          </SelectItem>
          <SelectItem value="dark" className="flex items-center">
            Dark
          </SelectItem>
          <SelectItem value="system" className="flex items-center">
            System
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
