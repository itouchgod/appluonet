'use client';

import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { Settings, Download, ArrowLeft, Eye, Clipboard } from 'lucide-react';
import { generateQuotationPDF } from '@/utils/quotationPdfGenerator';
import { generateOrderConfirmationPDF } from '@/utils/orderConfirmationPdfGenerator';
import { TabButton } from '@/components/quotation/TabButton';
import { getDefaultNotes } from '@/utils/getDefaultNotes';
import { CustomerInfoSection } from '@/components/quotation/CustomerInfoSection';
import { ItemsTable } from '@/components/quotation/ItemsTable';
import { NotesSection } from '@/components/quotation/NotesSection';
import { SettingsPanel } from '@/components/quotation/SettingsPanel';
import { ImportDataButton } from '@/components/quotation/ImportDataButton';
import type { QuotationData, LineItem } from '@/types/quotation';
import { Footer } from '@/components/Footer';
import { handleImportData } from '@/utils/quotationDataHandler';
import { parseExcelData, convertExcelToLineItems } from '@/utils/excelPasteHandler';

// 标题样式
const titleClassName = `text-xl font-semibold text-gray-800 dark:text-gray-200`;

// 按钮基础样式
const buttonClassName = `px-4 py-2 rounded-xl text-sm font-medium 
  transition-all duration-300`;

