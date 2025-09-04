'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Clipboard,
  Settings,
  History
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { CustomerSection } from '../components/CustomerSection';
import { ItemsTable } from '../components/ItemsTable';
import PDFPreviewModal from '@/components/history/PDFPreviewModal';
import { useInvoiceStore } from '../state/invoice.store';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { usePasteImport } from '../hooks/usePasteImport';
import { SettingsPanel } from '../components/SettingsPanel';
import { numberToWords } from '../utils/calculations';

// 货币符号和名称辅助函数
const getCurrencySymbol = (currency: 'USD' | 'CNY' | 'EUR') => {
  switch (currency) {
    case 'USD': return '$';
    case 'CNY': return '¥';
    case 'EUR': return '€';
    default: return '$';
  }
};

const getCurrencyName = (currency: 'USD' | 'CNY' | 'EUR') => {
  switch (currency) {
    case 'USD': return 'US DOLLARS ';
    case 'CNY': return 'CHINESE YUAN ';
    case 'EUR': return 'EUROS ';
    default: return 'US DOLLARS ';
  }
};
import { InvoiceActions } from '../components/InvoiceActions';
import { PaymentTermsSection } from '../components/PaymentTermsSection';
import { InvoiceInfoCompact } from '../components/InvoiceInfoCompact';
import { INPUT_CLASSNAMES } from '../constants/settings';
import { getTotalAmount } from '../utils/calculations';

/**
 * 发票主页面组件
 */
