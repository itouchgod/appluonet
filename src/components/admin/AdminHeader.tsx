import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, ArrowLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Avatar } from '../Avatar';

interface AdminHeaderProps {
  username: string;
  onLogout: () => void;
}

export function AdminHeader({ username, onLogout }: AdminHeaderProps) {
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
    await signOut();
    onLogout();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">返回主页</span>
          </button>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Avatar name={username} />
            <span className="text-gray-700">{username}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 