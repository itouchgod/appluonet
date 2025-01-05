import type { QuotationData } from '@/types/quotation';

interface OtherFeesTableProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

const tableClassName = `overflow-x-auto
  border-b border-x border-gray-200/30 dark:border-gray-700/30
  bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl`;

const tableCellClassName = `px-4 py-2 text-sm text-gray-600 dark:text-gray-300`;

const inputClassName = `w-full px-3 py-1.5
  bg-transparent
  border border-transparent
  focus:outline-none focus:ring-2 
  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
  hover:bg-gray-50/50 dark:hover:bg-[#1c1c1e]/50
  text-sm text-gray-800 dark:text-gray-200
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/40
  transition-all duration-200`;

// ... existing code ...

export function OtherFeesTable({ data, onChange }: OtherFeesTableProps) {
  return (
    <div className={tableClassName}>
      <table className="w-full">
        <tbody>
          {data.otherFees?.map((fee, index) => (
            <tr key={index} className="border-b border-gray-200/30 dark:border-gray-700/30">
              <td className={tableCellClassName}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full 
                  text-xs text-gray-400 hover:bg-red-100 hover:text-red-600 
                  cursor-pointer transition-colors"
                  onClick={() => {
                    const newFees = [...(data.otherFees || [])];
                    newFees.splice(index, 1);
                    onChange({ ...data, otherFees: newFees });
                  }}
                >
                  ×
                </span>
              </td>
              <td className={tableCellClassName}>
                <input
                  type="text"
                  value={fee.description || ''}
                  onChange={e => {
                    const newFees = [...(data.otherFees || [])];
                    newFees[index] = { ...newFees[index], description: e.target.value };
                    onChange({ ...data, otherFees: newFees });
                  }}
                  placeholder="Other Fee"
                  className={inputClassName}
                />
              </td>
              <td className={`${tableCellClassName} text-right`}>
                <input
                  type="number"
                  value={fee.amount || ''}
                  onChange={e => {
                    const newFees = [...(data.otherFees || [])];
                    newFees[index] = { ...newFees[index], amount: Number(e.target.value) };
                    onChange({ ...data, otherFees: newFees });
                  }}
                  placeholder="0.00"
                  className={`${inputClassName} text-right`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 