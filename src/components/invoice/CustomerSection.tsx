'use client';

import { useState, useEffect } from 'react';

interface SavedCustomer {
  name: string;
  to: string;
  customerPO: string;
}

interface CustomerSectionProps {
  to: string;
  customerPO: string;
  onChange: (data: { to: string; customerPO: string }) => void;
}

const inputClassName = `w-full px-4 py-2.5 rounded-2xl
  bg-white/95 dark:bg-[#1c1c1e]/95
  border border-[#007AFF]/10 dark:border-[#0A84FF]/10
  focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/60
  text-[15px] leading-relaxed text-gray-800 dark:text-gray-100
  transition-all duration-300 ease-out
  hover:border-[#007AFF]/20 dark:hover:border-[#0A84FF]/20`;

export function CustomerSection({ to, customerPO, onChange }: CustomerSectionProps) {
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([]);
  const [showSavedCustomers, setShowSavedCustomers] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  // 加载保存的客户信息
  useEffect(() => {
    const saved = localStorage.getItem('savedInvoiceCustomers');
    if (saved) {
      setSavedCustomers(JSON.parse(saved));
    }
  }, []);

  // 保存客户信息
  const handleSave = () => {
    if (!to.trim()) return;

    const customerName = to.split('\n')[0].trim(); // 使用第一行作为客户名称
    const newCustomer: SavedCustomer = {
      name: customerName,
      to,
      customerPO
    };

    const newSavedCustomers = [...savedCustomers];
    const existingIndex = newSavedCustomers.findIndex(c => c.name === customerName);
    
    if (existingIndex >= 0) {
      newSavedCustomers[existingIndex] = newCustomer;
    } else {
      newSavedCustomers.push(newCustomer);
    }

    setSavedCustomers(newSavedCustomers);
    localStorage.setItem('savedInvoiceCustomers', JSON.stringify(newSavedCustomers));
    setShowSavedCustomers(false);
  };

  // 删除保存的客户信息
  const handleDelete = (customerName: string) => {
    const newSavedCustomers = savedCustomers.filter(c => c.name !== customerName);
    setSavedCustomers(newSavedCustomers);
    localStorage.setItem('savedInvoiceCustomers', JSON.stringify(newSavedCustomers));
  };

  // 加载客户信息
  const handleLoad = (customer: SavedCustomer) => {
    onChange({
      to: customer.to,
      customerPO: customer.customerPO
    });
    setShowSavedCustomers(false);
  };

  // 导出客户数据
  const handleExport = () => {
    const dataStr = JSON.stringify(savedCustomers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice_customers.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowImportExport(false);
  };

  // 导入客户数据
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          // 合并现有数据和导入的数据
          const mergedData = [...savedCustomers];
          importedData.forEach(customer => {
            const existingIndex = mergedData.findIndex(c => c.name === customer.name);
            if (existingIndex >= 0) {
              mergedData[existingIndex] = customer;
            } else {
              mergedData.push(customer);
            }
          });
          setSavedCustomers(mergedData);
          localStorage.setItem('savedInvoiceCustomers', JSON.stringify(mergedData));
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
    setShowImportExport(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <div className="relative">
          <textarea
            value={to}
            onChange={e => onChange({ ...{ to, customerPO }, to: e.target.value })}
            placeholder="Enter customer name and address"
            rows={3}
            className={inputClassName}
          />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowImportExport(true)}
              className="px-3 py-1 rounded-lg text-xs font-medium
                bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                text-[#007AFF] dark:text-[#0A84FF]
                transition-all duration-200"
            >
              Import/Export
            </button>
            <button
              type="button"
              onClick={() => setShowSavedCustomers(true)}
              className="px-3 py-1 rounded-lg text-xs font-medium
                bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                text-[#007AFF] dark:text-[#0A84FF]
                transition-all duration-200"
            >
              Load
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 rounded-lg text-xs font-medium
                bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                text-[#007AFF] dark:text-[#0A84FF]
                transition-all duration-200"
            >
              Save
            </button>
          </div>

          {/* 导入/导出弹窗 */}
          {showImportExport && (
            <div className="absolute z-10 right-0 top-full mt-1 w-[200px]
              bg-white dark:bg-[#2C2C2E] rounded-xl shadow-lg
              border border-gray-200/50 dark:border-gray-700/50
              p-2"
            >
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full px-3 py-2 text-left text-sm
                    hover:bg-gray-50 dark:hover:bg-[#3A3A3C] rounded-lg
                    text-gray-700 dark:text-gray-300"
                >
                  Export Customers
                </button>
                <label className="block">
                  <span className="w-full px-3 py-2 text-left text-sm
                    hover:bg-gray-50 dark:hover:bg-[#3A3A3C] rounded-lg
                    text-gray-700 dark:text-gray-300
                    cursor-pointer block"
                  >
                    Import Customers
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 保存的客户列表弹窗 */}
          {showSavedCustomers && savedCustomers.length > 0 && (
            <div className="absolute z-10 right-0 top-full mt-1 w-full max-w-md
              bg-white dark:bg-[#2C2C2E] rounded-xl shadow-lg
              border border-gray-200/50 dark:border-gray-700/50
              p-2"
            >
              <div className="max-h-[200px] overflow-y-auto">
                {savedCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-[#3A3A3C] rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(customer)}
                      className="flex-1 text-left px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {customer.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(customer.name)}
                      className="px-2 py-1 text-xs text-red-500 hover:text-red-600
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Customer P/O No.
        </label>
        <input
          type="text"
          value={customerPO}
          onChange={e => onChange({ ...{ to, customerPO }, customerPO: e.target.value })}
          placeholder="Enter customer P/O number"
          className={inputClassName}
        />
      </div>
    </div>
  );
} 