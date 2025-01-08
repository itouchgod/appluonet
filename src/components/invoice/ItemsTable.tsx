import type { InvoiceData, LineItem } from '@/types/invoice';

interface ItemsTableProps {
  data: InvoiceData;
  onChange: (index: number, field: keyof LineItem, value: string | number) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({ data, onChange }) => {
  // 处理单位的单复数
  const getUnitDisplay = (baseUnit: string, quantity: number) => {
    const defaultUnits = ['pc', 'set', 'length'];
    if (defaultUnits.includes(baseUnit)) {
      return quantity > 1 ? `${baseUnit}s` : baseUnit;
    }
    return baseUnit;
  };

  // 计算金额
  const calculateAmount = (quantity: number, unitPrice: number) => {
    return Number((quantity * unitPrice).toFixed(2));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">No.</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="w-[100px] px-4 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Q&apos;TY</th>
            <th className="px-4 py-2 text-center">Unit</th>
            <th className="px-4 py-2 text-right">U/Price</th>
            <th className="px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.lineNo}>
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => onChange(index, 'description', e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const quantity = Number(e.target.value);
                    onChange(index, 'quantity', quantity);
                    // 更新金额
                    onChange(index, 'amount', calculateAmount(quantity, item.unitPrice));
                  }}
                  className="w-full bg-transparent border-none focus:outline-none text-center"
                />
              </td>
              <td className="px-4 py-2">
                <select
                  value={item.unit.replace(/s$/, '')}
                  onChange={(e) => {
                    const baseUnit = e.target.value;
                    const unit = getUnitDisplay(baseUnit, item.quantity);
                    onChange(index, 'unit', unit);
                  }}
                  className="w-full bg-transparent border-none focus:outline-none text-center"
                >
                  <option value="pc">pc{item.quantity > 1 ? 's' : ''}</option>
                  <option value="set">set{item.quantity > 1 ? 's' : ''}</option>
                  <option value="length">length{item.quantity > 1 ? 's' : ''}</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const unitPrice = Number(e.target.value);
                    onChange(index, 'unitPrice', unitPrice);
                    // 更新金额
                    onChange(index, 'amount', calculateAmount(item.quantity, unitPrice));
                  }}
                  className="w-full bg-transparent border-none focus:outline-none text-right"
                />
              </td>
              <td className="px-4 py-2 text-right">
                {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 