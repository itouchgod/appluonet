import React, { useEffect, useCallback } from 'react';
import type { LineItem } from '@/types/quotation';

interface ImportDataButtonProps {
  onImport: (items: LineItem[]) => void;
}

export const ImportDataButton: React.FC<ImportDataButtonProps> = ({ onImport }) => {
  // 处理粘贴数据
  const handlePasteData = useCallback((pasteText: string) => {
    try {
      // 按行分割，过滤掉空行
      const rows = pasteText.trim().split('\n').filter(row => row.trim() !== '');
      
      // 解析每一行数据
      const parsedRows = rows.map(row => {
        // 使用制表符分割，保留空字符串
        const columns = row.split('\t');
        
        // 清理数组，移除空字符串但保留位置
        const cleanColumns = columns.map(col => col.trim());
        
        // 如果描述为空，返回 null
        if (!cleanColumns[0]) {
          return null;
        }

        // 根据不同的格式处理数据
        let quantity = 0;
        let unit = 'pc';
        let unitPrice = 0;

        if (cleanColumns.length >= 5) {
          // 描述 tab 数量 tab 单位 tab 单价
          quantity = parseFloat(cleanColumns[cleanColumns.length - 3]) || 0;
          unit = cleanColumns[cleanColumns.length - 2] || 'pc';
          unitPrice = parseFloat(cleanColumns[cleanColumns.length - 1]) || 0;
        } else if (cleanColumns.length === 4) {
          quantity = parseFloat(cleanColumns[1]) || 0;
          unit = cleanColumns[2] || 'pc';
          unitPrice = parseFloat(cleanColumns[3]) || 0;
        } else if (cleanColumns.length === 3) {
          quantity = parseFloat(cleanColumns[1]) || 0;
          unit = cleanColumns[2] || 'pc';
        } else if (cleanColumns.length === 2) {
          quantity = parseFloat(cleanColumns[1]) || 0;
        }

        return {
          id: Date.now() + Math.random(),
          partName: cleanColumns[0],
          description: '',
          quantity,
          unit,
          unitPrice,
          amount: quantity * unitPrice,
          remarks: ''
        } as LineItem;
      }).filter((row): row is LineItem => row !== null);

      if (parsedRows.length > 0) {
        onImport(parsedRows);
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

  const handleImportData = useCallback((e: CustomEvent<string>) => {
    handlePasteData(e.detail);
  }, [handlePasteData]);

  useEffect(() => {
    window.addEventListener('import-data', handleImportData as EventListener);
    document.addEventListener('paste', handleGlobalPaste);
    
    return () => {
      window.removeEventListener('import-data', handleImportData as EventListener);
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handleGlobalPaste, handleImportData]);

  return null;
}; 