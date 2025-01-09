import React, { useState, useEffect } from 'react';
import { ImportDataButton } from './ImportDataButton';
import type { QuotationData, LineItem } from '@/types/quotation';

interface ItemsTableProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
  selectedGroupId?: string | null;
  onGroupSelect?: (groupId: string | null) => void;
}

// Add highlight class constant
const highlightClass = 'text-red-500 font-medium';

// 默认单位列表（需要单复数变化的单位）
const defaultUnits = ['pc', 'set', 'length'] as const;

// 检查是否是组中的最后一项
const isLastItemInGroup = (items: LineItem[], currentIndex: number) => {
  const currentItem = items[currentIndex];
  if (!currentItem.groupId) return true;
  
  const nextItem = items[currentIndex + 1];
  return !nextItem || nextItem.groupId !== currentItem.groupId;
};

// 检查是否是组中的第一项
const isFirstItemInGroup = (items: LineItem[], currentIndex: number) => {
  const currentItem = items[currentIndex];
  if (!currentItem.groupId) return true;
  
  const prevItem = items[currentIndex - 1];
  return !prevItem || prevItem.groupId !== currentItem.groupId;
};

// 获取组内行数
const getGroupRowSpan = (items: LineItem[], currentIndex: number) => {
  const currentItem = items[currentIndex];
  if (!currentItem.groupId) return 1;
  
  let span = 1;
  for (let i = currentIndex + 1; i < items.length; i++) {
    if (items[i].groupId === currentItem.groupId) {
      span++;
    } else {
      break;
    }
  }
  return span;
};

// 获取组内所有数量的总和
const getGroupTotalQuantity = (items: LineItem[], groupId: string | null) => {
  if (!groupId) return 0;
  return items
    .filter(item => item.groupId === groupId)
    .reduce((sum, item) => sum + item.quantity, 0);
};

