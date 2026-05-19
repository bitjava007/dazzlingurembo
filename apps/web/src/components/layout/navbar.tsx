'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronRight, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-400">
      {segments.map((segment, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          <span className={index === segments.length - 1 ? 'text-white font-medium' : ''}>
            {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
          </span>
        </span>
      ))}
    </nav>
  );
}

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#2A2A2A] bg-[#111111] px-6">
      <Breadcrumb />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-[#1A1A1A]">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-[#1A1A1A] px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#C9A84C] text-black text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300 hidden sm:block">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1A] border-[#2A2A2A]">
            <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
            <DropdownMenuItem
              className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
