import type { QuotationData, LineItem } from '@/types/quotation';

interface ItemsTableProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

const tableClassName = `overflow-x-auto rounded-2xl 
  border border-gray-200/30 dark:border-gray-700/30
  bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl
  shadow-lg`;

const tableHeaderClassName = `border-b 
  border-[#007AFF]/10 dark:border-[#0A84FF]/10
  bg-[#007AFF]/5 dark:bg-[#0A84FF]/5`;

const tableCellClassName = `px-4 py-2 text-sm text-gray-600 dark:text-gray-300`;

const inputClassName = `w-full px-3 py-1.5 rounded-lg
  bg-transparent
  border border-transparent
  focus:outline-none focus:ring-2 
  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
  hover:bg-gray-50/50 dark:hover:bg-[#1c1c1e]/50
  text-sm text-gray-800 dark:text-gray-200
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/40
  transition-all duration-200`;

const numberInputClassName = `${inputClassName}
  text-center
  [appearance:textfield]
  [&::-webkit-outer-spin-button]:appearance-none
  [&::-webkit-inner-spin-button]:appearance-none`;

const selectClassName = `${inputClassName}
  appearance-none
  bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')]
  bg-[length:1em_1em]
  bg-[right_0.5rem_center]
  bg-no-repeat
  pr-8`;

export function ItemsTable({ data, onChange }: ItemsTableProps) {
  const addLineItem = () => {
    onChange({
      ...data,
      items: [
        ...data.items,
        {
          lineNo: data.items.length + 1,
          partName: '',
          quantity: 0,
          unit: 'pc',
          unitPrice: 0,
          amount: 0
        }
      ]
    });
  };

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

  const getTotalAmount = () => {
    return data.items.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="space-y-4">
      <div className={tableClassName}>
        <table className="w-full">
          <thead className={tableHeaderClassName}>
            <tr>
              <th className={tableCellClassName}>No.</th>
              <th className={tableCellClassName}>Part Name</th>
              {data.showDescription && (
                <th className={tableCellClassName}>Description</th>
              )}
              <th className={`${tableCellClassName} text-center`}>Q&apos;TY</th>
              <th className={`${tableCellClassName} text-center`}>Unit</th>
              <th className={`${tableCellClassName} text-right`}>U/Price</th>
              <th className={`${tableCellClassName} text-right`}>Amount</th>
              {data.showRemarks && (
                <th className={tableCellClassName}>Remarks</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.lineNo} className="border-b border-gray-200/30 dark:border-gray-700/30">
                <td className={tableCellClassName}>
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full 
                      text-xs text-gray-400
                      hover:bg-red-100 hover:text-red-600 
                      cursor-pointer transition-colors"
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
                    className={inputClassName}
                  />
                </td>
                {data.showDescription && (
                  <td className={tableCellClassName}>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={e => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Enter description"
                      className={inputClassName}
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
                    className={selectClassName}
                  >
                    <option value="pc">pc{item.quantity > 1 ? 's' : ''}</option>
                    <option value="set">set{item.quantity > 1 ? 's' : ''}</option>
                    <option value="length">length{item.quantity > 1 ? 's' : ''}</option>
                  </select>
                </td>
                <td className={tableCellClassName}>
                  <input
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={e => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                    placeholder="0.00"
                    className={`${numberInputClassName} text-right`}
                  />
                </td>
                <td className={tableCellClassName}>
                  <input
                    type="text"
                    value={item.amount.toFixed(2)}
                    readOnly
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
                      className={inputClassName}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={addLineItem}
          className="px-4 py-2 rounded-xl text-sm font-medium
            text-[#007AFF] hover:bg-[#007AFF]/10 dark:text-[#0A84FF] dark:hover:bg-[#0A84FF]/10
            transition-all duration-300"
        >
          + Add Line
        </button>
        <div className="text-right">
          <span className="text-sm text-gray-500">Total Amount</span>
          <div className="text-xl font-semibold">
            ${getTotalAmount().toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
} 