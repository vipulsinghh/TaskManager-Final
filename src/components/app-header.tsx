
"use client";
import React from 'react';
import Link from 'next/link';
import { Search, ChevronDown, MessageSquare, Folder, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FinStackLogo } from '@/components/icons/finstack-logo';
import { useIsMobile } from '@/hooks/use-mobile';


const AppHeader = () => {
  const isMobile = useIsMobile();
  const user = {
    firstName: "Demo",
    lastName: "User",
    companyName: "FinStack Solutions Inc."
  };
  const notifications = {
    messages: 4,
    documents: 0, 
    alerts: 2
  };

  const navItems = [
    { name: 'Dashboard', href: '#', dropdown: true },
    { name: 'Companies', href: '#', dropdown: true },
    { name: 'Funds', href: '#', dropdown: true },
    { name: 'HNIs', href: '#', dropdown: true },
    { name: 'Messaging', href: '#', dropdown: false },
    { name: 'Meetings', href: '#', dropdown: false },
    { name: 'Notes', href: '#', dropdown: false },
    { name: 'Documents', href: '#', dropdown: false },
  ];

  const visibleNavItems = isMobile ? navItems.slice(0, 1) : navItems.slice(0, 4);
  const hiddenNavItems = isMobile ? navItems.slice(1) : navItems.slice(4);

  return (
    <header className="sticky top-0 z-50 shadow-lg font-lato">
      <div className="bg-headerPrimary text-headerPrimary-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6">
            <Link href="/" className="flex items-center"> {/* Removed space-x-1 here */}
              <FinStackLogo className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tight">inStack</span>
            </Link>
            <div className="hidden md:block">
              <Select defaultValue="companies">
                <SelectTrigger className="w-[180px] bg-headerPrimary text-headerPrimary-foreground border-headerPrimary-foreground/30 hover:bg-headerPrimary-foreground/10 focus:ring-headerPrimary-foreground/50 h-9 text-sm rounded-md">
                  <SelectValue placeholder="Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="contacts">Contacts</SelectItem>
                  <SelectItem value="deals">Deals</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl px-2 sm:px-4 md:px-6">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search across FinStack..."
                className="bg-headerPrimary-foreground/10 text-headerPrimary-foreground border-headerPrimary-foreground/30 placeholder:text-headerPrimary-foreground/60 focus:bg-headerPrimary-foreground/20 focus:ring-offset-headerPrimary focus:ring-headerPrimary-foreground/50 h-10 pl-10 text-sm rounded-md w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-headerPrimary-foreground/60" />
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-headerPrimary-foreground/70 truncate max-w-[150px]">{user.companyName}</p>
            </div>
             <Button variant="ghost" size="icon" className="relative hover:bg-headerPrimary-foreground/10 text-headerPrimary-foreground rounded-full w-9 h-9">
              <MessageSquare className="h-5 w-5" />
              {notifications.messages > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-headerPrimary">
                  {notifications.messages}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-headerPrimary-foreground/10 text-headerPrimary-foreground rounded-full w-9 h-9 hidden sm:inline-flex">
              <Folder className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative hover:bg-headerPrimary-foreground/10 text-headerPrimary-foreground rounded-full w-9 h-9">
              <Bell className="h-5 w-5" />
              {notifications.alerts > 0 && (
                 <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-headerPrimary">
                  {notifications.alerts}
                </span>
              )}
            </Button>
            <Avatar className="h-9 w-9 ml-1 sm:ml-2 border-2 border-headerPrimary-foreground/50">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="avatar user" />
              <AvatarFallback className="bg-headerPrimary-foreground/20 text-headerPrimary-foreground text-sm">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <nav className="bg-headerSecondary text-headerSecondary-foreground shadow-inner">
        <div className="container mx-auto px-4 h-12 flex items-center justify-start space-x-1 overflow-x-auto">
          {visibleNavItems.map((item) => (
            <Button 
              key={item.name} 
              variant="ghost" 
              className="text-sm font-medium hover:bg-headerPrimary-foreground/10 hover:text-headerPrimary-foreground px-3 py-2 h-auto rounded-md whitespace-nowrap"
              asChild
            >
              <Link href={item.href}>
                {item.name.toUpperCase()}
                {item.dropdown && <ChevronDown className="ml-1.5 h-4 w-4 opacity-70 shrink-0 hidden sm:inline-block" />}
              </Link>
            </Button>
          ))}
          {hiddenNavItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium hover:bg-headerPrimary-foreground/10 hover:text-headerPrimary-foreground px-3 py-2 h-auto rounded-md whitespace-nowrap"
                >
                  {isMobile ? <Menu className="h-5 w-5" /> : 'MORE'}
                  {!isMobile && <ChevronDown className="ml-1.5 h-4 w-4 opacity-70 shrink-0" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "end" : "start"} className="bg-headerSecondary text-headerSecondary-foreground border-headerPrimary-foreground/30">
                {hiddenNavItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild className="hover:!bg-headerPrimary-foreground/10 hover:!text-headerPrimary-foreground">
                     <Link href={item.href} className="flex items-center justify-between w-full">
                      {item.name.toUpperCase()}
                      {item.dropdown && <ChevronDown className="ml-2 h-4 w-4 opacity-70 shrink-0" />}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
