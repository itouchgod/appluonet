import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Avatar } from './Avatar';

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
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">工具箱</h1>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 
                       dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Avatar name={user.name} size={32} />
                <span>{user.name}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1c1c1e] 
                            rounded-md shadow-lg py-1 z-10
                            border border-gray-200/30 dark:border-gray-800/30">
                <button
                  onClick={() => {
                    onProfile();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 
                           hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                >
                  <User className="w-4 h-4 mr-2" />
                  个人资料
                </button>

                {user.isAdmin && (
                  <button
                    onClick={() => {
                      router.push('/admin');
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 
                             hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    系统管理
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 
                           hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 