export default function QuotationPage() {
  const [activeTab, setActiveTab] = useState<'quotation' | 'confirmation'>('quotation');
  const [showSettings, setShowSettings] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<QuotationData>({
    to: '',
    inquiryNo: '',
    quotationNo: '',
    date: new Date().toISOString().split('T')[0],
    from: 'Roger',
    currency: 'USD',
    paymentDate: new Date().toISOString().split('T')[0],
    items: [{
      id: 1,
      partName: '',
      description: '',
      quantity: 0,
      unit: 'pc',
      unitPrice: 0,
      amount: 0,
      remarks: ''
    }],
    notes: getDefaultNotes('Roger', 'quotation'),
    amountInWords: {
      dollars: 'ZERO',
      cents: '',
      hasDecimals: false
    },
    showDescription: true,
    showRemarks: false,
    showBank: false,
    showStamp: false,
    contractNo: '',
    customUnits: []
  });

  // 初始化时根据用户名设置报价人和备注
  useEffect(() => {
    const username = window?.localStorage?.getItem('username');
    let from = 'Roger';
    switch(username) {
      case 'sharon': from = 'Sharon'; break;
      case 'emily': from = 'Emily'; break;
      case 'nina': from = 'Nina'; break;
      case 'summer': from = 'Summer'; break;
    }
    setData(prev => ({
      ...prev,
      from,
      notes: getDefaultNotes(from, activeTab)
    }));
  }, [activeTab]);

  // 监听 activeTab 变化，更新 notes
  useEffect(() => {
    setData(prev => ({
      ...prev,
      notes: getDefaultNotes(prev.from, activeTab)
    }));
  }, [activeTab]);

  // 添加PDF预览事件监听器
  useEffect(() => {
    const handlePdfPreview = (event: CustomEvent<string>) => {
      setPdfPreviewUrl(event.detail);
    };

    window.addEventListener('pdf-preview', handlePdfPreview as EventListener);

    return () => {
      window.removeEventListener('pdf-preview', handlePdfPreview as EventListener);
    };
  }, []);

  const handleGenerate = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    flushSync(() => {
      setIsGenerating(true);
    });
    
    try {
      if (activeTab === 'quotation') {
        await generateQuotationPDF(data);
      } else {
        await generateOrderConfirmationPDF(data);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [activeTab, data]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  const handlePreview = useCallback(async () => {
    flushSync(() => {
      setIsLoading(true);
    });
    
    try {
      if (activeTab === 'quotation') {
        const pdfBlob = await generateQuotationPDF(data, true);
        const url = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(url);
      } else {
        const pdfBlob = await generateOrderConfirmationPDF(data, true);
        const url = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(url);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, data]);

  // 处理导入数据
  const handleImportDataLocal = (text: string) => {
    const rows = parseExcelData(text);
    return convertExcelToLineItems(rows);
  };

  const handleImport = (newItems: LineItem[]) => {
    setData({
      ...data,
      items: newItems
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* 返回按钮 */}
        <Link href="/tools" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        {/* 标签切换 */}
        <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 mb-6 sm:mb-8">
          <TabButton 
            active={activeTab === 'quotation'}
            onClick={() => setActiveTab('quotation')}
          >
            Quotation
          </TabButton>
          <TabButton 
            active={activeTab === 'confirmation'}
            onClick={() => setActiveTab('confirmation')}
          >
            Order Confirmation
          </TabButton>
        </div>

        {/* 主卡片容器 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* 标题和设置按钮 */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <h1 className={titleClassName}>
                  Generate {activeTab === 'quotation' ? 'Quotation' : 'Order'}
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSettings(!showSettings);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 设置面板 */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out px-4 sm:px-6 
              ${showSettings ? 'max-h-[500px] sm:max-h-[200px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
              <SettingsPanel 
                data={data}
                onChange={setData}
                activeTab={activeTab}
              />
            </div>

            {/* 客户信息区域 */}
            <div className="px-4 sm:px-6 py-4">
              <CustomerInfoSection 
                data={data}
                onChange={setData}
                type={activeTab as 'quotation' | 'confirmation'}
              />
            </div>

            {/* 商品表格区域 */}
            <div className="px-0 sm:px-6 py-4">
              <div className="space-y-4">
                <div className="px-4 sm:px-0">
                  <ImportDataButton 
                    onImport={handleImport}
                  />
                </div>
                <ItemsTable 
                  data={data}
                  onChange={setData}
                />
              </div>

              {/* 按钮和总金额区域 */}
              <div className="mt-4 px-4 sm:px-0 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...data.items];
                      newItems.push({
                        id: newItems.length + 1,
                        partName: '',
                        description: '',
                        quantity: 0,
                        unit: 'pc',
                        unitPrice: 0,
                        amount: 0,
                        remarks: ''
                      });
                      setData({ ...data, items: newItems });
                    }}
                    className="px-3 h-7 rounded-lg
                      bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                      hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                      text-[#007AFF] dark:text-[#0A84FF]
                      text-[13px] font-medium
                      flex items-center gap-1
                      transition-all duration-200"
                  >
                    <span className="text-lg leading-none translate-y-[-1px]">+</span>
                    <span>Add Line</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newFees = [...(data.otherFees || [])];
                      const maxId = newFees.reduce((max, fee) => Math.max(max, fee.id), 0);
                      newFees.push({
                        id: maxId + 1,
                        description: '',
                        amount: 0,
                        remarks: ''
                      });
                      setData({ ...data, otherFees: newFees });
                    }}
                    className="px-3 h-7 rounded-lg
                      bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                      hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                      text-[#007AFF] dark:text-[#0A84FF]
                      text-[13px] font-medium
                      flex items-center gap-1
                      transition-all duration-200"
                  >
                    <span className="text-lg leading-none translate-y-[-1px]">+</span>
                    <span>Add Other Fee</span>
                  </button>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block text-sm text-[#86868B] dark:text-gray-400">Total Amount:</div>
                    <div className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {data.currency === 'USD' ? '$' : '¥'}
                      {(
                        data.items.reduce((sum, item) => sum + item.amount, 0) +
                        (data.otherFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes 部分 */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              {/* 银行信息区域 */}
              {activeTab === 'confirmation' && data.showBank && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Bank Information:
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-xl text-sm">
                    <p>Bank Name: The Hongkong and Shanghai Banking Corporation Limited</p>
                    <p>Swift code: HSBCHKHHHKH</p>
                    <p>Bank address: Head Office 1 Queen&apos;s Road Central Hong Kong</p>
                    <p>A/C No.: 801470337838</p>
                    <p>Beneficiary: Luo & Company Co., Limited</p>
                  </div>
                </div>
              )}

              <NotesSection 
                data={data}
                onChange={setData}
              />
            </div>

            {/* 生成按钮和预览按钮 */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`${buttonClassName}
                    bg-[#007AFF] hover:bg-[#0063CC] dark:bg-[#0A84FF] dark:hover:bg-[#0070E0]
                    text-white font-medium
                    shadow-sm shadow-[#007AFF]/20 dark:shadow-[#0A84FF]/20
                    hover:shadow-lg hover:shadow-[#007AFF]/25 dark:hover:shadow-[#0A84FF]/25
                    active:scale-[0.98] active:shadow-inner
                    transform transition-all duration-200 ease-out
                    w-full sm:w-auto sm:min-w-[180px] h-10
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Generate {activeTab === 'quotation' ? 'Quotation' : 'Order'}</span>
                      </>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={isLoading}
                  className={`${buttonClassName}
                    bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                    text-[#007AFF] dark:text-[#0A84FF] font-medium
                    border border-[#007AFF]/20 dark:border-[#0A84FF]/20
                    hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                    hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
                    active:bg-[#007AFF]/[0.16] dark:active:bg-[#0A84FF]/[0.16]
                    active:scale-[0.98]
                    transform transition-all duration-200 ease-out
                    w-full sm:w-auto sm:min-w-[120px] h-10
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Previewing...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* PDF预览弹窗 */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                PDF Preview
              </h3>
              <button
                onClick={() => setPdfPreviewUrl(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
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
