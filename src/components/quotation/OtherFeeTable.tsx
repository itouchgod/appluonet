import React, { useState } from 'react';
import type { QuotationData, OtherFee } from '@/types/quotation';

interface OtherFeeTableProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

export const OtherFeeTable: React.FC<OtherFeeTableProps> = ({ data, onChange }) => {
  const [editingFeeIndex, setEditingFeeIndex] = useState<number | null>(null);
  const [editingFeeAmount, setEditingFeeAmount] = useState<string>('');

  // 处理键盘导航
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: 'description' | 'amount' | 'remarks'
  ) => {
    const fields = ['description', 'amount'];
    if (data.showRemarks) fields.push('remarks');

    const currentFieldIndex = fields.indexOf(field);
    const currentRowIndex = index;
    const otherFees = data.otherFees || [];

    switch (e.key) {
      case 'ArrowRight':
        if (currentFieldIndex < fields.length - 1) {
          const nextField = document.querySelector<HTMLElement>(
            `[data-fee-row="${index}"][data-fee-field="${fields[currentFieldIndex + 1]}"]`
          );
          nextField?.focus();
        }
        break;
      case 'ArrowLeft':
        if (currentFieldIndex > 0) {
          const prevField = document.querySelector<HTMLElement>(
            `[data-fee-row="${index}"][data-fee-field="${fields[currentFieldIndex - 1]}"]`
          );
          prevField?.focus();
        }
        break;
      case 'ArrowUp':
        if (currentRowIndex > 0) {
          const upField = document.querySelector<HTMLElement>(
            `[data-fee-row="${index - 1}"][data-fee-field="${field}"]`
          );
          upField?.focus();
        }
        break;
      case 'ArrowDown':
      case 'Enter':
        if (currentRowIndex < otherFees.length - 1) {
          const downField = document.querySelector<HTMLElement>(
            `[data-fee-row="${index + 1}"][data-fee-field="${field}"]`
          );
          downField?.focus();
        }
        break;
      case 'Tab':
        if (!e.shiftKey && currentFieldIndex < fields.length - 1) {
          e.preventDefault();
          const nextField = document.querySelector<HTMLElement>(
            `[data-fee-row="${index}"][data-fee-field="${fields[currentFieldIndex + 1]}"]`
          );
          nextField?.focus();
        } else if (e.shiftKey && currentFieldIndex > 0) {
          e.preventDefault();
          const prevField = document.querySelector<HTMLElement>(
            `[data-fee-row="${index}"][data-fee-field="${fields[currentFieldIndex - 1]}"]`
          );
          prevField?.focus();
        }
        break;
    }
  };

  const handleFeeChange = (index: number, field: keyof OtherFee, value: string | number) => {
    const newFees = [...(data.otherFees || [])];
    newFees[index] = {
      ...newFees[index],
      [field]: value
    };
    onChange({
      ...data,
      otherFees: newFees
    });
  };

  const handleDeleteFee = (index: number) => {
    const newFees = (data.otherFees || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      otherFees: newFees
    });
  };

  if (!data.otherFees?.length) return null;

  return (
    <div className="overflow-hidden border-t-0 border border-[#E5E5EA] dark:border-[#2C2C2E]
      bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-b-2xl">
      <table className="w-full">
        <tbody>
          {data.otherFees.map((fee, index) => (
            <tr key={fee.id}
              className="border-t border-[#E5E5EA] dark:border-[#2C2C2E]"
            >
              <td className="w-[60px] px-4 py-2 text-center text-sm text-[#86868B] dark:text-gray-500">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full 
                    text-xs text-[#86868B] hover:bg-red-500/10 hover:text-red-500 
                    cursor-pointer transition-all duration-200"
                  onClick={() => handleDeleteFee(index)}
                  title="Click to delete"
                >
                  ×
                </span>
              </td>
              <td className="px-4 py-2" style={{ width: 'calc(280px + 180px + 100px + 100px + 120px)' }}>
                <input
                  type="text"
                  value={fee.description}
                  data-fee-row={index}
                  data-fee-field="description"
                  onChange={(e) => handleFeeChange(index, 'description', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                  placeholder="Other Fee"
                  className="w-full px-3 py-1.5 bg-transparent border border-transparent
                    focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                    hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                    text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                    placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                    transition-all duration-200 text-center"
                />
              </td>
              <td className="w-[120px] px-4 py-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={editingFeeIndex === index ? editingFeeAmount : (fee.amount === 0 ? '' : fee.amount.toFixed(2))}
                  data-fee-row={index}
                  data-fee-field="amount"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^-?\d*\.?\d*$/.test(value)) {
                      setEditingFeeAmount(value);
                      handleFeeChange(index, 'amount', value === '' ? 0 : parseFloat(value));
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index, 'amount')}
                  onFocus={(e) => {
                    setEditingFeeIndex(index);
                    setEditingFeeAmount(fee.amount === 0 ? '' : fee.amount.toString());
                    e.target.select();
                  }}
                  onBlur={() => {
                    setEditingFeeIndex(null);
                    setEditingFeeAmount('');
                  }}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 bg-transparent border border-transparent
                    focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                    hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                    text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                    placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                    transition-all duration-200 text-center
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </td>
              {data.showRemarks && (
                <td className="w-[180px] px-4 py-2">
                  <input
                    type="text"
                    value={fee.remarks || ''}
                    data-fee-row={index}
                    data-fee-field="remarks"
                    onChange={(e) => handleFeeChange(index, 'remarks', e.target.value)}
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
  );
}; 