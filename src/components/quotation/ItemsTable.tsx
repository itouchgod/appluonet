import React, { useState } from 'react';
import { ImportDataButton } from './ImportDataButton';
import type { QuotationData, LineItem } from '@/types/quotation';

interface ItemsTableProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({ data, onChange }) => {
  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null);
  const [editingPriceAmount, setEditingPriceAmount] = useState<string>('');
  const [editingQtyIndex, setEditingQtyIndex] = useState<number | null>(null);
  const [editingQtyAmount, setEditingQtyAmount] = useState<string>('');
  const [editingOtherFeeIndex, setEditingOtherFeeIndex] = useState<number | null>(null);
  const [editingOtherFeeAmount, setEditingOtherFeeAmount] = useState<string>('');

  // 处理键盘导航
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index: number,
    field: keyof LineItem
  ) => {
    const fields: (keyof LineItem)[] = ['partName'];
    if (data.showDescription) fields.push('description');
    fields.push('quantity', 'unit', 'unitPrice');
    if (data.showRemarks) fields.push('remarks');

    const currentFieldIndex = fields.indexOf(field);
    const currentRowIndex = index;

    // 如果是 textarea 且按下 Enter 键
    if ((field === 'partName' || field === 'description') && e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter: 跳转到下一行
        e.preventDefault();
        if (currentRowIndex < data.items.length - 1) {
          const downField = document.querySelector<HTMLElement>(
            `[data-row="${index + 1}"][data-field="${field}"]`
          );
          downField?.focus();
        }
      } else {
        // 普通 Enter: 在当前位置插入换行符
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;
        const newValue = value.substring(0, start) + '\n' + value.substring(end);
        handleItemChange(index, field, newValue);
        
        // 确保光标位置正确
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        if (currentFieldIndex < fields.length - 1) {
          const nextField = document.querySelector<HTMLElement>(
            `[data-row="${index}"][data-field="${fields[currentFieldIndex + 1]}"]`
          );
          nextField?.focus();
        }
        break;
      case 'ArrowLeft':
        if (currentFieldIndex > 0) {
          const prevField = document.querySelector<HTMLElement>(
            `[data-row="${index}"][data-field="${fields[currentFieldIndex - 1]}"]`
          );
          prevField?.focus();
        }
        break;
      case 'ArrowUp':
        if (currentRowIndex > 0) {
          const upField = document.querySelector<HTMLElement>(
            `[data-row="${index - 1}"][data-field="${field}"]`
          );
          upField?.focus();
        }
        break;
      case 'ArrowDown':
        if (currentRowIndex < data.items.length - 1) {
          const downField = document.querySelector<HTMLElement>(
            `[data-row="${index + 1}"][data-field="${field}"]`
          );
          downField?.focus();
        }
        break;
      case 'Tab':
        if (!e.shiftKey && currentFieldIndex < fields.length - 1) {
          e.preventDefault();
          const nextField = document.querySelector<HTMLElement>(
            `[data-row="${index}"][data-field="${fields[currentFieldIndex + 1]}"]`
          );
          nextField?.focus();
        } else if (e.shiftKey && currentFieldIndex > 0) {
          e.preventDefault();
          const prevField = document.querySelector<HTMLElement>(
            `[data-row="${index}"][data-field="${fields[currentFieldIndex - 1]}"]`
          );
          prevField?.focus();
        }
        break;
    }
  };

  // 处理导入的数据
  const handleImport = (newItems: typeof data.items) => {
    // 处理每个项目的单位单复数
    const processedItems = newItems.map(item => {
      const baseUnit = item.unit.replace(/s$/, '');
      return {
        ...item,
        unit: defaultUnits.includes(baseUnit) ? getUnitDisplay(baseUnit, item.quantity) : item.unit
      };
    });

    onChange({
      ...data,
      items: processedItems
    });
  };

  // 默认单位列表（需要单复数变化的单位）
  const defaultUnits = ['pc', 'set', 'length'];
  const availableUnits = [...defaultUnits, ...(data.customUnits || [])];

  // 处理单位的单复数
  const getUnitDisplay = (baseUnit: string, quantity: number) => {
    if (defaultUnits.includes(baseUnit)) {
      return quantity > 1 ? `${baseUnit}s` : baseUnit;
    }
    return baseUnit; // 自定义单位不变化单复数
  };

  // 处理单个项目的更改
  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...data.items];
    
    if (field === 'unit') {
      // 处理单位变更,根据当前数量决定是否需要复数形式
      const baseUnit = value.toString().replace(/s$/, '');
      const quantity = newItems[index].quantity;
      newItems[index] = {
        ...newItems[index],
        unit: defaultUnits.includes(baseUnit) ? getUnitDisplay(baseUnit, quantity) : value.toString()
      };
    } else if (field === 'quantity') {
      // 更新数量时,同时更新单位的单复数
      const quantity = Number(value);
      const baseUnit = newItems[index].unit.replace(/s$/, '');
      newItems[index] = {
        ...newItems[index],
        quantity,
        unit: defaultUnits.includes(baseUnit) ? getUnitDisplay(baseUnit, quantity) : newItems[index].unit
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }

    // 如果更改了数量或单价,自动计算金额
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    onChange({
      ...data,
      items: newItems
    });
  };

  // 添加单元格粘贴处理函数
  const handleCellPaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, field: keyof LineItem) => {
    const pasteText = e.clipboardData.getData('text');
    e.preventDefault();
    
    // 如果是单个值的粘贴
    if (field === 'quantity') {
      const value = pasteText.trim().replace(/^"|"$/g, '');
      if (!/^\d*$/.test(value)) {
        alert('数量必须是整数');
        return;
      }
      handleItemChange(index, field, value === '' ? 0 : parseInt(value));
      return;
    }
    
    if (field === 'unitPrice') {
      const value = pasteText.trim().replace(/^"|"$/g, '');
      if (!/^-?\d*\.?\d*$/.test(value)) {
        alert('单价必须是数字');
        return;
      }
      handleItemChange(index, field, value === '' ? 0 : parseFloat(value));
      return;
    }

    // 对于文本字段，处理Excel格式的数据
    if (field === 'partName' || field === 'description' || field === 'remarks') {
      // 获取当前字段的值
      const currentValue = field === 'partName' ? data.items[index].partName :
                          field === 'description' ? (data.items[index].description || '') :
                          (data.items[index].remarks || '');

      // 如果包含制表符，说明是从Excel复制的多列数据
      if (pasteText.includes('\t')) {
        const newItems = [...data.items];
        let cells: string[] = [];
        let currentCell = '';
        let inQuotes = false;
        
        // 逐字符处理粘贴的内容
        for (let i = 0; i < pasteText.length; i++) {
          const char = pasteText[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
            continue;
          }
          
          if (char === '\t' && !inQuotes) {
            cells.push(currentCell);
            currentCell = '';
            continue;
          }
          
          currentCell += char;
        }
        cells.push(currentCell); // 添加最后一个单元格
        
        // 更新数据
        if (field === 'partName') {
          // 处理第一个单元格的内容（保持换行符）
          const content = cells[0].replace(/^"|"$/g, '');
          
          // 获取当前内容的行数
          const currentLines = currentValue.split('\n').filter(line => line.trim() !== '');
          const newLines = content.split('\n').filter(line => line.trim() !== '');
          
          // 如果当前内容不为空，且新内容不在当前内容中，则追加
          const newContent = currentLines.length > 0 && !currentValue.includes(content)
            ? currentValue + '\n' + content
            : content;
          
          newItems[index] = {
            ...newItems[index],
            partName: newContent,
          };
          
          // 如果有数量和单价信息，也更新它们
          if (cells[3] && /^\d+$/.test(cells[3].trim())) {
            newItems[index].quantity = parseInt(cells[3].trim());
          }
          if (cells[4]) {
            newItems[index].unit = cells[4].trim();
          }
          if (cells[5] && /^-?\d*\.?\d*$/.test(cells[5].trim())) {
            newItems[index].unitPrice = parseFloat(cells[5].trim());
          }
          newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
        } else {
          // 对于其他文本字段，只更新第一个单元格的内容
          const content = cells[0].replace(/^"|"$/g, '');
          
          // 获取当前内容的行数
          const currentLines = currentValue.split('\n').filter(line => line.trim() !== '');
          
          // 如果当前内容不为空，且新内容不在当前内容中，则追加
          const newContent = currentLines.length > 0 && !currentValue.includes(content)
            ? currentValue + '\n' + content
            : content;
          
          handleItemChange(index, field, newContent);
        }
        
        onChange({
          ...data,
          items: newItems
        });
      } else {
        // 如果是单个单元格的内容，检查是否需要追加
        const content = pasteText.replace(/^"|"$/g, '');
        
        // 如果当前内容不为空，且新内容不在当前内容中，则追加
        const newContent = currentValue && !currentValue.includes(content)
          ? currentValue + '\n' + content
          : content;
        
        handleItemChange(index, field, newContent);
      }
    }
  };

  // 处理软删除
  const handleSoftDelete = (index: number) => {
    onChange({
      ...data,
      items: data.items.filter((_, i) => i !== index)
    });
  };

  // 处理其他费用的更改
  const handleOtherFeeChange = (index: number, field: 'description' | 'amount' | 'remarks', value: string | number) => {
    const newFees = [...(data.otherFees ?? [])];
    newFees[index] = {
      ...newFees[index],
      [field]: value
    };
    onChange({
      ...data,
      otherFees: newFees
    });
  };

  // 处理其他费用的删除
  const handleOtherFeeSoftDelete = (index: number) => {
    onChange({
      ...data,
      otherFees: data.otherFees?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-0">
      <ImportDataButton onImport={handleImport} />

      <div className={`overflow-x-auto overflow-hidden border border-[#E5E5EA] dark:border-[#2C2C2E]
        bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl
        ${(data.otherFees ?? []).length > 0 ? 'rounded-t-2xl' : 'rounded-2xl'}`}>
        <table className="w-full border-collapse border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-[#F5F5F7] dark:bg-[#2C2C2E]
              border-b border-[#E5E5EA] dark:border-[#3C3C3E]">
              <th className="sticky left-0 z-10 w-[50px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E]">No.</th>
              <th className="w-[300px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E]">Part Name</th>
              {data.showDescription && (
                <th className="w-[300px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Description</th>
              )}
              <th className="w-[100px] min-w-[100px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Q&apos;TY</th>
              <th className="w-[100px] min-w-[100px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Unit</th>
              <th className="w-[120px] min-w-[120px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">U/Price</th>
              <th className="w-[120px] min-w-[120px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Amount</th>
              {data.showRemarks && (
                <th className="w-[200px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Remarks</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id} 
                className="border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
                <td className="sticky left-0 z-10 w-[50px] px-1 py-2 text-center text-sm bg-white/90 dark:bg-[#1C1C1E]/90">
                  <span 
                    className="flex items-center justify-center w-5 h-5 rounded-full 
                      text-xs text-gray-400
                      hover:bg-red-100 hover:text-red-600 
                      cursor-pointer transition-colors"
                    onClick={() => handleSoftDelete(index)}
                    title="Click to delete"
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-2 group hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50">
                  <textarea
                    value={item.partName}
                    onChange={(e) => handleItemChange(index, 'partName', e.target.value)}
                    data-row={index}
                    data-field="partName"
                    onKeyDown={(e) => handleKeyDown(e, index, 'partName')}
                    onPaste={(e) => handleCellPaste(e, index, 'partName')}
                    className="w-full bg-transparent border-none resize-none text-center text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-normal
                      focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20 rounded-lg
                      transition-all duration-200 whitespace-pre-wrap overflow-hidden"
                    style={{ 
                      height: item.partName.includes('\n') ? 'auto' : '24px',
                      minHeight: '24px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = '24px';
                      if (target.value.includes('\n')) {
                        target.style.height = target.scrollHeight + 'px';
                      }
                    }}
                  />
                </td>
                {data.showDescription && (
                  <td className="px-4 py-2 group hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50">
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      data-row={index}
                      data-field="description"
                      onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                      onPaste={(e) => handleCellPaste(e, index, 'description')}
                      className="w-full bg-transparent border-none resize-none text-center text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-normal
                        focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20 rounded-lg
                        transition-all duration-200 whitespace-pre-wrap overflow-hidden"
                      style={{ 
                        height: (item.description || '').includes('\n') ? 'auto' : '24px',
                        minHeight: '24px'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = '24px';
                        if (target.value.includes('\n')) {
                          target.style.height = target.scrollHeight + 'px';
                        }
                      }}
                    />
                  </td>
                )}
                <td className="w-[100px] px-1 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingQtyIndex === index ? editingQtyAmount : (item.quantity === 0 ? '' : item.quantity.toString())}
                    data-row={index}
                    data-field="quantity"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setEditingQtyAmount(value);
                        handleItemChange(index, 'quantity', value === '' ? 0 : parseInt(value));
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                    onPaste={(e) => handleCellPaste(e, index, 'quantity')}
                    onFocus={(e) => {
                      setEditingQtyIndex(index);
                      setEditingQtyAmount(item.quantity === 0 ? '' : item.quantity.toString());
                      e.target.select();
                    }}
                    onBlur={() => {
                      setEditingQtyIndex(null);
                      setEditingQtyAmount('');
                    }}
                    className="w-full px-3 py-1.5 bg-transparent border border-transparent
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                      placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                      transition-all duration-200 text-center
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td className="w-[100px] px-1 py-2">
                  <select
                    value={item.unit}
                    data-row={index}
                    data-field="unit"
                    onChange={(e) => {
                      handleItemChange(index, 'unit', e.target.value);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index, 'unit')}
                    className="w-full px-3 py-1.5 bg-transparent border border-transparent
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                      placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                      transition-all duration-200 text-center cursor-pointer
                      appearance-none"
                  >
                    {availableUnits.map(unit => {
                      const displayUnit = defaultUnits.includes(unit) ? getUnitDisplay(unit, item.quantity) : unit;
                      return (
                        <option key={unit} value={displayUnit}>
                          {displayUnit}
                        </option>
                      );
                    })}
                  </select>
                </td>
                <td className="w-[120px] px-1 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingPriceIndex === index ? editingPriceAmount : (item.unitPrice === 0 ? '' : item.unitPrice.toFixed(2))}
                    data-row={index}
                    data-field="unitPrice"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^-?\d*\.?\d*$/.test(value)) {
                        setEditingPriceAmount(value);
                        handleItemChange(index, 'unitPrice', value === '' ? 0 : parseFloat(value));
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index, 'unitPrice')}
                    onPaste={(e) => handleCellPaste(e, index, 'unitPrice')}
                    onFocus={(e) => {
                      setEditingPriceIndex(index);
                      setEditingPriceAmount(item.unitPrice === 0 ? '' : item.unitPrice.toString());
                      e.target.select();
                    }}
                    onBlur={() => {
                      setEditingPriceIndex(null);
                      setEditingPriceAmount('');
                    }}
                    className="w-full px-3 py-1.5 bg-transparent border border-transparent
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                      placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                      transition-all duration-200 text-center
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </td>
                <td className="w-[120px] px-1 py-2">
                  <input
                    type="text"
                    value={item.amount ? item.amount.toFixed(2) : ''}
                    readOnly
                    className="w-full px-3 py-1.5 bg-transparent
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                      placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                      transition-all duration-200 text-center"
                  />
                </td>
                {data.showRemarks && (
                  <td className="w-[200px] px-1 py-2">
                    <input
                      type="text"
                      value={item.remarks}
                      data-row={index}
                      data-field="remarks"
                      onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'remarks')}
                      onPaste={(e) => handleCellPaste(e, index, 'remarks')}
                      className="w-full px-3 py-1.5 bg-transparent border border-transparent
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                        placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                        transition-all duration-200 text-center"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(data.otherFees ?? []).length > 0 && (
        <div className="overflow-x-auto overflow-hidden rounded-b-2xl border border-t-0 border-[#E5E5EA] dark:border-[#2C2C2E]
          bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl">
          <table className="w-full">
            <tbody>
              {(data.otherFees ?? []).map((fee, index) => (
                <tr key={fee.id} 
                  className="border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
                  <td className="sticky left-0 z-10 w-[50px] px-1 py-2 text-center text-sm bg-white/90 dark:bg-[#1C1C1E]/90">
                    <span 
                      className="flex items-center justify-center w-5 h-5 rounded-full 
                        text-xs text-gray-400
                        hover:bg-red-100 hover:text-red-600 
                        cursor-pointer transition-colors"
                      onClick={() => handleOtherFeeSoftDelete(index)}
                      title="Click to delete"
                    >
                      ×
                    </span>
                  </td>
                  <td colSpan={data.showDescription ? 6 : 5} className="px-1 py-2">
                    <input
                      type="text"
                      value={fee.description}
                      onChange={(e) => handleOtherFeeChange(index, 'description', e.target.value)}
                      placeholder="Other Fee"
                      className="w-full px-3 py-1.5 bg-transparent border border-transparent
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                        text-[13px] text-center
                        placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                        transition-all duration-200"
                    />
                  </td>
                  <td className="w-[120px] px-1 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editingOtherFeeIndex === index ? editingOtherFeeAmount : (fee.amount === 0 ? '' : fee.amount.toFixed(2))}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^-?\d*\.?\d*$/.test(value)) {
                          setEditingOtherFeeAmount(value);
                          handleOtherFeeChange(index, 'amount', value === '' ? 0 : parseFloat(value));
                        }
                      }}
                      onFocus={(e) => {
                        setEditingOtherFeeIndex(index);
                        setEditingOtherFeeAmount(fee.amount === 0 ? '' : fee.amount.toString());
                        e.target.select();
                      }}
                      onBlur={() => {
                        setEditingOtherFeeIndex(null);
                        setEditingOtherFeeAmount('');
                      }}
                      placeholder="0.00"
                      className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                        text-[13px] text-center
                        placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                        transition-all duration-200`}
                    />
                  </td>
                  {data.showRemarks && (
                    <td className="w-[200px] px-1 py-2">
                      <input
                        type="text"
                        value={fee.remarks || ''}
                        onChange={(e) => handleOtherFeeChange(index, 'remarks', e.target.value)}
                        className="w-full px-3 py-1.5 bg-transparent border border-transparent
                          focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                          hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                          text-[13px] text-center
                          placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                          transition-all duration-200"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 