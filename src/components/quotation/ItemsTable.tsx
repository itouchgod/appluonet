import type { QuotationData, LineItem } from '@/types/quotation';
import { useState } from 'react';

interface ItemsTableProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

const tableClassName = `overflow-x-auto
  border border-[#E5E5EA] dark:border-[#2C2C2E]
  bg-white/80 dark:bg-[#1C1C1E]/80
  backdrop-blur-xl
  rounded-t-2xl`;

const tableHeaderClassName = `border-b 
  border-[#007AFF]/20 dark:border-[#0A84FF]/20
  bg-[#007AFF]/5 dark:bg-[#0A84FF]/5
  backdrop-blur-xl`;

const tableCellClassName = `px-4 py-3 text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
  border-b border-[#E5E5EA] dark:border-[#2C2C2E]`;

const tableRowClassName = (index: number) => 
  `border-b border-[#E5E5EA] dark:border-[#2C2C2E] ${
    index % 2 === 0 
    ? 'bg-[#007AFF]/[0.02] dark:bg-[#0A84FF]/[0.02]' 
    : ''
  }`;

const inputClassName = `w-full px-3 py-1.5
  bg-transparent
  border border-transparent
  focus:outline-none focus:ring-[3px]
  focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
  hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
  text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
  placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
  transition-all duration-200`;

const numberInputClassName = `${inputClassName}
  text-center
  [appearance:textfield]
  [&::-webkit-outer-spin-button]:appearance-none
  [&::-webkit-inner-spin-button]:appearance-none`;

const selectClassName = `${inputClassName}
  appearance-none
  bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2386868B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')]
  bg-[length:1em_1em]
  bg-[right_0.5rem_center]
  bg-no-repeat
  pr-8
  text-center`;

export function ItemsTable({ data, onChange }: ItemsTableProps) {
  const [editingUnitPrice, setEditingUnitPrice] = useState<string>('');
  const [editingUnitPriceIndex, setEditingUnitPriceIndex] = useState<number | null>(null);

  const hasOtherFees = data.otherFees && data.otherFees.length > 0;
  const finalTableClassName = `${tableClassName} ${hasOtherFees ? '' : 'border-b'}`;

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      unit: field === 'quantity' ? 
        (Number(value) <= 1 ? newItems[index].unit?.replace(/s$/, '') : `${newItems[index].unit?.replace(/s$/, '')}s`) :
        newItems[index].unit,
      amount: field === 'quantity' || field === 'unitPrice'
        ? Number(value) * (field === 'quantity' ? newItems[index].unitPrice : newItems[index].quantity)
        : newItems[index].amount
    };
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-0">
      <div className={finalTableClassName}>
        <table className="w-full">
          <thead className={tableHeaderClassName}>
            <tr>
              <th className={`${tableCellClassName} font-medium`}>No.</th>
              <th className={`${tableCellClassName} font-medium`}>Part Name</th>
              {data.showDescription && (
                <th className={`${tableCellClassName} font-medium`}>Description</th>
              )}
              <th className={`${tableCellClassName} text-center font-medium`}>Q&apos;TY</th>
              <th className={`${tableCellClassName} text-center font-medium`}>Unit</th>
              <th className={`${tableCellClassName} text-right font-medium`}>U/Price</th>
              <th className={`${tableCellClassName} text-right font-medium`}>Amount</th>
              {data.showRemarks && (
                <th className={`${tableCellClassName} font-medium`}>Remarks</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.lineNo} className={tableRowClassName(index)}>
                <td className={tableCellClassName}>
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full 
                      text-xs text-[#86868B]
                      hover:bg-red-500/10 hover:text-red-500
                      cursor-pointer transition-all duration-200"
                    onClick={() => {
                      const newItems = [...data.items];
                      newItems.splice(index, 1);
                      onChange({ ...data, items: newItems });
                    }}
                    title="Click to delete"
                  >
                    {index + 1}
                  </span>
                </td>
                <td className={tableCellClassName}>
                  <input
                    type="text"
                    value={item.partName}
                    onChange={e => updateLineItem(index, 'partName', e.target.value)}
                    placeholder="Enter part name"
                    className={`${inputClassName} text-center`}
                  />
                </td>
                {data.showDescription && (
                  <td className={tableCellClassName}>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={e => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Enter description"
                      className={`${inputClassName} text-center`}
                    />
                  </td>
                )}
                <td className={tableCellClassName}>
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={e => updateLineItem(index, 'quantity', Number(e.target.value))}
                    placeholder="0"
                    className={numberInputClassName}
                  />
                </td>
                <td className={tableCellClassName}>
                  <select
                    value={item.unit ? item.unit.replace(/s$/, '') : 'pc'}
                    onChange={e => {
                      const baseUnit = e.target.value;
                      const unit = item.quantity <= 1 ? baseUnit : `${baseUnit}s`;
                      updateLineItem(index, 'unit', unit);
                    }}
                    className={`${selectClassName} text-center`}
                  >
                    <option value="pc">pc{item.quantity > 1 ? 's' : ''}</option>
                    <option value="set">set{item.quantity > 1 ? 's' : ''}</option>
                    <option value="length">length{item.quantity > 1 ? 's' : ''}</option>
                  </select>
                </td>
                <td className={tableCellClassName}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingUnitPriceIndex === index ? editingUnitPrice : (item.unitPrice === 0 ? '' : item.unitPrice.toFixed(2))}
                    onChange={e => {
                      const value = e.target.value;
                      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                        setEditingUnitPrice(value);
                        updateLineItem(index, 'unitPrice', value === '' ? 0 : parseFloat(value));
                      }
                    }}
                    onFocus={e => {
                      setEditingUnitPriceIndex(index);
                      setEditingUnitPrice(item.unitPrice === 0 ? '' : item.unitPrice.toString());
                      e.target.select();
                    }}
                    onBlur={() => {
                      setEditingUnitPriceIndex(null);
                      setEditingUnitPrice('');
                    }}
                    placeholder="0.00"
                    className={`${numberInputClassName} text-right`}
                  />
                </td>
                <td className={tableCellClassName}>
                  <input
                    type="text"
                    value={item.amount === 0 ? '' : item.amount.toFixed(2)}
                    readOnly
                    placeholder="0.00"
                    className={`${numberInputClassName} text-right`}
                  />
                </td>
                {data.showRemarks && (
                  <td className={tableCellClassName}>
                    <input
                      type="text"
                      value={item.remarks || ''}
                      onChange={e => updateLineItem(index, 'remarks', e.target.value)}
                      placeholder="Enter remarks"
                      className={`${inputClassName} text-center`}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 