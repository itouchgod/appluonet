'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Settings } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { InvoiceTemplateConfig } from '@/types/invoice';

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
  text-center`;

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
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  remarks?: string;
  showHsCode: boolean;
  currency: 'USD' | 'CNY';
}

export default function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
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
    bankInfo: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amountInWords: {
      dollars: 'ZERO',
      cents: '',
      hasDecimals: false
    },
    showHsCode: false,
    currency: 'USD'
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
      // TODO: 添加错误提示
    }
  };

  const calculateAmount = (quantity: number, unitPrice: number) => {
    return Number((quantity * unitPrice).toFixed(2));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      
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
    return invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  }, [invoiceData.items]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/tools" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        {/* 主卡片容器 */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mt-8">
          <form onSubmit={handleSubmit}>
            {/* 标题和设置按钮 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invoice Generator
              </h1>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={invoiceData.invoiceNo}
                  onChange={e => setInvoiceData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                  placeholder="Invoice No."
                  className={inputClassName}
                />
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
            <div className={`overflow-hidden transition-all duration-300 ease-out ${showSettings ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20
                            transform transition-transform duration-300 ease-out">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <input
                      type="date"
                      value={invoiceData.date}
                      onChange={e => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setInvoiceData(prev => ({ ...prev, currency: 'USD' }))}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors
                          ${invoiceData.currency === 'USD' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-blue-500/10'}`}
                      >
                        $
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceData(prev => ({ ...prev, currency: 'CNY' }))}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors
                          ${invoiceData.currency === 'CNY' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-blue-500/10'}`}
                      >
                        ¥
                      </button>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={invoiceData.showHsCode}
                        onChange={e => setInvoiceData(prev => ({ ...prev, showHsCode: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/40"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">HS Code</span>
                    </label>
                  </div>

                  {/* 模板设置选项 */}
                  <div className="pt-4 border-t border-blue-100 dark:border-blue-800/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Header Type</h3>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.headerType === 'none'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, headerType: 'none' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">None</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.headerType === 'bilingual'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, headerType: 'bilingual' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">Bilingual</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.headerType === 'english'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, headerType: 'english' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">English</span>
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
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">Invoice</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.invoiceType === 'commercial'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, invoiceType: 'commercial' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">Commercial</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.invoiceType === 'proforma'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, invoiceType: 'proforma' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">Proforma</span>
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
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">None</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.stampType === 'shanghai'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, stampType: 'shanghai' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">Shanghai</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={templateConfig.stampType === 'hongkong'}
                              onChange={() => setTemplateConfig(prev => ({ ...prev, stampType: 'hongkong' }))}
                              className="text-blue-500 focus:ring-blue-500/40"
                            />
                            <span className="text-sm">Hong Kong</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
            <div className="overflow-x-auto rounded-2xl border border-gray-200/30 dark:border-gray-700/30
                          bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#007AFF]/10 dark:border-[#0A84FF]/10
                                bg-[#007AFF]/5 dark:bg-[#0A84FF]/5">
                    <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '50px' }}>No.</th>
                    {invoiceData.showHsCode && (
                      <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '120px' }}>
                        HS Code
                      </th>
                    )}
                    <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '40%' }}>Description</th>
                    <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '80px' }}>Q&apos;TY</th>
                    <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '80px' }}>Unit</th>
                    <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '120px' }}>U/Price</th>
                    <th className="py-2 px-1 text-center text-xs font-bold opacity-90" style={{ width: '120px' }}>Amount</th>
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
                                if (invoiceData.items.length > 1) {
                                  setInvoiceData(prev => ({
                                    ...prev,
                                    items: prev.items.filter((_, i) => i !== index).map((item, i) => ({
                                      ...item,
                                      lineNo: i + 1
                                    }))
                                  }));
                                }
                              }}>
                          {item.lineNo}
                        </span>
                      </td>
                      {invoiceData.showHsCode && (
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            value={item.hsCode}
                            onChange={e => updateLineItem(index, 'hsCode', e.target.value)}
                            className={tableInputClassName}
                            placeholder="HS Code"
                          />
                        </td>
                      )}
                      <td className="py-1 px-1">
                        <textarea
                          value={item.description}
                          onChange={e => updateLineItem(index, 'description', e.target.value)}
                          rows={1}
                          className={`${tableInputClassName} resize min-h-[28px]`}
                          placeholder="Enter description"
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
                          className={`${tableInputClassName} pr-8`}
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
            </div>

            {/* 添加行按钮和总金额 */}
            <div className="flex items-center justify-between gap-4 mt-6 mb-8">
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
              
              <div className="flex items-center gap-3" style={{ marginRight: '8.33%' }}>
                <span className="text-sm font-medium text-gray-500">Total Amount</span>
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Bank Information:
              </label>
              <textarea
                value={invoiceData.bankInfo}
                onChange={e => setInvoiceData(prev => ({ ...prev, bankInfo: e.target.value }))}
                placeholder="Enter bank information"
                rows={3}
                className={inputClassName}
              />
            </div>

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
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Please state our invoice no. <span className="text-red-500">&quot;{invoiceData.invoiceNo}&quot;</span> on your payment documents.
                  </div>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="flex justify-start gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-500 text-white 
                         flex items-center justify-center gap-2
                         hover:bg-blue-600 active:bg-blue-700
                         transition-colors duration-200"
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
                className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 
                         text-gray-600 dark:text-gray-300
                         flex items-center justify-center gap-2
                         hover:bg-gray-200 dark:hover:bg-gray-700
                         transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
            </div>
          </form>
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
  );
}
