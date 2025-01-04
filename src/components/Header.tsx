import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, User, LogOut } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    isAdmin: boolean;
  };
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1c1c1e] border-b border-gray-200/30 dark:border-gray-800/30">
      {/* 左侧 Logo 和标题 */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <h1 className="text-lg font-medium">工具箱</h1>
      </div>

      {/* 右侧用户信息和下拉菜单 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-colors duration-200"
        >
          {/* 用户头像 */}
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white
                        flex items-center justify-center text-sm font-medium">
            {user.name[0]}
          </div>
          
          {/* 用户名 */}
          <span className="text-sm font-medium">{user.name}</span>
          
          {/* 下拉箭头 */}
          <svg
            className={`w-4 h-4 transition-transform duration-200 
                       ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 下拉菜单 */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 py-2
                        bg-white dark:bg-[#1c1c1e]
                        border border-gray-200/30 dark:border-gray-800/30
                        rounded-xl shadow-xl
                        z-50">
            {/* 管理员才显示系统管理选项 */}
            {user.isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         text-sm text-gray-700 dark:text-gray-300"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4" />
                系统管理
              </Link>
            )}
            
            {/* 个人资料 */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       text-sm text-gray-700 dark:text-gray-300"
              onClick={() => setShowDropdown(false)}
            >
              <User className="w-4 h-4" />
              个人资料
            </Link>
            
            {/* 退出登录 */}
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="flex items-center gap-2 px-4 py-2 w-full
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       text-sm text-red-600 dark:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        )}
      </div>
    </header>
  );
} 