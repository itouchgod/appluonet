import React, { useEffect, useCallback } from 'react';
import type { LineItem } from '@/types/quotation';

interface ImportDataButtonProps {
  onImport: (items: LineItem[]) => void;
}

export const ImportDataButton: React.FC<ImportDataButtonProps> = ({ onImport }) => {
  // 处理粘贴数据
  const handlePasteData = useCallback((pasteText: string) => {
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
  }, [onImport]);

  // 全局粘贴事件处理
  const handleGlobalPaste = useCallback((e: ClipboardEvent) => {
    const pasteText = e.clipboardData?.getData('text') || '';
    if (pasteText) {
      handlePasteData(pasteText);
    }
  }, [handlePasteData]);

  // 添加全局粘贴事件监听
  useEffect(() => {
    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handleGlobalPaste]);

  return null;
}; 