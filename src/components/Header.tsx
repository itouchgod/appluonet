'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, LogOut, Settings, User, Moon, Sun } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Avatar } from './Avatar';
import { useTheme } from 'next-themes';

interface HeaderProps {
  user: {
    name: string;
    isAdmin: boolean;
  };
  onLogout: () => void;
  onProfile: () => void;
}

export function Header({ user, onLogout, onProfile }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  return (
    <header className="bg-white dark:bg-[#1c1c1e] shadow-sm dark:shadow-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src="/logo/logo.png"
            alt="LC APP Logo"
            width={48}
            height={48}
            priority
            className="object-contain"
          />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">智能助手面板</h1>
        </div>

        <div className="flex items-center space-x-4">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="切换主题模式"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <Avatar name={user.name} />
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#2c2c2e] ring-1 ring-black ring-opacity-5 dark:ring-white/10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onProfile();
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    个人信息
                  </button>
                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        router.push('/admin');
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      管理后台
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 