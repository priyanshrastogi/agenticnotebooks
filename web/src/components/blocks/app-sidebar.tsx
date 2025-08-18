'use client';

import { ChevronDown, FileText, LogOut, MessageSquare, Plus, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import Link from '@/components/blocks/custom-link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useUser } from '@/lib/hooks/use-user';

import Logo from '../ui/logo';

// Sample chat history data
const chatHistory = [
  { id: 1, name: 'Project Discussion', path: '/chat/1' },
  { id: 2, name: 'Team Updates', path: '/chat/2' },
  { id: 3, name: 'Client Meeting', path: '/chat/3' },
  { id: 4, name: 'Brainstorming Session', path: '/chat/4' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Trim long names and emails
  const displayName = user?.name
    ? user.name.length > 18
      ? user.name.substring(0, 15) + '...'
      : user.name
    : 'John Doe';
  const displayEmail = user?.email
    ? user.email.length > 23
      ? user.email.substring(0, 20) + '...'
      : user.email
    : 'john@example.com';
  const avatarInitials =
    user?.name
      ?.split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase() || 'JD';

  return (
    <Sidebar variant="sidebar" className="border-border bg-background text-foreground border-r">
      <SidebarHeader className="mb-4 flex flex-row items-center gap-2 p-4">
        <Logo />
        <p className="text-xl font-semibold tracking-tight">Intellicharts</p>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="px-2">
          <Link href="/new">
            <Button variant="default" className="mb-4 flex w-full items-center gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/chats' || pathname?.startsWith('/chat/')}
                >
                  <Link href="/chats" className="font-medium">
                    <MessageSquare />
                    <span>Chats</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/files' || pathname?.startsWith('/files/')}
                >
                  <Link href="/files" className="font-medium">
                    <FileText />
                    <span>Files</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-muted-foreground flex items-center justify-between py-2 text-sm">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <Link
                  key={chat.id}
                  href={chat.path}
                  className={`block rounded-md px-3 py-2 ${pathname === chat.path ? 'bg-accent' : 'hover:bg-accent'}`}
                >
                  <div className="text-sm font-medium">{chat.name}</div>
                  <div className="text-muted-foreground mt-0.5 text-xs">Last updated 2h ago</div>
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-sm font-medium text-white">
                  {avatarInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-muted-foreground text-xs">{displayEmail}</span>
                </div>
                <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
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
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