export const ItemsTable: React.FC<ItemsTableProps> = ({ 
  data, 
  onChange,
  selectedGroupId,
  onGroupSelect
}) => {
  // 可用单位列表
  const availableUnits = [...defaultUnits, ...(data.customUnits || [])] as const;

  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null);
  const [editingPriceAmount, setEditingPriceAmount] = useState<string>('');
  const [editingQtyIndex, setEditingQtyIndex] = useState<number | null>(null);
  const [editingQtyAmount, setEditingQtyAmount] = useState<string>('');
  const [editingOtherFeeIndex, setEditingOtherFeeIndex] = useState<number | null>(null);
  const [editingOtherFeeAmount, setEditingOtherFeeAmount] = useState<string>('');

  // 添加表格宽度设置的逻辑
  useEffect(() => {
    const mainTable = document.querySelector('table');
    if (mainTable) {
      document.documentElement.style.setProperty('--table-width', `${mainTable.offsetWidth}px`);
    }
  }, [data.items.length, data.showDescription, data.showRemarks]);

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

    // 如果是文本区域且按下回车键，不阻止默认行为（允许换行）
    if ((field === 'partName' || field === 'description') && e.key === 'Enter' && !e.shiftKey) {
      e.stopPropagation(); // 阻止事件冒泡，但允许默认行为（换行）
      return;
    }

    switch (e.key) {
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
      case 'ArrowLeft':
        if (currentFieldIndex > 0) {
          const prevField = document.querySelector<HTMLElement>(
            `[data-row="${index}"][data-field="${fields[currentFieldIndex - 1]}"]`
          );
          prevField?.focus();
        }
        break;
      case 'ArrowRight':
        if (currentFieldIndex < fields.length - 1) {
          const nextField = document.querySelector<HTMLElement>(
            `[data-row="${index}"][data-field="${fields[currentFieldIndex + 1]}"]`
          );
          nextField?.focus();
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
        unit: defaultUnits.includes(baseUnit as typeof defaultUnits[number]) ? getUnitDisplay(baseUnit, item.quantity) : item.unit
      };
    });

    onChange({
      ...data,
      items: processedItems
    });
  };

  // 处理单位的单复数
  const getUnitDisplay = (baseUnit: string, quantity: number) => {
    if (defaultUnits.includes(baseUnit as typeof defaultUnits[number])) {
      return quantity > 1 ? `${baseUnit}s` : baseUnit;
    }
    return baseUnit; // 自定义单位不变化单复数
  };

  // 处理单个项目的更改
  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...data.items];
    
    // 处理文本字段，去除引号
    if (typeof value === 'string') {
      value = value.replace(/^"|"$/g, '');
    }
    
    if (field === 'unit') {
      // 处理单位变更,根据当前数量决定是否需要复数形式
      const baseUnit = value.toString().replace(/s$/, '');
      const quantity = newItems[index].quantity;
      newItems[index] = {
        ...newItems[index],
        unit: defaultUnits.includes(baseUnit as typeof defaultUnits[number]) ? getUnitDisplay(baseUnit, quantity) : value.toString()
      };
    } else if (field === 'quantity') {
      // 更新数量时,同时更新单位的单复数
      const quantity = Number(value);
      const baseUnit = newItems[index].unit.replace(/s$/, '');
      newItems[index] = {
        ...newItems[index],
        quantity,
        unit: defaultUnits.includes(baseUnit as typeof defaultUnits[number]) ? getUnitDisplay(baseUnit, quantity) : newItems[index].unit
      };

      // 如果是组合项，更新组内最后一项的金额
      if (newItems[index].groupId) {
        const groupId = newItems[index].groupId;
        const lastGroupItemIndex = newItems.findIndex((item, i) => 
          item.groupId === groupId && isLastItemInGroup(newItems, i)
        );
        if (lastGroupItemIndex !== -1) {
          const totalQuantity = getGroupTotalQuantity(newItems, groupId);
          newItems[lastGroupItemIndex].amount = totalQuantity * newItems[lastGroupItemIndex].unitPrice;
        }
      }
    } else if (field === 'unitPrice') {
      // 如果是组合项的最后一项，使用组内总数量计算金额
      if (newItems[index].groupId && isLastItemInGroup(newItems, index)) {
        const totalQuantity = getGroupTotalQuantity(newItems, newItems[index].groupId);
        newItems[index] = {
          ...newItems[index],
          unitPrice: Number(value),
          amount: totalQuantity * Number(value)
        };
      } else if (!newItems[index].groupId) {
        // 非组合项正常计算
        newItems[index] = {
          ...newItems[index],
          unitPrice: Number(value),
          amount: newItems[index].quantity * Number(value)
        };
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }

    // 如果更改了单价或数量，且不是组合项，则计算金额
    if ((field === 'unitPrice' || field === 'quantity') && !newItems[index].groupId) {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    } else if ((field === 'unitPrice' || field === 'quantity') && newItems[index].groupId) {
      // 如果是组合项，总价等于单价
      newItems[index].amount = newItems[index].unitPrice;
    }

    onChange({
      ...data,
      items: newItems
    });
  };

  // 处理单元格粘贴
  const handleCellPaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, field: keyof LineItem) => {
    const pasteText = e.clipboardData.getData('text');
    e.preventDefault();
    
    // 清理文本，但保留换行符
    const cleanText = pasteText.replace(/^"|"$/g, '').trim();
    
    switch (field) {
      case 'quantity':
        if (!/^\d+$/.test(cleanText)) {
          alert('数量必须是正整数');
          return;
        }
        const quantity = parseInt(cleanText);
        if (quantity < 0) {
          alert('数量不能为负数');
          return;
        }
        handleItemChange(index, field, quantity);
        break;
        
      case 'unitPrice':
        if (!/^\d*\.?\d*$/.test(cleanText)) {
          alert('单价必须是有效的数字');
          return;
        }
        const unitPrice = parseFloat(cleanText);
        if (isNaN(unitPrice) || unitPrice < 0) {
          alert('请输入有效的单价');
          return;
        }
        handleItemChange(index, field, unitPrice);
        break;
        
      case 'unit':
        // 单位处理，自动处理单复数
        const baseUnit = cleanText.toLowerCase().replace(/s$/, '');
        if (defaultUnits.includes(baseUnit as typeof defaultUnits[number])) {
          const quantity = data.items[index].quantity;
          handleItemChange(index, field, getUnitDisplay(baseUnit, quantity));
        } else {
          handleItemChange(index, field, cleanText);
        }
        break;
        
      default:
        // 对于其他字段（partName, description, remarks），直接使用清理后的文本，保留换行符
        handleItemChange(index, field, cleanText);
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

  // 处理其他费用的双击高亮
  const handleOtherFeeDoubleClick = (index: number, field: 'description' | 'amount' | 'remarks') => {
    const newFees = [...(data.otherFees ?? [])];
    newFees[index] = {
      ...newFees[index],
      highlight: {
        ...newFees[index].highlight,
        [field]: !newFees[index].highlight?.[field]
      }
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

  // 添加处理双击事件的函数
  const handleDoubleClick = (index: number, field: keyof Exclude<LineItem['highlight'], undefined>) => {
    const newItems = [...data.items];
    newItems[index] = {
      ...newItems[index],
      highlight: {
        ...newItems[index].highlight,
        [field]: !newItems[index].highlight?.[field]
      }
    };
    onChange({
      ...data,
      items: newItems
    });
  };

  // 处理行点击
  const handleRowClick = (item: LineItem) => {
    if (onGroupSelect) {
      onGroupSelect(item.groupId || null);
    }
  };

  return (
    <div className="space-y-0">
      <ImportDataButton onImport={handleImport} />
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 px-1">
        提示：双击单元格可以切换红色高亮显示，点击行可以选择组
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="border border-[#E5E5EA] dark:border-[#2C2C2E]
            bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl
            ${(data.otherFees ?? []).length > 0 ? 'rounded-t-2xl' : 'rounded-2xl'}">
            <table className="min-w-full divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
              <thead>
                <tr className="bg-[#F5F5F7] dark:bg-[#2C2C2E]
                  border-b border-[#E5E5EA] dark:border-[#3C3C3E]">
                  <th className="left-0 z-10 w-[50px] px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E]">No.</th>
                  <th className="min-w-[180px] max-w-[300px] w-fit px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#2C2C2E] whitespace-nowrap">Part Name</th>
                  {data.showDescription && (
                    <th className="min-w-[180px] w-fit px-1 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Description</th>
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
                {data.items.map((item, index) => {
                  const isFirstInGroup = isFirstItemInGroup(data.items, index);
                  const isSelected = item.groupId === selectedGroupId;
                  const groupBorderClass = item.groupId ? 
                    (isFirstInGroup ? 'border-t-2 border-t-blue-200 dark:border-t-blue-800' : '') : '';
                  const rowSpan = isFirstInGroup && item.groupId ? getGroupRowSpan(data.items, index) : 1;
                  const showPrice = !item.groupId || isFirstInGroup;

                  return (
                    <tr key={item.id} 
                      onClick={() => handleRowClick(item)}
                      className={`border-t border-[#E5E5EA] dark:border-[#2C2C2E] ${groupBorderClass}
                        ${item.groupId ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}
                        ${isSelected ? 'bg-blue-100 dark:bg-blue-800/30' : ''}
                        cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30
                        transition-colors duration-200`}>
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
                      <td className="min-w-[180px] w-fit px-1 py-2 bg-white/90 dark:bg-[#1C1C1E]/90">
                        <textarea
                          value={item.partName}
                          data-row={index}
                          data-field="partName"
                          onChange={(e) => {
                            handleItemChange(index, 'partName', e.target.value);
                            e.target.style.height = '28px';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onDoubleClick={() => handleDoubleClick(index, 'partName')}
                          onKeyDown={(e) => handleKeyDown(e, index, 'partName')}
                          onPaste={(e) => handleCellPaste(e, index, 'partName')}
                          className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                            focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                            hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                            text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                            placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                            transition-all duration-200 text-center whitespace-pre-wrap resize-y overflow-hidden
                            ${item.highlight?.partName ? highlightClass : ''}`}
                          style={{ 
                            height: '28px'
                          }}
                        />
                      </td>
                      {data.showDescription && (
                        <td className="min-w-[180px] w-fit px-1 py-2">
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            onDoubleClick={() => handleDoubleClick(index, 'description')}
                            onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                            onPaste={(e) => handleCellPaste(e, index, 'description')}
                            rows={1}
                            style={{ resize: 'none', overflow: 'hidden' }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                            }}
                            className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200 text-center leading-normal min-h-[34px]
                              ${item.highlight?.description ? highlightClass : ''}`}
                          />
                        </td>
                      )}
                      <td className="w-[100px] min-w-[100px] px-1 py-2">
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
                          onDoubleClick={() => handleDoubleClick(index, 'quantity')}
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
                          className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                            focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                            hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                            text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                            placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                            transition-all duration-200 text-center
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                            ${item.highlight?.quantity ? highlightClass : ''}`}
                        />
                      </td>
                      <td className="w-[100px] min-w-[100px] px-1 py-2">
                        <select
                          value={item.unit}
                          data-row={index}
                          data-field="unit"
                          onChange={(e) => {
                            handleItemChange(index, 'unit', e.target.value);
                          }}
                          onDoubleClick={() => handleDoubleClick(index, 'unit')}
                          onKeyDown={(e) => handleKeyDown(e, index, 'unit')}
                          className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                            focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                            hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                            text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                            placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                            transition-all duration-200 text-center cursor-pointer
                            appearance-none
                            ${item.highlight?.unit ? highlightClass : ''}`}
                        >
                          {availableUnits.map(unit => {
                            const displayUnit = defaultUnits.includes(unit as typeof defaultUnits[number]) ? getUnitDisplay(unit, item.quantity) : unit;
                            return (
                              <option key={unit} value={displayUnit}>
                                {displayUnit}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      {showPrice && (
                        <>
                          <td className="w-[120px] min-w-[120px] px-1 py-2" rowSpan={rowSpan}>
                            <input
                              type="text"
                              value={editingPriceIndex === index ? editingPriceAmount : (item.unitPrice === 0 ? '' : item.unitPrice.toFixed(2))}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d.]/g, '');
                                setEditingPriceAmount(value);
                                if (value === '' || value === '.') {
                                  handleItemChange(index, 'unitPrice', 0);
                                } else {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue)) {
                                    if (item.groupId) {
                                      // 如果是组合项，更新所有相同组ID的项目
                                      const groupId = item.groupId;
                                      const newItems = [...data.items];
                                      newItems.forEach((groupItem, i) => {
                                        if (groupItem.groupId === groupId) {
                                          groupItem.unitPrice = numValue;
                                          groupItem.amount = numValue; // 组合项的总价直接等于单价
                                        }
                                      });
                                      onChange({
                                        ...data,
                                        items: newItems
                                      });
                                    } else {
                                      // 非组合项，正常计算
                                      handleItemChange(index, 'unitPrice', numValue);
                                    }
                                  }
                                }
                              }}
                              onDoubleClick={() => handleDoubleClick(index, 'unitPrice')}
                              onFocus={(e) => {
                                setEditingPriceIndex(index);
                                setEditingPriceAmount(item.unitPrice === 0 ? '' : item.unitPrice.toString());
                                e.target.select();
                              }}
                              onBlur={() => {
                                setEditingPriceIndex(null);
                                setEditingPriceAmount('');
                              }}
                              className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                                focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                                hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                                text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                                placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                                transition-all duration-200 text-center
                                ${item.highlight?.unitPrice ? highlightClass : ''}`}
                            />
                          </td>
                          <td className="w-[120px] min-w-[120px] px-1 py-2" rowSpan={rowSpan}>
                            <input
                              type="text"
                              value={item.amount ? item.amount.toFixed(2) : ''}
                              readOnly
                              className={`w-full px-3 py-1.5 bg-transparent
                                text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                                placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                                transition-all duration-200 text-center
                                ${item.highlight?.amount ? highlightClass : ''}`}
                            />
                          </td>
                        </>
                      )}
                      {data.showRemarks && showPrice && (
                        <td className="w-[200px] px-1 py-2" rowSpan={rowSpan}>
                          <input
                            type="text"
                            value={item.remarks}
                            data-row={index}
                            data-field="remarks"
                            onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                            onDoubleClick={() => handleDoubleClick(index, 'remarks')}
                            onKeyDown={(e) => handleKeyDown(e, index, 'remarks')}
                            onPaste={(e) => handleCellPaste(e, index, 'remarks')}
                            className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200 text-center
                              ${item.highlight?.remarks ? highlightClass : ''}`}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(data.otherFees ?? []).length > 0 && (
            <div className="border border-t-0 border-[#E5E5EA] dark:border-[#2C2C2E]
              bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-b-2xl">
              <table className="min-w-full divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
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
                          onDoubleClick={() => handleOtherFeeDoubleClick(index, 'description')}
                          placeholder="Other Fee"
                          className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                            focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                            hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                            text-[13px] text-center
                            placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                            transition-all duration-200
                            ${fee.highlight?.description ? highlightClass : ''}`}
                        />
                      </td>
                      <td className="w-[120px] min-w-[120px] px-1 py-2">
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
                          onDoubleClick={() => handleOtherFeeDoubleClick(index, 'amount')}
                          onFocus={(e) => {
                            setEditingOtherFeeIndex(index);
                            setEditingOtherFeeAmount(fee.amount === 0 ? '' : fee.amount.toString());
                            e.target.select();
                          }}
                          onBlur={() => {
                            setEditingOtherFeeIndex(null);
                            setEditingOtherFeeAmount('');
                          }}
                          className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                            focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                            hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                            text-[13px] text-center
                            placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                            transition-all duration-200
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                            ${fee.highlight?.amount ? highlightClass : ''}`}
                        />
                      </td>
                      {data.showRemarks && (
                        <td className="w-[200px] px-1 py-2">
                          <input
                            type="text"
                            value={fee.remarks || ''}
                            onChange={(e) => handleOtherFeeChange(index, 'remarks', e.target.value)}
                            onDoubleClick={() => handleOtherFeeDoubleClick(index, 'remarks')}
                            className={`w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-center
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200
                              ${fee.highlight?.remarks ? highlightClass : ''}`}
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
      </div>
    </div>
  );
}; 