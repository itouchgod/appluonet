import React, { useState, useEffect, useCallback } from 'react';

// 表格输入框基础样式
const baseInputClassName = `w-full px-2 py-1.5 rounded-lg
  bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-sm
  border border-gray-200/60 dark:border-gray-600/60
  focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30
  focus:border-[#007AFF] dark:focus:border-[#0A84FF]
  focus:bg-white dark:focus:bg-[#1c1c1e]
  text-[13px] leading-relaxed text-gray-800 dark:text-gray-100
  placeholder:text-gray-400/70 dark:placeholder:text-gray-500/70
  transition-all duration-200 ease-out
  hover:border-gray-300/80 dark:hover:border-gray-500/80
  hover:bg-white/90 dark:hover:bg-[#1c1c1e]/90`;

// 文本输入框样式
const textInputClassName = `${baseInputClassName} text-left`;

// 数字输入框样式  
const numberInputClassName = `${baseInputClassName} text-center
  [appearance:textfield] 
  [&::-webkit-outer-spin-button]:appearance-none 
  [&::-webkit-inner-spin-button]:appearance-none`;

// 选择框样式
const selectInputClassName = `${baseInputClassName} text-center cursor-pointer
  appearance-none bg-white/80 dark:bg-[#1c1c1e]/80
  bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")] 
  bg-[length:1rem_1rem] bg-[right_0.5rem_center] bg-no-repeat pr-8`;

// 默认单位列表（需要单复数变化的单位）
const defaultUnits = ['pc', 'set', 'length'] as const;

interface PackingItem {
  id: number;
  serialNo: string;
  description: string;
  hsCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  netWeight: number;
  grossWeight: number;
  packageQty: number;
  dimensions: string;
  unit: string;
}

interface PackingData {
  items: PackingItem[];
  showHsCode: boolean;
  showDimensions: boolean;
  showWeightAndPackage: boolean;
  showPrice: boolean;
  dimensionUnit: string;
  currency: string;
  customUnits?: string[];
}

