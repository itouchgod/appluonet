'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Download, ArrowLeft } from 'lucide-react';
import { generateQuotationPDF, generateOrderConfirmationPDF } from '@/utils/pdfGenerator';
import { TabButton } from '@/components/quotation/TabButton';
import { getDefaultNotes } from '@/utils/getDefaultNotes';
import { CustomerInfoSection } from '@/components/quotation/CustomerInfoSection';
import { ItemsTable } from '@/components/quotation/ItemsTable';
import { NotesSection } from '@/components/quotation/NotesSection';
import { SettingsPanel } from '@/components/quotation/SettingsPanel';
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

// 主按钮样式
const primaryButtonClassName = `${buttonClassName}
  bg-[#007AFF] hover:bg-[#0063CC] dark:bg-[#0A84FF] dark:hover:bg-[#0070E0]
  text-white
  shadow-lg shadow-[#007AFF]/25 dark:shadow-[#0A84FF]/25
  hover:shadow-xl hover:shadow-[#007AFF]/30 dark:hover:shadow-[#0A84FF]/30
  active:scale-[0.98]`;

export default function QuotationPage() {
  const [activeTab, setActiveTab] = useState<'quotation' | 'confirmation'>('quotation');
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState<QuotationData>({
    to: '',
    inquiryNo: '',
    quotationNo: '',
    date: new Date().toISOString().split('T')[0],
    from: 'Roger',
    currency: 'USD',
    paymentDate: new Date().toISOString().split('T')[0],
    items: [{
      lineNo: 1,
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
    bankInfo: '',
    showDescription: false,
    showRemarks: false,
    contractNo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'quotation') {
        await generateQuotationPDF(data);
      } else {
        await generateOrderConfirmationPDF(data);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // TODO: 添加错误提示
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Link>

        {/* 标签切换 */}
        <div className="flex justify-center gap-4 mt-6 mb-8">
          <TabButton 
            active={activeTab === 'quotation'}
            onClick={() => setActiveTab('quotation')}
          >
            报价单
          </TabButton>
          <TabButton 
            active={activeTab === 'confirmation'}
            onClick={() => setActiveTab('confirmation')}
          >
            订单确认
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
            {showSettings && (
              <SettingsPanel 
                data={data}
                onChange={setData}
              />
            )}

            {/* 客户信息区域 */}
            <CustomerInfoSection 
              data={data}
              onChange={setData}
              type={activeTab as 'quotation' | 'confirmation'}
            />

            {/* 商品表格 */}
            <ItemsTable 
              data={data}
              onChange={setData}
            />

            {/* Notes 区域 */}
            <NotesSection 
              data={data}
              onChange={setData}
            />

            {/* 生成按钮 */}
            <button
              type="submit"
              className={primaryButtonClassName}
            >
              <Download className="w-5 h-5" />
              Generate {activeTab === 'quotation' ? 'Quotation' : 'Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
