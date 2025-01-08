'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Settings, Clipboard } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { InvoiceTemplateConfig } from '@/types/invoice';
import { format, addMonths } from 'date-fns';
import { Footer } from '@/components/Footer';
import { handleImportData } from '@/utils/invoiceDataHandler';

// 基础样式定义
const inputClassName = `w-full px-4 py-2.5 rounded-2xl
  bg-white/95 dark:bg-[#1c1c1e]/95
  border border-[#007AFF]/10 dark:border-[#0A84FF]/10
  focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/60
  text-[15px] leading-relaxed text-gray-800 dark:text-gray-100
  transition-all duration-300 ease-out
  hover:border-[#007AFF]/20 dark:hover:border-[#0A84FF]/20
  shadow-sm hover:shadow-md`;

const tableInputClassName = `w-full px-3 py-2 rounded-xl
  bg-transparent backdrop-blur-sm
  border border-transparent
  focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20
  text-[14px] leading-relaxed text-gray-800 dark:text-gray-100
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/60
  transition-all duration-300 ease-out
  hover:bg-[#007AFF]/5 dark:hover:bg-[#0A84FF]/5
  text-center whitespace-pre-wrap`;

const numberInputClassName = `${tableInputClassName}
  [appearance:textfield] 
  [&::-webkit-outer-spin-button]:appearance-none 
  [&::-webkit-inner-spin-button]:appearance-none
  text-center`;

interface LineItem {
  lineNo: number;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNo: string;
  date: string;
  to: string;
  customerPO: string;
  items: Array<{
    lineNo: number;
    hsCode: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }>;
  bankInfo: string;
  paymentDate: string;
  showPaymentTerms: boolean;
  additionalPaymentTerms: string;
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  remarks?: string;
  showHsCode: boolean;
  showBank: boolean;
  showInvoiceReminder: boolean;
  currency: 'USD' | 'CNY';
  templateConfig: InvoiceTemplateConfig;
  otherFees: Array<{
    id: number;
    description: string;
    amount: number;
  }>;
}

