import React from 'react';
import { Upload, Camera } from 'lucide-react';
import type { LineItem } from '@/types/quotation';

interface ImportDataButtonProps {
  onImport: (items: LineItem[]) => void;
}

export const ImportDataButton: React.FC<ImportDataButtonProps> = ({ onImport }) => {
  // 处理粘贴数据
  const handlePasteData = (pasteText: string) => {
    try {
      const rows = pasteText.trim().split('\n');
      
      const newItems = rows
        .map(row => {
          const columns = row.split('\t');
          if (columns.length < 1) return null;
          return {
            id: Date.now() + Math.random(),
            partName: columns[0]?.trim() || '',
            description: columns[1]?.trim() || '',
            quantity: Number(columns[2]) || 0,
            unit: 'pc',
            unitPrice: 0,
            amount: 0,
            remarks: columns[3]?.trim() || ''
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (newItems.length > 0) {
        onImport(newItems);
      }
    } catch (error) {
      console.error('Error parsing pasted data:', error);
      alert('数据格式错误，请确保复制了正确的表格数据');
    }
  };

  // 打开微信搜一搜
  const openWeChatSearch = () => {
    // 使用自定义协议打开微信
    window.location.href = 'weixin://';
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="px-3 py-1.5 rounded-lg
          bg-[#07C160]/[0.08] dark:bg-[#07C160]/[0.08]
          hover:bg-[#07C160]/[0.12] dark:hover:bg-[#07C160]/[0.12]
          text-[#07C160] dark:text-[#07C160]
          text-[13px] font-medium
          flex items-center gap-2
          transition-all duration-200"
        onClick={openWeChatSearch}
      >
        <Camera className="w-4 h-4" />
        微信识别
      </button>

      <button
        type="button"
        className="px-3 py-1.5 rounded-lg
          bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
          hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
          text-[#007AFF] dark:text-[#0A84FF]
          text-[13px] font-medium
          flex items-center gap-2
          transition-all duration-200"
        onClick={() => {
          navigator.clipboard.readText()
            .then(handlePasteData)
            .catch(err => {
              console.error('Failed to read clipboard:', err);
              alert('无法读取剪贴板，请确保已授予权限');
            });
        }}
      >
        <Upload className="w-4 h-4" />
        从剪贴板导入
      </button>
    </div>
  );
}; 