export const InvoicePage = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    data,
    isEditMode,
    editId,
    isSaving,
    saveSuccess,
    saveMessage,
    showSettings,
    showPreview,
    previewItem,
    customUnit,
    showUnitSuccess,
    focusedCell,
    updateData,
    saveInvoice,
    toggleSettings,
    togglePreview,
    setPreviewItem,
    addLineItem,
    addOtherFee
  } = useInvoiceStore();

  const { handleSubmit } = useInvoiceForm();
  const { handlePasteButtonClick } = usePasteImport();

  // 优化总金额计算
  const totalAmount = useMemo(() => {
    return getTotalAmount(data.items, data.otherFees);
  }, [data.items, data.otherFees]);

  // 组件挂载状态和初始化
  useEffect(() => {
    setMounted(true);
    
    // 检查是否有注入的发票数据（编辑或复制模式）
    const customWindow = window as any;
    if (customWindow.__INVOICE_DATA__) {
      // 初始化store数据
      const injectedData = customWindow.__INVOICE_DATA__;
      const isEditMode = customWindow.__EDIT_MODE__ || false;
      const editId = customWindow.__EDIT_ID__ || null;
      
      // 确保otherFees不为空数组（如果是编辑模式且有数据）
      if (isEditMode && injectedData.otherFees && injectedData.otherFees.length === 0) {
        injectedData.otherFees = [];
      }
      
      // 初始化store
      const { initialize } = useInvoiceStore.getState();
      initialize(injectedData, isEditMode, editId);
      
      // 清理注入的数据
      customWindow.__INVOICE_DATA__ = undefined;
      customWindow.__EDIT_MODE__ = false;
      customWindow.__EDIT_ID__ = undefined;
    }
  }, []);

  // 避免闪烁
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000] dark:text-gray-100 flex flex-col">
      <main className="flex-1">
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* 返回按钮 */}
          <Link 
            href={
              pathname?.includes('/edit/') ? '/history?tab=invoice' : 
              pathname?.includes('/copy/') ? '/history?tab=invoice' : 
              '/dashboard'
            } 
            className="inline-flex items-center text-gray-600 dark:text-[#98989D] hover:text-gray-900 dark:hover:text-[#F5F5F7]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          {/* 主卡片容器 */}
          <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-3xl shadow-lg dark:shadow-2xl shadow-black/5 dark:shadow-black/20 border border-black/5 dark:border-white/10 p-4 md:p-8 mt-8">
            <form onSubmit={handleSubmit}>
              {/* 标题和工具栏 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Invoice Generator
                  </h1>
                  <button
                    type="button"
                    onClick={handlePasteButtonClick}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 flex-shrink-0"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/history?tab=invoice"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 flex-shrink-0"
                    title="历史记录"
                  >
                    <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Link>
                  <button
                    type="button"
                    onClick={saveInvoice}
                    disabled={isSaving}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 flex-shrink-0 relative"
                    title={isEditMode ? '保存修改' : '保存新记录'}
                  >
                    {isSaving ? (
                      <svg className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Save className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                    {saveMessage && (
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white rounded-lg whitespace-nowrap ${
                        saveSuccess ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {saveMessage}
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSettings}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 设置面板 */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSettings ? 'opacity-100 px-4 sm:px-6 py-2 h-auto mb-8' : 'opacity-0 px-0 py-0 h-0'}`}>
                <SettingsPanel />
              </div>

              {/* 基础信息区域 */}
              <div className="mb-8">
                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                  <InvoiceInfoCompact 
                    data={data} 
                    onChange={updateData} 
                  />
                </div>
              </div>

              {/* 商品表格 */}
              <ItemsTable />

              {/* 添加行按钮和总金额 */}
              <div className="flex items-center justify-between gap-4 mt-6 mb-8">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-2 sm:px-3 h-7 rounded-lg whitespace-nowrap
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
                    onClick={addOtherFee}
                    className="px-2 sm:px-3 h-7 rounded-lg whitespace-nowrap
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
                
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2 relative">
                    <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                    <span className="text-xl font-semibold tracking-tight whitespace-nowrap">
                      {getCurrencySymbol(data.currency)}
                      {totalAmount.toFixed(2)}
                    </span>
                    {/* Total Amount 下划线 */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400 dark:bg-gray-500"></div>
                  </div>
                  {data.depositPercentage && data.depositPercentage > 0 && data.depositAmount && data.depositAmount > 0 && (
                    <>
                      {/* 总是显示定金 */}
                      <div className="flex items-center gap-2 relative">
                        <span className="text-sm font-medium text-gray-500">
                          {data.depositPercentage}% Deposit:
                        </span>
                        <span className="text-lg font-semibold tracking-tight whitespace-nowrap text-blue-600 dark:text-blue-400">
                          {getCurrencySymbol(data.currency)}
                          {data.depositAmount.toFixed(2)}
                        </span>
                        {/* Deposit 下划线 */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400 dark:bg-gray-500"></div>
                      </div>
                      
                      {/* 当显示Balance时，也显示尾款 */}
                      {data.showBalance && (
                        <div className="flex items-center gap-2 relative">
                          <span className="text-sm font-medium text-gray-500">
                            {100 - data.depositPercentage}% Balance:
                          </span>
                          <span className="text-lg font-semibold tracking-tight whitespace-nowrap text-green-600 dark:text-green-400">
                            {getCurrencySymbol(data.currency)}
                            {data.balanceAmount?.toFixed(2) || (totalAmount - data.depositAmount).toFixed(2)}
                          </span>
                          {/* Balance 下划线 */}
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400 dark:bg-gray-500"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 英文大写金额显示区域 */}
              <div className="mt-12 mb-4">
                <div className="inline text-sm">
                  {data.depositPercentage && data.depositPercentage > 0 && data.depositAmount && data.depositAmount > 0 ? (
                    data.showBalance ? (
                      // 显示尾款金额的大写
                      (() => {
                        const balanceAmount = data.balanceAmount || (totalAmount - data.depositAmount);
                        const balanceWords = numberToWords(balanceAmount);
                        return (
                          <>
                            <span className="text-gray-600 dark:text-gray-400">SAY {100 - data.depositPercentage}% Balance </span>
                            <span className="text-blue-500">
                              {getCurrencyName(data.currency)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{balanceWords.dollars}</span>
                            {balanceWords.hasDecimals && (
                              <>
                                <span className="text-red-500"> AND </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {balanceWords.cents}
                                </span>
                              </>
                            )}
                            {!balanceWords.hasDecimals && (
                              <span className="text-gray-600 dark:text-gray-400"> ONLY</span>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      // 显示定金金额的大写
                      (() => {
                        const depositWords = numberToWords(data.depositAmount);
                        return (
                          <>
                            <span className="text-gray-600 dark:text-gray-400">SAY {data.depositPercentage}% Deposit </span>
                            <span className="text-blue-500">
                              {getCurrencyName(data.currency)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{depositWords.dollars}</span>
                            {depositWords.hasDecimals && (
                              <>
                                <span className="text-red-500"> AND </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {depositWords.cents}
                                </span>
                              </>
                            )}
                            {!depositWords.hasDecimals && (
                              <span className="text-gray-600 dark:text-gray-400"> ONLY</span>
                            )}
                          </>
                        );
                      })()
                    )
                  ) : (
                    // 显示总金额的大写
                    <>
                      <span className="text-gray-600 dark:text-gray-400">SAY TOTAL </span>
                      <span className="text-blue-500">
                        {getCurrencyName(data.currency)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{data.amountInWords.dollars}</span>
                      {data.amountInWords.hasDecimals && (
                        <>
                          <span className="text-red-500"> AND </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {data.amountInWords.cents}
                          </span>
                        </>
                      )}
                      {!data.amountInWords.hasDecimals && (
                        <span className="text-gray-600 dark:text-gray-400"> ONLY</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 银行信息 */}
              {data.showBank && (
                <div className="mt-4 mb-4">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Bank Information:</h3>
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
              <div className={data.showBank ? "mb-4" : "mt-4 mb-4"}>
                <PaymentTermsSection 
                  data={data} 
                  onChange={updateData} 
                />
              </div>

              {/* 生成按钮 */}
              <InvoiceActions />
            </form>
          </div>
        </div>
      </main>

      {/* PDF预览弹窗 */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => {
          togglePreview();
          setPreviewItem(null);
        }}
        item={previewItem}
        itemType="invoice"
      />

      <Footer />
    </div>
  );
};