export default function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNo: '',
    date: format(new Date(), 'yyyy/MM/dd'),
    to: '',
    customerPO: '',
    items: [{
      lineNo: 1,
      hsCode: '',
      description: '',
      quantity: 0,
      unit: 'pc',
      unitPrice: 0,
      amount: 0
    }],
    bankInfo: `Bank Name: The Hongkong and Shanghai Banking Corporation Limited
Swift code: HSBCHKHHHKH
Bank address: Head Office 1 Queen's Road Central Hong Kong
A/C No.: 801470337838
Beneficiary: Luo & Company Co., Limited`,
    paymentDate: format(addMonths(new Date(), 1), 'yyyy/MM/dd'),
    showPaymentTerms: false,
    additionalPaymentTerms: '',
    amountInWords: {
      dollars: '',
      cents: '',
      hasDecimals: false
    },
    remarks: '',
    showHsCode: false,
    showBank: false,
    showInvoiceReminder: true,
    currency: 'USD',
    templateConfig: {
      headerType: 'none',
      invoiceType: 'invoice',
      stampType: 'none'
    },
    otherFees: []
  });

  const [showSettings, setShowSettings] = useState(false);
  const [editingUnitPriceIndex, setEditingUnitPriceIndex] = useState<number | null>(null);
  const [editingUnitPrice, setEditingUnitPrice] = useState<string>('');
  const [editingQuantityIndex, setEditingQuantityIndex] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string>('');
  const [templateConfig, setTemplateConfig] = useState<InvoiceTemplateConfig>({
    headerType: 'bilingual',
    invoiceType: 'invoice',
    stampType: 'none'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPaymentTerms, setShowPaymentTerms] = useState(true);
  const [additionalPaymentTerms, setAdditionalPaymentTerms] = useState('');
  const [editingFeeAmount, setEditingFeeAmount] = useState<string>('');
  const [editingFeeIndex, setEditingFeeIndex] = useState<number | null>(null);

  const handleAddLine = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, {
        lineNo: prev.items.length + 1,
        hsCode: '',
        description: '',
        quantity: 0,
        unit: 'pc',
        unitPrice: 0,
        amount: 0
      }]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateInvoicePDF({
        ...invoiceData,
        showPaymentTerms,
        additionalPaymentTerms,
        templateConfig
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const calculateAmount = (quantity: number, unitPrice: number) => {
    return Number((quantity * unitPrice).toFixed(2));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      
      if (field === 'quantity') {
        const quantity = Number(value);
        const baseUnit = item.unit.replace(/s$/, '');
        item.unit = quantity > 1 ? `${baseUnit}s` : baseUnit;
      }
      
      (item as { [key: string]: string | number })[field] = value;
      
      if (field === 'quantity' || field === 'unitPrice') {
        item.amount = calculateAmount(
          field === 'quantity' ? Number(value) : item.quantity,
          field === 'unitPrice' ? Number(value) : item.unitPrice
        );
      }
      
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const getTotalAmount = useCallback(() => {
    const itemsTotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const feesTotal = (invoiceData.otherFees || []).reduce((sum, fee) => sum + fee.amount, 0);
    return itemsTotal + feesTotal;
  }, [invoiceData.items, invoiceData.otherFees]);

  // 计算付款日期（设置日期后一个月）
  const calculatePaymentDate = useCallback((date: string) => {
    const baseDate = new Date(date);
    baseDate.setMonth(baseDate.getMonth() + 1);
    return baseDate.toISOString().split('T')[0];
  }, []);

  // 监听日期变化
  useEffect(() => {
    const newPaymentDate = calculatePaymentDate(invoiceData.date);
    setInvoiceData(prev => ({
      ...prev,
      paymentDate: newPaymentDate
    }));
  }, [invoiceData.date, calculatePaymentDate]);

  // 初始化时设置付款日期
  useEffect(() => {
    const initialPaymentDate = calculatePaymentDate(invoiceData.date);
    setInvoiceData(prev => ({
      ...prev,
      paymentDate: initialPaymentDate
    }));
  }, [invoiceData.date, calculatePaymentDate]);

  // 数字转英文大写金额
  const numberToWords = useCallback((num: number) => {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
      }
      const hundred = ones[Math.floor(n / 100)] + ' HUNDRED';
      const remainder = n % 100;
      if (remainder === 0) return hundred;
      return hundred + ' AND ' + convertLessThanThousand(remainder);
    };

    const convert = (n: number): string => {
      if (n === 0) return 'ZERO';
      
      const billion = Math.floor(n / 1000000000);
      const million = Math.floor((n % 1000000000) / 1000000);
      const thousand = Math.floor((n % 1000000) / 1000);
      const remainder = n % 1000;
      
      let result = '';
      
      if (billion) result += convertLessThanThousand(billion) + ' BILLION ';
      if (million) result += convertLessThanThousand(million) + ' MILLION ';
      if (thousand) result += convertLessThanThousand(thousand) + ' THOUSAND ';
      if (remainder) result += convertLessThanThousand(remainder);
      
      return result.trim();
    };

    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);
    
    if (cents > 0) {
      return {
        dollars: convert(dollars),
        cents: `${convert(cents)} CENT${cents === 1 ? '' : 'S'}`,
        hasDecimals: true
      };
    } else {
      return {
        dollars: convert(dollars),
        cents: '',
        hasDecimals: false
      };
    }
  }, []);

  // 监听总金额变化，更新大写金额
  useEffect(() => {
    const total = getTotalAmount();
    const words = numberToWords(total);
    setInvoiceData(prev => ({
      ...prev,
      amountInWords: words
    }));
  }, [invoiceData.items, getTotalAmount, numberToWords]);

  // 处理额外付款条款的变化
  const handleAdditionalTermsChange = (value: string) => {
    setAdditionalPaymentTerms(value);
    setInvoiceData(prev => ({
      ...prev,
      additionalPaymentTerms: value
    }));
  };

  // 处理导入数据
  const handleImportDataLocal = useCallback((text: string) => {
    try {
      const parsedRows = handleImportData(text);
      if (Array.isArray(parsedRows)) {
        setInvoiceData(prev => ({
          ...prev,
          items: parsedRows
        }));
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }, []);

  // 添加导入数据事件监听
  useEffect(() => {
    const importDataListener = (event: CustomEvent<string>) => {
      handleImportDataLocal(event.detail);
    };

    window.addEventListener('import-data', importDataListener as EventListener);
    return () => {
      window.removeEventListener('import-data', importDataListener as EventListener);
    };
  }, [handleImportDataLocal]);

  // 修改全局粘贴事件处理函数
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      // 检查粘贴目标是否是输入框或文本区域
      const target = event.target as HTMLElement;
      
      // 如果目标元素是输入框或文本区域，直接返回，使用默认粘贴行为
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // 检查是否点击在表格内的任何位置
      const isTableCell = target.closest('td') !== null;
      if (isTableCell) {
        return; // 如果是表格单元格内，直接返回，使用默认粘贴行为
      }

      // 只有在非表格区域的粘贴才执行全局粘贴
      event.preventDefault();
      try {
        let text = event.clipboardData?.getData('text') || '';
        if (!text) {
          text = await navigator.clipboard.readText();
        }
        if (text) {
          handleImportDataLocal(text);
        }
      } catch (err) {
        console.error('Failed to handle paste:', err);
      }
    };

    // 添加全局粘贴事件监听
    document.addEventListener('paste', handlePaste);

    // 清理函数
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleImportDataLocal]);

  // 修改单元格粘贴处理函数
  const handleCellPaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, field: keyof LineItem) => {
    const pasteText = e.clipboardData.getData('text');
    
    // 如果是数字字段，进行验证
    if (field === 'quantity') {
      if (!/^\d*$/.test(pasteText.trim())) {
        e.preventDefault();
        alert('数量必须是整数');
        return;
      }
      const value = pasteText.trim() === '' ? 0 : parseInt(pasteText);
      e.preventDefault();
      updateLineItem(index, field, value);
      return;
    }
    
    if (field === 'unitPrice') {
      if (!/^-?\d*\.?\d*$/.test(pasteText.trim())) {
        e.preventDefault();
        alert('单价必须是数字');
        return;
      }
      const value = pasteText.trim() === '' ? 0 : parseFloat(pasteText);
      e.preventDefault();
      updateLineItem(index, field, value);
      return;
    }

    // 对于文本字段（description, hsCode等），直接更新值
    // 不阻止默认行为，这样可以保持原有的换行格式
    if (field === 'description' || field === 'hsCode') {
      updateLineItem(index, field, pasteText);
    }
  };

  // 默认单位列表（需要单复数变化的单位）
  const defaultUnits = ['pc', 'set', 'length'];

  // 处理单位的单复数
  const getUnitDisplay = (baseUnit: string, quantity: number) => {
    if (defaultUnits.includes(baseUnit)) {
      return quantity > 1 ? `${baseUnit}s` : baseUnit;
    }
    return baseUnit;
  };

  const handleImport = (newItems: LineItem[]) => {
    // 处理每个项目的单位单复数和金额计算
    const processedItems = newItems.map(item => {
      const baseUnit = item.unit.replace(/s$/, '');
      return {
        ...item,
        unit: defaultUnits.includes(baseUnit) ? getUnitDisplay(baseUnit, item.quantity) : item.unit,
        amount: item.quantity * item.unitPrice // 确保计算金额
      };
    });

    setInvoiceData(prev => ({
      ...prev,
      items: processedItems
    }));
  };

  // 处理单个项目的更改
  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...invoiceData.items];
    
    if (field === 'unit') {
      // 处理单位变更，根据当前数量决定是否需要复数形式
      const baseUnit = value.toString().replace(/s$/, '');
      const quantity = newItems[index].quantity;
      newItems[index] = {
        ...newItems[index],
        unit: defaultUnits.includes(baseUnit) ? getUnitDisplay(baseUnit, quantity) : value.toString()
      };
    } else if (field === 'quantity') {
      // 更新数量时，同时更新单位的单复数和金额
      const quantity = Number(value);
      const baseUnit = newItems[index].unit.replace(/s$/, '');
      newItems[index] = {
        ...newItems[index],
        quantity,
        unit: defaultUnits.includes(baseUnit) ? getUnitDisplay(baseUnit, quantity) : newItems[index].unit,
        amount: quantity * newItems[index].unitPrice
      };
    } else if (field === 'unitPrice') {
      // 更新单价时，同时更新金额
      const unitPrice = Number(value);
      newItems[index] = {
        ...newItems[index],
        unitPrice,
        amount: newItems[index].quantity * unitPrice
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }

    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
    <div className="flex-1">  {/* 添加这个 flex-1 容器 */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 返回按钮 */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/tools" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </div>

          {/* 主卡片容器 */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-4 md:p-8 mt-8">
            <form onSubmit={handleSubmit}>
              {/* 标题和设置按钮 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Invoice Generator
                  </h1>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          const importDataEvent = new CustomEvent('import-data', { detail: text });
                          window.dispatchEvent(importDataEvent);
                        }
                      } catch (err) {
                        console.error('Failed to access clipboard:', err);
                        // 如果剪贴板访问失败，显示手动输入框
                        const input = document.createElement('textarea');
                        input.style.position = 'fixed';
                        input.style.top = '50%';
                        input.style.left = '50%';
                        input.style.transform = 'translate(-50%, -50%)';
                        input.style.zIndex = '9999';
                        input.style.width = '80%';
                        input.style.height = '200px';
                        input.style.padding = '12px';
                        input.style.border = '2px solid #007AFF';
                        input.style.borderRadius = '8px';
                        input.placeholder = '请将数据粘贴到这里...';
                        
                        const overlay = document.createElement('div');
                        overlay.style.position = 'fixed';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.right = '0';
                        overlay.style.bottom = '0';
                        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        overlay.style.zIndex = '9998';
                        
                        const confirmBtn = document.createElement('button');
                        confirmBtn.textContent = '确认';
                        confirmBtn.style.position = 'fixed';
                        confirmBtn.style.bottom = '20%';
                        confirmBtn.style.left = '50%';
                        confirmBtn.style.transform = 'translateX(-50%)';
                        confirmBtn.style.zIndex = '9999';
                        confirmBtn.style.padding = '8px 24px';
                        confirmBtn.style.backgroundColor = '#007AFF';
                        confirmBtn.style.color = 'white';
                        confirmBtn.style.border = 'none';
                        confirmBtn.style.borderRadius = '6px';
                        confirmBtn.style.cursor = 'pointer';
                        
                        const cleanup = () => {
                          document.body.removeChild(input);
                          document.body.removeChild(overlay);
                          document.body.removeChild(confirmBtn);
                        };
                        
                        confirmBtn.onclick = () => {
                          const text = input.value;
                          if (text) {
                            const importDataEvent = new CustomEvent('import-data', { detail: text });
                            window.dispatchEvent(importDataEvent);
                          }
                          cleanup();
                        };
                        
                        overlay.onclick = cleanup;
                        
                        document.body.appendChild(overlay);
                        document.body.appendChild(input);
                        document.body.appendChild(confirmBtn);
                        
                        input.focus();
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <input
                    type="text"
                    value={invoiceData.invoiceNo}
                    onChange={e => setInvoiceData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    placeholder="Invoice No."
                    className={`${inputClassName} w-[200px] [&::placeholder]:text-[#007AFF]/60 dark:[&::placeholder]:text-[#0A84FF]/60 ${
                      !invoiceData.invoiceNo 
                        ? 'border-[#007AFF]/50 dark:border-[#0A84FF]/50' 
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                {/* 小屏时只显示设置按钮 */}
                <div className="sm:hidden">
                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 设置面板 */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSettings ? 'max-h-[200px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/30 dark:border-gray-700/30">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <input
                        type="date"
                        value={format(new Date(invoiceData.date), 'yyyy-MM-dd')}
                        onChange={e => setInvoiceData(prev => ({ ...prev, date: format(new Date(e.target.value), 'yyyy/MM/dd') }))}
                        className={`${inputClassName} !py-1.5`}
                        style={{ 
                          colorScheme: 'light dark',
                          width: '150px',
                          minWidth: '150px',
                          maxWidth: '150px',
                          flexShrink: 0,
                          flexGrow: 0
                        }}
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              invoiceData.currency === 'USD' 
                                ? 'bg-[#007AFF] text-white' 
                                : 'bg-white/90 dark:bg-[#1c1c1e]/90 text-gray-600 dark:text-gray-400 border border-gray-200/30 dark:border-[#2c2c2e]/50'
                            }`}
                            onClick={() => setInvoiceData(prev => ({ ...prev, currency: 'USD' }))}
                          >
                            $
                          </button>
                          <button
                            type="button"
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              invoiceData.currency === 'CNY' 
                                ? 'bg-[#007AFF] text-white' 
                                : 'bg-white/90 dark:bg-[#1c1c1e]/90 text-gray-600 dark:text-gray-400 border border-gray-200/30 dark:border-[#2c2c2e]/50'
                            }`}
                            onClick={() => setInvoiceData(prev => ({ ...prev, currency: 'CNY' }))}
                          >
                            ¥
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={invoiceData.showHsCode}
                              onChange={e => setInvoiceData(prev => ({ ...prev, showHsCode: e.target.checked }))}
                              className="rounded border-gray-300 text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">HS Code</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={invoiceData.showBank}
                              onChange={e => setInvoiceData(prev => ({ ...prev, showBank: e.target.checked }))}
                              className="rounded border-gray-300 text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Bank</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 模板设置选项 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Header Type</h3>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.headerType === 'none'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, headerType: 'none' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">None</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.headerType === 'bilingual'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, headerType: 'bilingual' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Bilingual</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.headerType === 'english'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, headerType: 'english' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">English</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Invoice Type</h3>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.invoiceType === 'invoice'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, invoiceType: 'invoice' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Invoice</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.invoiceType === 'commercial'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, invoiceType: 'commercial' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Commercial</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.invoiceType === 'proforma'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, invoiceType: 'proforma' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Proforma</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Company Stamp</h3>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.stampType === 'none'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, stampType: 'none' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">None</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.stampType === 'shanghai'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, stampType: 'shanghai' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Shanghai</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.stampType === 'hongkong'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, stampType: 'hongkong' }))}
                              className="text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Hong Kong</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative mb-8">
                <input
                  type="text"
                  value={invoiceData.invoiceNo}
                  onChange={e => setInvoiceData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                  placeholder="Invoice No."
                  className={`${inputClassName} block sm:hidden w-full mb-6 [&::placeholder]:text-[#007AFF]/60 dark:[&::placeholder]:text-[#0A84FF]/60 ${
                    !invoiceData.invoiceNo 
                      ? 'border-[#007AFF]/50 dark:border-[#0A84FF]/50' 
                      : ''
                  }`}
                />
              </div>
              {/* 客户信息区域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <textarea
                    value={invoiceData.to}
                    onChange={e => setInvoiceData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="Enter customer name and address"
                    rows={3}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Customer P/O No.
                  </label>
                  <input
                    type="text"
                    value={invoiceData.customerPO}
                    onChange={e => setInvoiceData(prev => ({ ...prev, customerPO: e.target.value }))}
                    placeholder="Enter customer P/O number"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* 商品表格 */}
              <div className="space-y-2">
                {/* 主表格容器 */}
                <div className="overflow-x-auto rounded-2xl border border-gray-200/30 dark:border-gray-700/30
                                bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg">
                  <div className="min-w-[600px]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#007AFF]/10 dark:border-[#0A84FF]/10
                                      bg-[#007AFF]/5 dark:bg-[#0A84FF]/5">
                          <th className="py-2 px-4 text-center text-xs font-bold opacity-90 w-[40px]">No.</th>
                          {invoiceData.showHsCode && (
                            <th className="py-2 px-4 text-center text-xs font-bold opacity-90 w-[120px]">
                              HS Code
                            </th>
                          )}
                          <th className="py-2 px-4 text-center text-xs font-bold opacity-90 flex-1">Description</th>
                          <th className="py-2 px-4 text-center text-xs font-bold opacity-90 w-[100px]">Q&apos;TY</th>
                          <th className="py-2 px-4 text-center text-xs font-bold opacity-90 w-[100px]">Unit</th>
                          <th className="py-2 px-4 text-center text-xs font-bold opacity-90 w-[130px]">U/Price</th>
                          <th className="py-2 px-4 text-center text-xs font-bold opacity-90 w-[150px]">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, index) => (
                          <tr key={item.lineNo} 
                              className="border-b border-[#007AFF]/10 dark:border-[#0A84FF]/10">
                            <td className="py-1 px-1 text-sm">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full 
                                             hover:bg-red-100 hover:text-red-600 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setInvoiceData(prev => ({
                                        ...prev,
                                        items: prev.items
                                          .filter((_, i) => i !== index)
                                          .map((item, i) => ({
                                            ...item,
                                            lineNo: i + 1  // 重新编号
                                          }))
                                      }));
                                    }}
                                    title="Click to delete"
                              >
                                {item.lineNo}
                              </span>
                            </td>
                            {invoiceData.showHsCode && (
                              <td className="py-1.5 px-1">
                                <input
                                  type="text"
                                  value={item.hsCode}
                                  onChange={e => updateLineItem(index, 'hsCode', e.target.value)}
                                  onPaste={(e) => handleCellPaste(e, index, 'hsCode')}
                                  className={tableInputClassName}
                                  placeholder="HS Code"
                                />
                              </td>
                            )}
                            <td className="py-1 px-1">
                              <textarea
                                value={item.description}
                                onChange={e => updateLineItem(index, 'description', e.target.value)}
                                onPaste={(e) => handleCellPaste(e, index, 'description')}
                                rows={1}
                                className={`${tableInputClassName} resize-none overflow-hidden`}
                                placeholder="Enter description"
                                style={{ height: 'auto', minHeight: '28px' }}
                                onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = target.scrollHeight + 'px';
                                }}
                              />
                            </td>
                            <td className="py-1.5 px-1">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={editingQuantityIndex === index ? editingQuantity : (item.quantity || '')}
                                onChange={e => {
                                  const inputValue = e.target.value;
                                  if (/^\d*$/.test(inputValue)) {
                                    setEditingQuantity(inputValue);
                                    const value = parseInt(inputValue);
                                    if (!isNaN(value) || inputValue === '') {
                                      updateLineItem(index, 'quantity', value || 0);
                                    }
                                  }
                                }}
                                onPaste={(e) => handleCellPaste(e, index, 'quantity')}
                                onFocus={(e) => {
                                  setEditingQuantityIndex(index);
                                  setEditingQuantity(item.quantity === 0 ? '' : item.quantity.toString());
                                  e.target.select();
                                }}
                                onBlur={() => {
                                  setEditingQuantityIndex(null);
                                  setEditingQuantity('');
                                }}
                                className={numberInputClassName}
                              />
                            </td>
                            <td className="py-1.5 px-1">
                              <select
                                value={item.unit ? item.unit.replace(/s$/, '') : 'pc'}
                                onChange={e => {
                                  const baseUnit = e.target.value;
                                  const unit = item.quantity <= 1 ? baseUnit : `${baseUnit}s`;
                                  updateLineItem(index, 'unit', unit);
                                }}
                                className={`${tableInputClassName} appearance-none`}
                              >
                                <option value="pc">pc{item.quantity > 1 ? 's' : ''}</option>
                                <option value="set">set{item.quantity > 1 ? 's' : ''}</option>
                                <option value="length">length{item.quantity > 1 ? 's' : ''}</option>
                              </select>
                            </td>
                            <td className="py-1 px-1">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={editingUnitPriceIndex === index ? editingUnitPrice : (item.unitPrice ? item.unitPrice.toFixed(2) : '')}
                                onChange={e => {
                                  const inputValue = e.target.value;
                                  if (/^\d*\.?\d{0,2}$/.test(inputValue) || inputValue === '') {
                                    setEditingUnitPrice(inputValue);
                                    const value = parseFloat(inputValue);
                                    if (!isNaN(value)) {
                                      updateLineItem(index, 'unitPrice', value);
                                    }
                                  }
                                }}
                                onPaste={(e) => handleCellPaste(e, index, 'unitPrice')}
                                onFocus={(e) => {
                                  setEditingUnitPriceIndex(index);
                                  setEditingUnitPrice(item.unitPrice === 0 ? '' : item.unitPrice.toString());
                                  e.target.select();
                                }}
                                onBlur={() => {
                                  setEditingUnitPriceIndex(null);
                                  setEditingUnitPrice('');
                                }}
                                className={numberInputClassName}
                              />
                            </td>
                            <td className="py-1 px-1">
                              <input
                                type="text"
                                value={item.amount.toFixed(2)}
                                readOnly
                                className={numberInputClassName}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Other Fees 区域 */}
                    {invoiceData.otherFees && invoiceData.otherFees.length > 0 && (
                      <div className="border-t border-[#007AFF]/10 dark:border-[#0A84FF]/10">
                        {invoiceData.otherFees.map((fee, index) => (
                          <div key={fee.id} 
                               className={`flex items-center ${
                                 index % 2 === 0 ? 'bg-[#007AFF]/[0.02] dark:bg-[#0A84FF]/[0.02]' : ''
                               }`}>
                            <div className="w-[40px] px-4">
                              <span 
                                className="flex items-center justify-center w-6 h-6 rounded-full mx-auto
                                          text-xs text-[#86868B] hover:bg-red-500/10 hover:text-red-500 
                                          cursor-pointer transition-all duration-200"
                                onClick={() => {
                                  const newFees = invoiceData.otherFees?.filter(f => f.id !== fee.id) || [];
                                  setInvoiceData(prev => ({ ...prev, otherFees: newFees }));
                                }}
                                title="Click to delete"
                              >
                                ×
                              </span>
                            </div>
                            <div className="flex-1 px-4">
                              <input
                                type="text"
                                value={fee.description}
                                onChange={(e) => {
                                  const newFees = [...(invoiceData.otherFees || [])];
                                  newFees[index] = { ...fee, description: e.target.value };
                                  setInvoiceData(prev => ({ ...prev, otherFees: newFees }));
                                }}
                                placeholder="Other Fee"
                                className={`${tableInputClassName} text-center`}
                              />
                            </div>
                            <div className="w-[160px] px-4">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={editingFeeIndex === index ? editingFeeAmount : (fee.amount === 0 ? '' : fee.amount.toFixed(2))}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^-?\d*\.?\d{0,2}$/.test(value) || value === '' || value === '-') {
                                    setEditingFeeAmount(value);
                                    const newFees = [...(invoiceData.otherFees || [])];
                                    newFees[index] = { ...fee, amount: value === '' || value === '-' ? 0 : parseFloat(value) || 0 };
                                    setInvoiceData(prev => ({ ...prev, otherFees: newFees }));
                                  }
                                }}
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
                                className={`${numberInputClassName} ${fee.amount < 0 ? 'text-red-500 dark:text-red-400' : ''}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 添加行按钮和总金额 */}
              <div className="flex items-center justify-between gap-4 mt-6 mb-8">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="px-5 py-2.5 rounded-xl
                              bg-blue-500/10 text-blue-600 dark:text-blue-400
                              hover:bg-blue-500/15 transition-all duration-300
                              text-sm font-medium flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add Line
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newFees = [...(invoiceData.otherFees || [])];
                      newFees.push({
                        id: Date.now(),
                        description: '',
                        amount: 0
                      });
                      setInvoiceData(prev => ({ ...prev, otherFees: newFees }));
                    }}
                    className="px-5 py-2.5 rounded-xl
                              bg-blue-500/10 text-blue-600 dark:text-blue-400
                              hover:bg-blue-500/15 transition-all duration-300
                              text-sm font-medium flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add Other Fee
                  </button>
                </div>
                
                <div className="flex items-center gap-3" style={{ marginRight: '8.33%' }}>
                  <span className="text-sm font-medium text-gray-500 hidden md:inline">Total Amount</span>
                  <div className="w-[100px] text-right">
                    <span className="text-xl font-semibold tracking-tight">
                      {invoiceData.currency === 'USD' ? '$' : '¥'}
                      {getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 英文大写金额显示区域 */}
              <div className="mt-4 mb-8">
                <div className="inline text-sm">
                  <span className="text-gray-600 dark:text-gray-400">SAY TOTAL </span>
                  <span className="text-blue-500">
                    {invoiceData.currency === 'USD' ? 'US DOLLARS ' : 'CHINESE YUAN '}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{invoiceData.amountInWords.dollars}</span>
                  {invoiceData.amountInWords.hasDecimals && (
                    <>
                      <span className="text-red-500"> AND </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {invoiceData.amountInWords.cents}
                      </span>
                    </>
                  )}
                  {!invoiceData.amountInWords.hasDecimals && (
                    <span className="text-gray-600 dark:text-gray-400"> ONLY</span>
                  )}
                </div>
              </div>

              {/* 银行信息 */}
              {invoiceData.showBank && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bank Information:</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                    <p>Bank Name: The Hongkong and Shanghai Banking Corporation Limited</p>
                    <p>Swift Code: HSBCHKHHHKH</p>
                    <p>Bank Address: Head Office 1 Queen&apos;s Road Central Hong Kong</p>
                    <p>A/C No.: 801470337838</p>
                    <p>Beneficiary: Luo &amp; Company Co., Limited</p>
                  </div>
                </div>
              )}

              {/* 付款条款 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Payment Terms:
                </label>
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showPaymentTerms}
                        onChange={(e) => {
                          setShowPaymentTerms(e.target.checked);
                          setInvoiceData(prev => ({
                            ...prev,
                            showPaymentTerms: e.target.checked
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Full paid not later than</span>
                        <input
                          type="date"
                          value={invoiceData.paymentDate}
                          onChange={e => setInvoiceData(prev => ({ 
                            ...prev, 
                            paymentDate: e.target.value 
                          }))}
                          className={`${inputClassName} !py-1.5 text-red-500`}
                          style={{ 
                            colorScheme: 'light dark',
                            width: '150px',
                            minWidth: '150px',
                            maxWidth: '150px',
                            flexShrink: 0,
                            flexGrow: 0
                          }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">by telegraphic transfer.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <textarea
                        value={additionalPaymentTerms}
                        onChange={(e) => handleAdditionalTermsChange(e.target.value)}
                        placeholder="Enter additional remarks (each line will be a new payment term)"
                        className={`${inputClassName} min-h-[4em] resize`}
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={invoiceData.showInvoiceReminder}
                        onChange={e => setInvoiceData(prev => ({ ...prev, showInvoiceReminder: e.target.checked }))}
                        className="rounded border-gray-300 text-[#007AFF] dark:text-[#0A84FF] focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Please state our invoice no. <span className="text-red-500">&quot;{invoiceData.invoiceNo}&quot;</span> on your payment documents.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 生成按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl 
                             bg-blue-500 text-white font-medium
                             flex items-center justify-center gap-2
                             hover:bg-blue-600 active:bg-blue-700 
                             transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Generate Invoice
                </button>

                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const pdfUrl = await generateInvoicePDF({
                        ...invoiceData,
                        showPaymentTerms,
                        additionalPaymentTerms,
                        templateConfig
                      }, true);
                      if (pdfUrl) {
                        setPreviewUrl(pdfUrl.toString());
                        setShowPreview(true);
                      }
                    } catch (error) {
                      console.error('Error previewing PDF:', error);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium
                             bg-white dark:bg-gray-800 
                             text-gray-700 dark:text-gray-200
                             border border-gray-200 dark:border-gray-700
                             flex items-center justify-center gap-2
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             hover:border-gray-300 dark:hover:border-gray-600
                             active:bg-gray-100 dark:active:bg-gray-600
                             transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* PDF 预览模态框 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Preview Invoice</h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewUrl('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg bg-white dark:bg-gray-800"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    

      </div>
      <Footer />
    </div>
  );
}
