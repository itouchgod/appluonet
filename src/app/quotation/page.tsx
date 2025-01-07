'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Download, ArrowLeft, Eye } from 'lucide-react';
import { generateQuotationPDF } from '@/utils/quotationPdfGenerator';
import { generateOrderConfirmationPDF } from '@/utils/orderConfirmationPdfGenerator';
import { TabButton } from '@/components/quotation/TabButton';
import { getDefaultNotes } from '@/utils/getDefaultNotes';
import { CustomerInfoSection } from '@/components/quotation/CustomerInfoSection';
import { ItemsTable } from '@/components/quotation/ItemsTable';
import { NotesSection } from '@/components/quotation/NotesSection';
import { SettingsPanel } from '@/components/quotation/SettingsPanel';
import { ImportDataButton } from '@/components/quotation/ImportDataButton';
import type { QuotationData } from '@/types/quotation';

// 标题样式
const titleClassName = `text-xl font-semibold text-gray-800 dark:text-gray-200`;

// 输入框基础样式
const inputClassName = `w-full px-4 py-2.5 rounded-xl
  bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
  border border-gray-200/30 dark:border-[#2c2c2e]/50
  focus:outline-none focus:ring-2 
  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
  hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
  text-[15px] leading-relaxed
  text-gray-800 dark:text-gray-200
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/40
  transition-all duration-300`;

// 按钮基础样式
const buttonClassName = `px-4 py-2 rounded-xl text-sm font-medium 
  transition-all duration-300`;

export default function QuotationPage() {
  const [activeTab, setActiveTab] = useState<'quotation' | 'confirmation'>('quotation');
  const [showSettings, setShowSettings] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 当销售人员变化时，更新 notes
      if (field === 'from') {
        newData.notes = getDefaultNotes(value, activeTab);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      if (activeTab === 'quotation') {
        await generateQuotationPDF(data);
      } else {
        await generateOrderConfirmationPDF(data);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // TODO: 添加错误提示
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsPreviewing(true);
      if (activeTab === 'quotation') {
        await generateQuotationPDF(data, true);
      } else {
        await generateOrderConfirmationPDF(data, true);
      }
    } catch (error) {
      console.error('Error generating PDF preview:', error);
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/tools" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        {/* 标签切换 */}
        <div className="flex justify-center gap-4 mt-6 mb-8">
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
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* 标题和设置按钮 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className={titleClassName}>
                Generate {activeTab === 'quotation' ? 'Quotation' : 'Order'}
              </h1>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.quotationNo}
                  onChange={e => handleInputChange('quotationNo', e.target.value)}
                  placeholder="Quotation No."
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSettings(!showSettings);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 设置面板 */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSettings ? 'max-h-[200px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
              <SettingsPanel 
                data={data}
                onChange={setData}
                activeTab={activeTab}
              />
            </div>

            {/* 客户信息区域 */}
            <CustomerInfoSection 
              data={data}
              onChange={setData}
              type={activeTab as 'quotation' | 'confirmation'}
            />

            {/* 商品表格 */}
            <div className="space-y-2">
              <ImportDataButton 
                onImport={(items) => {
                  setData({ ...data, items });
                }}
              />
              <ItemsTable 
                data={data}
                onChange={setData}
              />
            </div>

            {/* 总额显示区域 */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-3">
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
                <div className="flex items-center justify-end gap-2 mr-5">
                  <div className="text-sm text-[#86868B] dark:text-gray-400">Total Amount:</div>
                  <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {data.currency === 'USD' ? '$' : '¥'}
                    {(
                      data.items.reduce((sum, item) => sum + item.amount, 0) +
                      (data.otherFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes 部分重新设计 */}
            <div className="mt-8">
              {/* 银行信息区域 - 仅在订单确认页显示且showBank为true时显示 */}
              {activeTab === 'confirmation' && data.showBank && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Bank Information:
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm">
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
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={isGenerating}
                className={`${buttonClassName}
                  bg-[#007AFF] hover:bg-[#0063CC] dark:bg-[#0A84FF] dark:hover:bg-[#0070E0]
                  text-white font-medium
                  shadow-sm shadow-[#007AFF]/20 dark:shadow-[#0A84FF]/20
                  hover:shadow-lg hover:shadow-[#007AFF]/25 dark:hover:shadow-[#0A84FF]/25
                  active:scale-[0.98] active:shadow-inner
                  transform transition-all duration-200 ease-out
                  min-w-[180px] h-10
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
                disabled={isPreviewing}
                className={`${buttonClassName}
                  bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                  text-[#007AFF] dark:text-[#0A84FF] font-medium
                  border border-[#007AFF]/20 dark:border-[#0A84FF]/20
                  hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                  hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
                  active:bg-[#007AFF]/[0.16] dark:active:bg-[#0A84FF]/[0.16]
                  active:scale-[0.98]
                  transform transition-all duration-200 ease-out
                  min-w-[120px] h-10
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isPreviewing ? (
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
          </form>
        </div>
      </div>

      {/* PDF预览弹窗 */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
  );
}
