import React, { useState } from 'react';
import { ImportDataButton } from './ImportDataButton';
import { OtherFeeTable } from './OtherFeeTable';
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

  // 处理键盘导航
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    field: keyof LineItem
  ) => {
    const fields: (keyof LineItem)[] = ['partName'];
    if (data.showDescription) fields.push('description');
    fields.push('quantity', 'unit', 'unitPrice');
    if (data.showRemarks) fields.push('remarks');

    const currentFieldIndex = fields.indexOf(field);
    const currentRowIndex = index;

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
      case 'Enter':
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
      // 处理单位变更，直接使用选择的单位
      newItems[index] = {
        ...newItems[index],
        unit: value.toString()
      };
    } else if (field === 'quantity') {
      // 更新数量时，同时更新单位的单复数
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

    // 如果更改了数量或单价，自动计算金额
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    onChange({
      ...data,
      items: newItems
    });
  };

  // 处理软删除
  const handleSoftDelete = (index: number) => {
    onChange({
      ...data,
      items: data.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <ImportDataButton onImport={handleImport} />

      <div className="overflow-hidden rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E]
        bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F7] dark:bg-[#2C2C2E]
              border-b border-[#E5E5EA] dark:border-[#3C3C3E]">
              <th className="w-[60px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">No.</th>
              <th className="w-[280px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Part Name</th>
              {data.showDescription && (
                <th className="w-[180px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Description</th>
              )}
              <th className="w-[100px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Q&apos;TY</th>
              <th className="w-[100px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Unit</th>
              <th className="w-[120px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">U/Price</th>
              <th className="w-[120px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Amount</th>
              {data.showRemarks && (
                <th className="w-[180px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Remarks</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id} 
                className={`border-t border-[#E5E5EA] dark:border-[#2C2C2E]
                  ${index % 2 === 0 ? 'bg-white/50 dark:bg-[#1C1C1E]/50' : 'bg-[#F5F5F7]/50 dark:bg-[#2C2C2E]/50'}`}
              >
                <td className="w-[60px] px-4 py-2 text-sm">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full 
                      text-xs text-[#86868B] hover:bg-red-500/10 hover:text-red-500 
                      cursor-pointer transition-all duration-200"
                    onClick={() => handleSoftDelete(index)}
                    title="Click to delete"
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="w-[280px] px-4 py-2">
                  <input
                    type="text"
                    value={item.partName}
                    data-row={index}
                    data-field="partName"
                    onChange={(e) => handleItemChange(index, 'partName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'partName')}
                    className="w-full px-3 py-1.5 bg-transparent border border-transparent
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                      placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                      transition-all duration-200 text-center"
                  />
                </td>
                {data.showDescription && (
                  <td className="w-[180px] px-4 py-2">
                    <input
                      type="text"
                      value={item.description}
                      data-row={index}
                      data-field="description"
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                      className="w-full px-3 py-1.5 bg-transparent border border-transparent
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                        placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                        transition-all duration-200 text-center"
                    />
                  </td>
                )}
                <td className="w-[100px] px-4 py-2">
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
                <td className="w-[100px] px-4 py-2">
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
                      transition-all duration-200 text-center cursor-pointer"
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
                <td className="w-[120px] px-4 py-2">
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
                <td className="w-[120px] px-4 py-2">
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
                  <td className="w-[180px] px-4 py-2">
                    <input
                      type="text"
                      value={item.remarks}
                      data-row={index}
                      data-field="remarks"
                      onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'remarks')}
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

      {/* 使用新的 OtherFeeTable 组件 */}
      <OtherFeeTable data={data} onChange={onChange} />
    </div>
  );
}; 