interface ItemsTableProps {
  data: PackingData;
  onItemChange: (index: number, field: keyof PackingItem, value: string | number) => void;
  onAddLine: () => void;
  onDeleteLine: (index: number) => void;
  totals: {
    totalPrice: number;
    netWeight: number;
    grossWeight: number;
    packageQty: number;
  };
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  data,
  onItemChange,
  onAddLine,
  onDeleteLine,
  totals
}) => {
  // 可用单位列表
  const availableUnits = [...defaultUnits, ...(data.customUnits || [])] as const;

  // 编辑状态管理
  const [editingQtyIndex, setEditingQtyIndex] = useState<number | null>(null);
  const [editingQtyAmount, setEditingQtyAmount] = useState<string>('');
  const [editingNetWeightIndex, setEditingNetWeightIndex] = useState<number | null>(null);
  const [editingNetWeightAmount, setEditingNetWeightAmount] = useState<string>('');
  const [editingGrossWeightIndex, setEditingGrossWeightIndex] = useState<number | null>(null);
  const [editingGrossWeightAmount, setEditingGrossWeightAmount] = useState<string>('');
  const [editingPackageQtyIndex, setEditingPackageQtyIndex] = useState<number | null>(null);
  const [editingPackageQtyAmount, setEditingPackageQtyAmount] = useState<string>('');
  const [editingUnitPriceIndex, setEditingUnitPriceIndex] = useState<number | null>(null);
  const [editingUnitPriceAmount, setEditingUnitPriceAmount] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 检测暗色模式
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', checkDarkMode);
      return () => darkModeQuery.removeEventListener('change', checkDarkMode);
    }
  }, []);

  // iOS光标优化样式
  const iosCaretStyle = {
    caretColor: '#007AFF',
    WebkitCaretColor: '#007AFF',
  } as React.CSSProperties;

  const iosCaretStyleDark = {
    caretColor: '#0A84FF',
    WebkitCaretColor: '#0A84FF',
  } as React.CSSProperties;

  // iOS输入框优化处理函数
  const handleIOSInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const element = e.target;
    
    // 设置光标颜色
    element.style.caretColor = isDarkMode ? '#0A84FF' : '#007AFF';
    (element.style as any).webkitCaretColor = isDarkMode ? '#0A84FF' : '#007AFF';
  };

  // 初始化函数，用于调整所有textarea的高度
  const initializeTextareaHeights = useCallback(() => {
    setTimeout(() => {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        textarea.style.height = '28px';
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }, 0);
  }, []);

  // 在组件挂载时调用一次初始化函数
  useEffect(() => {
    initializeTextareaHeights();
  }, [initializeTextareaHeights]);

  // 在数据变化时调整所有textarea的高度
  useEffect(() => {
    initializeTextareaHeights();
  }, [data.items, initializeTextareaHeights]);

  // 处理单位的单复数
  const getUnitDisplay = (baseUnit: string, quantity: number) => {
    if (defaultUnits.includes(baseUnit as typeof defaultUnits[number])) {
      return quantity > 1 ? `${baseUnit}s` : baseUnit;
    }
    return baseUnit; // 自定义单位不变化单复数
  };

  // 处理单位变更
  const handleUnitChange = (index: number, value: string) => {
    const baseUnit = value.replace(/s$/, '');
    const quantity = data.items[index].quantity;
    const newUnit = defaultUnits.includes(baseUnit as typeof defaultUnits[number]) 
      ? getUnitDisplay(baseUnit, quantity) 
      : value;
    onItemChange(index, 'unit', newUnit);
  };

  // 处理数量变更时同时更新单位（确保只接受整数）
  const handleQuantityChange = (index: number, value: string | number) => {
    // 确保只接受整数
    const quantity = typeof value === 'string' ? parseInt(value) || 0 : Math.floor(Number(value));
    const baseUnit = data.items[index].unit.replace(/s$/, '');
    const newUnit = defaultUnits.includes(baseUnit as typeof defaultUnits[number]) 
      ? getUnitDisplay(baseUnit, quantity) 
      : data.items[index].unit;
    
    onItemChange(index, 'quantity', quantity);
    if (newUnit !== data.items[index].unit) {
      onItemChange(index, 'unit', newUnit);
    }
  };

  // 软删除处理
  const handleSoftDelete = (index: number) => {
    if (data.items.length > 1) {
      onDeleteLine(index);
    }
  };

  return (
    <div className="space-y-0">
      {/* 移动端和平板卡片视图 - 调整断点为 xl (1280px) */}
      <div className="block lg:hidden space-y-4">
        {data.items.map((item, index) => (
          <div key={item.id} className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Item #{index + 1}</span>
              {data.items.length > 1 && (
                <button
                  onClick={() => handleSoftDelete(index)}
                  className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors text-xs"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 描述 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => {
                    onItemChange(index, 'description', e.target.value);
                    e.target.style.height = '28px';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                    focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                    text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                    placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                    transition-all duration-200 resize-none overflow-hidden min-h-[60px]
                    ios-optimized-input"
                  placeholder="Enter product description..."
                />
              </div>
              
              {/* HS Code */}
              {data.showHsCode && (
                <div>
                  <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">HS Code</label>
                  <input
                    type="text"
                    value={item.hsCode}
                    onChange={(e) => onItemChange(index, 'hsCode', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                      placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                      ios-optimized-input"
                    placeholder="HS Code"
                  />
                </div>
              )}
              
              {/* 数量 */}
              <div>
                  <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Quantity</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editingQtyIndex === index ? editingQtyAmount : (item.quantity > 0 ? item.quantity.toString() : '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setEditingQtyAmount(value);
                        handleQuantityChange(index, value === '' ? 0 : parseInt(value));
                      }
                    }}
                    onFocus={(e) => {
                      setEditingQtyIndex(index);
                      setEditingQtyAmount(item.quantity === 0 ? '' : item.quantity.toString());
                      e.target.select();
                      handleIOSInputFocus(e);
                    }}
                    onBlur={() => {
                      setEditingQtyIndex(null);
                      setEditingQtyAmount('');
                    }}
                  className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                      ios-optimized-input"
                    placeholder="0"
                    style={{
                      ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                    }}
                  />
                </div>
              
              {/* 单位 */}
                <div>
                  <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Unit</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleUnitChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center cursor-pointer appearance-none
                      ios-optimized-input"
                  >
                    {availableUnits.map(unit => {
                      const displayUnit = defaultUnits.includes(unit as typeof defaultUnits[number]) 
                        ? getUnitDisplay(unit, item.quantity) 
                        : unit;
                      return (
                        <option key={unit} value={displayUnit}>
                          {displayUnit}
                        </option>
                      );
                    })}
                  </select>
                </div>

              {/* 价格相关字段 */}
              {data.showPrice && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Unit Price</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editingUnitPriceIndex === index ? editingUnitPriceAmount : item.unitPrice.toFixed(2)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          setEditingUnitPriceAmount(value);
                          onItemChange(index, 'unitPrice', value === '' ? 0 : parseFloat(value));
                        }
                      }}
                      onFocus={(e) => {
                        setEditingUnitPriceIndex(index);
                        setEditingUnitPriceAmount(item.unitPrice === 0 ? '' : item.unitPrice.toString());
                        e.target.select();
                        handleIOSInputFocus(e);
                      }}
                      onBlur={() => {
                        setEditingUnitPriceIndex(null);
                        setEditingUnitPriceAmount('');
                      }}
                      className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center
                        ios-optimized-input"
                      placeholder="0.00"
                      style={{
                        ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Total Amount</label>
                    <input
                      type="text"
                      value={`${data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : '¥'}${item.totalPrice.toFixed(2)}`}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center cursor-default"
                    />
                  </div>
                </>
              )}

              {/* 重量和包装字段 */}
              {data.showWeightAndPackage && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Net Weight (kg)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editingNetWeightIndex === index ? editingNetWeightAmount : (item.netWeight > 0 ? item.netWeight.toFixed(2) : '')}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          setEditingNetWeightAmount(value);
                          onItemChange(index, 'netWeight', value === '' ? 0 : parseFloat(value));
                        }
                      }}
                      onFocus={(e) => {
                        setEditingNetWeightIndex(index);
                        setEditingNetWeightAmount(item.netWeight === 0 ? '' : item.netWeight.toString());
                        e.target.select();
                        handleIOSInputFocus(e);
                      }}
                                                  onBlur={(e) => {
                              setEditingNetWeightIndex(null);
                              setEditingNetWeightAmount('');
                              const value = parseFloat(e.target.value) || 0;
                              if (value > 0) {
                                onItemChange(index, 'netWeight', parseFloat(value.toFixed(2)));
                              }
                            }}
                      className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center
                        ios-optimized-input"
                      placeholder="0.00"
                      style={{
                        ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Gross Weight (kg)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editingGrossWeightIndex === index ? editingGrossWeightAmount : (item.grossWeight > 0 ? item.grossWeight.toFixed(2) : '')}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          setEditingGrossWeightAmount(value);
                          onItemChange(index, 'grossWeight', value === '' ? 0 : parseFloat(value));
                        }
                      }}
                      onFocus={(e) => {
                        setEditingGrossWeightIndex(index);
                        setEditingGrossWeightAmount(item.grossWeight === 0 ? '' : item.grossWeight.toString());
                        e.target.select();
                        handleIOSInputFocus(e);
                      }}
                                                  onBlur={(e) => {
                              setEditingGrossWeightIndex(null);
                              setEditingGrossWeightAmount('');
                              const value = parseFloat(e.target.value) || 0;
                              if (value > 0) {
                                onItemChange(index, 'grossWeight', parseFloat(value.toFixed(2)));
                              }
                            }}
                      className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center
                        ios-optimized-input"
                      placeholder="0.00"
                      style={{
                        ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">Packages</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editingPackageQtyIndex === index ? editingPackageQtyAmount : (item.packageQty > 0 ? item.packageQty.toString() : '')}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setEditingPackageQtyAmount(value);
                          onItemChange(index, 'packageQty', value === '' ? 0 : parseInt(value));
                        }
                      }}
                      onFocus={(e) => {
                        setEditingPackageQtyIndex(index);
                        setEditingPackageQtyAmount(item.packageQty === 0 ? '' : item.packageQty.toString());
                        e.target.select();
                        handleIOSInputFocus(e);
                      }}
                      onBlur={() => {
                        setEditingPackageQtyIndex(null);
                        setEditingPackageQtyAmount('');
                      }}
                      className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                        focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                        text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center
                        ios-optimized-input"
                      placeholder="0"
                      style={{
                        ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                      }}
                    />
              </div>
                </>
              )}

              {/* 尺寸字段 */}
              {data.showDimensions && (
                <div className={data.showWeightAndPackage ? "" : "sm:col-span-2"}>
                  <label className="block text-xs font-medium text-[#86868B] dark:text-[#86868B] mb-1">
                    Dimensions ({data.dimensionUnit})
                  </label>
                  <input
                    type="text"
                    value={item.dimensions}
                    onChange={(e) => onItemChange(index, 'dimensions', e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg
                      focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                      text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] text-center
                      ios-optimized-input"
                    placeholder="L×W×H"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 移动端添加按钮 */}
        <button
          type="button"
          onClick={onAddLine}
          className="w-full py-3 border-2 border-dashed border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl
            text-[#86868B] dark:text-[#86868B] hover:border-[#0066CC] hover:text-[#0066CC] 
            dark:hover:border-[#0A84FF] dark:hover:text-[#0A84FF] transition-colors"
        >
          + Add Item
        </button>

        {/* 移动端总计信息 */}
        {(data.showPrice || data.showWeightAndPackage) && (
          <div className="bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-2xl p-4 border border-[#E5E5EA] dark:border-[#48484A]">
            <h3 className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">Totals</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.showPrice && (
                <div className="text-center">
                  <div className="text-xs text-[#86868B] dark:text-[#86868B]">Total Amount</div>
                  <div className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : '¥'}
                    {totals.totalPrice.toFixed(2)}
                  </div>
                </div>
              )}
              {data.showWeightAndPackage && (
                <>
                  <div className="text-center">
                    <div className="text-xs text-[#86868B] dark:text-[#86868B]">Net Weight</div>
                    <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {totals.netWeight.toFixed(2)} kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#86868B] dark:text-[#86868B]">Gross Weight</div>
                    <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {totals.grossWeight.toFixed(2)} kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#86868B] dark:text-[#86868B]">Total Packages</div>
                    <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {totals.packageQty}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 桌面端表格视图 - 中屏及以上显示 */}
      <div className="hidden lg:block">
        {/* 表格容器 - 自适应宽度 */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="inline-block min-w-full align-middle">
          <div className="border border-[#E5E5EA] dark:border-[#2C2C2E]
            bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl overflow-hidden rounded-2xl">
              <table className="w-full table-fixed">
              <thead>
                <tr className="bg-[#F5F5F7] dark:bg-[#3A3A3C] border-b border-[#E5E5EA] dark:border-[#48484A]">
                  <th className="w-12 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">No.</th>
                    <th className={`px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] ${
                      // 动态计算 Description 列宽
                      data.showHsCode && data.showPrice && data.showWeightAndPackage && data.showDimensions 
                        ? 'w-1/6' // 最复杂情况
                        : data.showPrice && data.showWeightAndPackage
                        ? 'w-1/4' // 中等复杂
                        : 'w-1/3' // 简单情况
                    }`}>Description</th>
                                     {data.showHsCode && (
                      <th className="w-24 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">HS Code</th>
                   )}
                    <th className="w-16 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Q&apos;TY</th>
                    <th className="w-16 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Unit</th>
                  {data.showPrice && (
                    <>
                        <th className="w-24 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">U/Price</th>
                        <th className="w-28 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Amount</th>
                    </>
                  )}
                  {data.showWeightAndPackage && (
                    <>
                        <th className="w-24 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">N.W.(kg)</th>
                        <th className="w-24 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">G.W.(kg)</th>
                        <th className="w-16 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Pkgs</th>
                    </>
                  )}
                  {data.showDimensions && (
                      <th className="w-32 px-2 py-3 text-center text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Dimensions ({data.dimensionUnit})</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white/90 dark:bg-[#1C1C1E]/90">
                {data.items.map((item, index) => (
                  <tr key={item.id} className="border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
                    <td className="w-12 px-2 py-2 text-center text-sm bg-white/90 dark:bg-[#1C1C1E]/90">
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
                      <td className={`px-2 py-2 bg-white/90 dark:bg-[#1C1C1E]/90 ${
                        // 动态计算 Description 列宽，与表头保持一致
                        data.showHsCode && data.showPrice && data.showWeightAndPackage && data.showDimensions 
                          ? 'w-1/6' // 最复杂情况
                          : data.showPrice && data.showWeightAndPackage
                          ? 'w-1/4' // 中等复杂
                          : 'w-1/3' // 简单情况
                      }`}>
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          onItemChange(index, 'description', e.target.value);
                          e.target.style.height = '28px';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        className="w-full px-3 py-1.5 bg-transparent border border-transparent
                          focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                          hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                          text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                          placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                          transition-all duration-200 text-center whitespace-pre-wrap resize-y overflow-hidden
                          ios-optimized-input"
                        style={{ height: '28px' }}
                        placeholder="Enter product description..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.stopPropagation();
                          }
                        }}
                      />
                    </td>
                                         {data.showHsCode && (
                        <td className="w-24 px-2 py-2">
                         <input
                           type="text"
                           value={item.hsCode}
                           onChange={(e) => onItemChange(index, 'hsCode', e.target.value)}
                           className="w-full px-3 py-1.5 bg-transparent border border-transparent
                             focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                             hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                             text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                             placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                             transition-all duration-200 text-center
                             ios-optimized-input"
                           placeholder="HS Code"
                         />
                       </td>
                     )}
                      <td className="w-16 px-2 py-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editingQtyIndex === index ? editingQtyAmount : (item.quantity > 0 ? item.quantity.toString() : '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            setEditingQtyAmount(value);
                            handleQuantityChange(index, value === '' ? 0 : parseInt(value));
                          }
                        }}
                        onFocus={(e) => {
                          setEditingQtyIndex(index);
                          setEditingQtyAmount(item.quantity === 0 ? '' : item.quantity.toString());
                          e.target.select();
                          handleIOSInputFocus(e);
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
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                          ios-optimized-input"
                        placeholder="0"
                        style={{
                          ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                        }}
                      />
                    </td>
                      <td className="w-16 px-2 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleUnitChange(index, e.target.value)}
                        className="w-full px-3 py-1.5 bg-transparent border border-transparent
                          focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                          hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                          text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                          placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                          transition-all duration-200 text-center cursor-pointer
                          appearance-none ios-optimized-input"
                      >
                        {availableUnits.map(unit => {
                          const displayUnit = defaultUnits.includes(unit as typeof defaultUnits[number]) 
                            ? getUnitDisplay(unit, item.quantity) 
                            : unit;
                          return (
                            <option key={unit} value={displayUnit}>
                              {displayUnit}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    {data.showPrice && (
                      <>
                          <td className="w-24 px-2 py-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editingUnitPriceIndex === index ? editingUnitPriceAmount : item.unitPrice.toFixed(2)}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d*$/.test(value)) {
                                setEditingUnitPriceAmount(value);
                                onItemChange(index, 'unitPrice', value === '' ? 0 : parseFloat(value));
                              }
                            }}
                            onFocus={(e) => {
                              setEditingUnitPriceIndex(index);
                              setEditingUnitPriceAmount(item.unitPrice === 0 ? '' : item.unitPrice.toString());
                              e.target.select();
                              handleIOSInputFocus(e);
                            }}
                            onBlur={() => {
                              setEditingUnitPriceIndex(null);
                              setEditingUnitPriceAmount('');
                            }}
                            className="w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200 text-center
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                              ios-optimized-input"
                            placeholder="0.00"
                            style={{
                              ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                            }}
                          />
                        </td>
                          <td className="w-28 px-2 py-2">
                          <input
                            type="text"
                            value={`${data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : '¥'}${item.totalPrice.toFixed(2)}`}
                            readOnly
                            className="w-full px-3 py-1.5 bg-transparent
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              transition-all duration-200 text-center cursor-default"
                          />
                        </td>
                      </>
                    )}
                    {data.showWeightAndPackage && (
                      <>
                          <td className="w-24 px-2 py-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editingNetWeightIndex === index ? editingNetWeightAmount : (item.netWeight > 0 ? item.netWeight.toFixed(2) : '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d*$/.test(value)) {
                                setEditingNetWeightAmount(value);
                                onItemChange(index, 'netWeight', value === '' ? 0 : parseFloat(value));
                              }
                            }}
                            onFocus={(e) => {
                              setEditingNetWeightIndex(index);
                              setEditingNetWeightAmount(item.netWeight === 0 ? '' : item.netWeight.toString());
                              e.target.select();
                              handleIOSInputFocus(e);
                            }}
                                                  onBlur={(e) => {
                        setEditingNetWeightIndex(null);
                        setEditingNetWeightAmount('');
                        const value = parseFloat(e.target.value) || 0;
                        if (value > 0) {
                          onItemChange(index, 'netWeight', parseFloat(value.toFixed(2)));
                        }
                      }}
                            className="w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200 text-center
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                              ios-optimized-input"
                            placeholder="0.00"
                            style={{
                              ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                            }}
                          />
                        </td>
                          <td className="w-24 px-2 py-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editingGrossWeightIndex === index ? editingGrossWeightAmount : (item.grossWeight > 0 ? item.grossWeight.toFixed(2) : '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d*$/.test(value)) {
                                setEditingGrossWeightAmount(value);
                                onItemChange(index, 'grossWeight', value === '' ? 0 : parseFloat(value));
                              }
                            }}
                            onFocus={(e) => {
                              setEditingGrossWeightIndex(index);
                              setEditingGrossWeightAmount(item.grossWeight === 0 ? '' : item.grossWeight.toString());
                              e.target.select();
                              handleIOSInputFocus(e);
                            }}
                                                  onBlur={(e) => {
                        setEditingGrossWeightIndex(null);
                        setEditingGrossWeightAmount('');
                        const value = parseFloat(e.target.value) || 0;
                        if (value > 0) {
                          onItemChange(index, 'grossWeight', parseFloat(value.toFixed(2)));
                        }
                      }}
                            className="w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200 text-center
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                              ios-optimized-input"
                            placeholder="0.00"
                            style={{
                              ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                            }}
                          />
                        </td>
                          <td className="w-16 px-2 py-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editingPackageQtyIndex === index ? editingPackageQtyAmount : (item.packageQty > 0 ? item.packageQty.toString() : '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                setEditingPackageQtyAmount(value);
                                onItemChange(index, 'packageQty', value === '' ? 0 : parseInt(value));
                              }
                            }}
                            onFocus={(e) => {
                              setEditingPackageQtyIndex(index);
                              setEditingPackageQtyAmount(item.packageQty === 0 ? '' : item.packageQty.toString());
                              e.target.select();
                              handleIOSInputFocus(e);
                            }}
                            onBlur={() => {
                              setEditingPackageQtyIndex(null);
                              setEditingPackageQtyAmount('');
                            }}
                            className="w-full px-3 py-1.5 bg-transparent border border-transparent
                              focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                              hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                              text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                              placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                              transition-all duration-200 text-center
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                              ios-optimized-input"
                            placeholder="0"
                            style={{
                              ...(isDarkMode ? iosCaretStyleDark : iosCaretStyle)
                            }}
                          />
                        </td>
                      </>
                    )}
                    {data.showDimensions && (
                        <td className="w-32 px-2 py-2">
                        <input
                          type="text"
                          value={item.dimensions}
                          onChange={(e) => onItemChange(index, 'dimensions', e.target.value)}
                          className="w-full px-3 py-1.5 bg-transparent border border-transparent
                            focus:outline-none focus:ring-[3px] focus:ring-[#0066CC]/30 dark:focus:ring-[#0A84FF]/30
                            hover:bg-[#F5F5F7]/50 dark:hover:bg-[#2C2C2E]/50
                            text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]
                            placeholder:text-[#86868B] dark:placeholder:text-[#86868B]
                            transition-all duration-200 text-center
                            ios-optimized-input"
                          placeholder="L×W×H"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
                     </div>
           
            {/* 桌面端添加按钮和总计信息 */}
           <div className="mt-4 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-2xl p-4 border border-[#E5E5EA] dark:border-[#48484A]">
             <div className="flex flex-wrap gap-6 justify-between items-center">
               {/* 添加行按钮 */}
               <button
                 type="button"
                 onClick={onAddLine}
                 className="px-4 py-2 bg-[#007AFF] dark:bg-[#0A84FF] text-white rounded-lg
                   hover:bg-[#0063CC] dark:hover:bg-[#0070E0] transition-colors
                   text-sm font-medium"
               >
                 + Add Line
               </button>
               
               {/* 总计信息 */}
               {(data.showPrice || data.showWeightAndPackage) ? (
                 <div className="flex flex-wrap gap-6">
                {data.showPrice && (
                  <div className="text-right">
                    <div className="text-sm text-[#86868B] dark:text-[#86868B]">Total Amount</div>
                    <div className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : '¥'}
                      {totals.totalPrice.toFixed(2)}
                    </div>
                  </div>
                )}
                {data.showWeightAndPackage && (
                  <>
                    <div className="text-right">
                      <div className="text-sm text-[#86868B] dark:text-[#86868B]">Net Weight</div>
                      <div className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {totals.netWeight.toFixed(2)} kg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#86868B] dark:text-[#86868B]">Gross Weight</div>
                      <div className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {totals.grossWeight.toFixed(2)} kg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#86868B] dark:text-[#86868B]">Total Packages</div>
                      <div className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {totals.packageQty}
                      </div>
                    </div>
                                     </>
                 )}
                 </div>
               ) : (
                 <div></div>
               )}
              </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}; 