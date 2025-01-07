import React, { useEffect, useCallback } from 'react';
import type { LineItem } from '@/types/quotation';

interface ImportDataButtonProps {
  onImport: (items: LineItem[]) => void;
}

export const ImportDataButton: React.FC<ImportDataButtonProps> = ({ onImport }) => {
  // 处理粘贴数据
  const handlePasteData = useCallback((pasteText: string) => {
    try {
      // 1. 首先按硬回车分割行
      const rows = pasteText.split(/\r?\n/);
      
      // 2. 初始化数据结构来存储处理后的行
      const processedRows: string[][] = [];
      let currentRow: string[] = [];
      let isInQuotes = false;
      let currentCell = '';
      
      // 3. 处理每一行
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // 如果不在引号内且行为空，跳过
        if (!isInQuotes && !row.trim()) {
          if (currentRow.length > 0) {
            processedRows.push([...currentRow]);
            currentRow = [];
          }
          continue;
        }
        
        // 处理每个字符
        for (let j = 0; j < row.length; j++) {
          const char = row[j];
          
          if (char === '"') {
            isInQuotes = !isInQuotes;
          } else if (char === '\t' && !isInQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        
        // 处理行尾
        if (!isInQuotes) {
          currentRow.push(currentCell.trim());
          processedRows.push([...currentRow]);
          currentRow = [];
          currentCell = '';
        } else {
          // 在引号内，添加一个软回车
          currentCell += '\n';
        }
      }
      
      // 4. 如果还有未处理完的数据
      if (currentRow.length > 0 || currentCell) {
        if (currentCell) {
          currentRow.push(currentCell.trim());
        }
        if (currentRow.length > 0) {
          processedRows.push(currentRow);
        }
      }

      // 5. 转换为 LineItem 对象
      const newItems = processedRows
        .filter(columns => columns.length > 0 && columns.some(col => col.trim()))
        .map(columns => {
          // 解析数量和单价
          const quantity = Number(columns[2]?.replace(/^"(.*)"$/, '$1')) || 0;
          const unitPrice = Number(columns[4]?.replace(/^"(.*)"$/, '$1')) || 0;

          return {
            id: Date.now() + Math.random(),
            partName: columns[0]?.replace(/^"(.*)"$/, '$1').trim() || '',
            description: columns[1]?.replace(/^"(.*)"$/, '$1').trim() || '',
            quantity,
            unit: columns[3]?.replace(/^"(.*)"$/, '$1').trim() || 'pc',
            unitPrice,
            amount: quantity * unitPrice,
            remarks: columns[5]?.replace(/^"(.*)"$/, '$1').trim() || ''
          };
        });

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

  // 添加自定义事件监听
  useEffect(() => {
    const handleImportData = (e: CustomEvent<string>) => {
      handlePasteData(e.detail);
    };

    window.addEventListener('import-data', handleImportData as EventListener);
    document.addEventListener('paste', handleGlobalPaste);
    
    return () => {
      window.removeEventListener('import-data', handleImportData as EventListener);
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handleGlobalPaste]);

  return null;
}; 