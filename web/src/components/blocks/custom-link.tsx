'use client';

import NextLink from 'next/link';
import { useTopLoader } from 'nextjs-toploader';

import { useNavigationBlocker } from '@/lib/contexts/navigation-blocker';

interface LinkProps extends React.ComponentProps<typeof NextLink> {
  children: React.ReactNode;
}

export default function Link({ children, ...props }: LinkProps) {
  const { isBlocked, setIsBlocked } = useNavigationBlocker();
  const { done } = useTopLoader();

  return (
    <NextLink
      prefetch={false}
      onNavigate={(e) => {
        if (
          isBlocked &&
          !window.confirm('Your chats are not saved and will be lost. Leave anyway?')
        ) {
          e.preventDefault();
          setTimeout(() => {
            done(true);
          }, 100);
        } else if (isBlocked) {
          setIsBlocked(false);
        }
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}
