import React from 'react';
import { Upload } from 'lucide-react';
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
        .map((row, index) => {
          const columns = row.split('\t');
          if (columns.length < 2) return null;
          return {
            id: Date.now() + index,
            partName: columns[1]?.trim() || '',
            description: columns[2]?.trim() || '',
            quantity: Number(columns[3]) || 0,
            unit: 'pc',
            unitPrice: 0,
            amount: 0,
            remarks: columns[4]?.trim() || ''
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

  return (
    <div className="mb-4 flex items-center gap-4">
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
      
      <div 
        className="flex-1 px-4 py-2 border-2 border-dashed rounded-lg
          border-gray-200 dark:border-gray-700
          hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
          focus:outline-none focus:border-[#007AFF] dark:focus:border-[#0A84FF]
          transition-all duration-200
          cursor-pointer"
        tabIndex={0}
        onPaste={(e) => {
          e.preventDefault();
          const pasteText = e.clipboardData.getData('text');
          handlePasteData(pasteText);
        }}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          在此处粘贴表格数据 或 点击&ldquo;从剪贴板导入&rdquo;按钮
        </p>
      </div>
    </div>
  );
}; 