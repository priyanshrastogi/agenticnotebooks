'use client';

import cookies from 'js-cookie';
import { ChevronDown, LogOut, Plus, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import Link from '@/components/blocks/custom-link';
import { Modal } from '@/components/blocks/modal';
import AuthForm from '@/components/pages/Auth/AuthForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/lib/hooks/use-user';
import { cn } from '@/lib/utils';

import ClientTenantLogo from '../ui/client-tenant-logo';

export interface NavItem {
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface AppNavbarProps {
  navItems?: NavItem[];
  logoHref?: string;
  signupLabel?: string;
  newChatHref?: string;
  isLandingPage?: boolean;
}

// Default navigation items for the landing page
export const defaultLandingNavItems: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQs', href: '#faqs' },
];

export function AppNavbar({
  navItems,
  logoHref = '/',
  signupLabel = 'Try Free',
  newChatHref = '/new',
  isLandingPage = false,
}: AppNavbarProps) {
  const { user } = useUser();
  const hasLoggedInCookie = React.useMemo(() => Boolean(cookies.get('loggedIn')), []);
  const [isMounted, setIsMounted] = React.useState(false);
  const pathname = usePathname();
  const isChatPage = pathname === '/chat';
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate avatar initials
  const avatarInitials =
    user?.name
      ?.split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase() || 'U';

  const openAuthModal = (mode: 'login' | 'signup') => {
    if (isChatPage) {
      setAuthMode(mode);
      setIsAuthModalOpen(true);
    } else {
      router.push(`/auth?mode=${mode}`);
    }
  };

  return (
    <header
      className={cn(
        'bg-background/50 fixed left-0 right-0 top-0 z-20 backdrop-blur-md',
        isLandingPage ? 'py-4' : 'py-[6px]'
      )}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', isLandingPage && 'max-w-7xl')}>
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-1 sm:min-w-[220px]">
            <Link href={logoHref} className="flex items-center gap-1">
              <ClientTenantLogo />
            </Link>
          </div>

          {navItems && navItems.length > 0 && (
            <div className="hidden items-center space-x-8 md:flex">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="hover:text-primary text-sm font-medium transition-colors"
                  onClick={item.onClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex min-h-[40px] items-center justify-end gap-2 sm:min-w-[220px] sm:gap-4">
            {isMounted ? (
              <>
                {hasLoggedInCookie && !user ? (
                  <div className="mr-4 flex items-center gap-2 sm:mr-8 sm:gap-4">
                    <Skeleton className="mr-2 h-10 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                ) : user ? (
                  <div className="-mr-4 flex items-center gap-1 sm:-mr-0 sm:gap-4">
                    <Button
                      size="sm"
                      className="flex h-10 items-center gap-1 rounded-md px-3"
                      asChild
                    >
                      <Link href={newChatHref}>
                        <Plus className="h-4 w-4" />
                        <span>New Analysis</span>
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="hover:bg-accent flex h-10 cursor-pointer items-center gap-2 rounded-md px-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-sm font-medium text-white">
                            {avatarInitials}
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[200px]">
                        {user.email && (
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{user.name || 'Hello, User'}</p>
                            {user.email && (
                              <p className="text-muted-foreground text-xs">{user.email}</p>
                            )}
                          </div>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                        </DropdownMenuItem>

                        <ThemeToggle />

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link
                            href="/logout"
                            className="text-destructive flex cursor-pointer items-center gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex h-10 items-center">
                    <Button
                      variant="ghost"
                      className="h-10 text-sm font-medium"
                      onClick={() => openAuthModal('login')}
                    >
                      Log In
                    </Button>
                    <Button
                      className="ml-4 h-10 px-6 text-sm font-medium"
                      onClick={() => openAuthModal('signup')}
                    >
                      {signupLabel}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-10 w-28" />
            )}
          </div>
        </div>
      </div>
      {isChatPage && (
        <Modal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          dialogContentClassName="sm:max-w-md"
        >
          <AuthForm initialMode={authMode} onAuthComplete={() => setIsAuthModalOpen(false)} />
        </Modal>
      )}
    </header>
  );
}
