import { useMemo } from 'react';

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  // 生成随机但固定的背景色（基于用户名）
  const backgroundColor = useMemo(() => {
    const colors = [
      '#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0',
      '#00BCD4', '#E91E63', '#3F51B5', '#009688', '#FFC107'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  // 获取用户名首字母或前两个字符
  const initials = useMemo(() => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
} 