import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const icons = {
    light: <Sun className="h-[1.2rem] w-[1.2rem]" />,
    dark: <Moon className="h-[1.2rem] w-[1.2rem]" />,
    system: <Monitor className="h-[1.2rem] w-[1.2rem]" />
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center p-2 
        rounded-xl border border-gray-200/50 dark:border-gray-700/50
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg
        text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100
        transition-all hover:shadow-lg hover:scale-[1.02]
        group"
      title={`Current theme: ${theme}`}
    >
      {icons[theme]}
    </button>
  );
} 