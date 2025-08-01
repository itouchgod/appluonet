'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Download, ExternalLink, Smartphone } from 'lucide-react';
import { generateQuotationPDF } from '@/utils/quotationPdfGenerator';
import { generateOrderConfirmationPDF } from '@/utils/orderConfirmationPdfGenerator';
import { generateInvoicePDF } from '@/utils/invoicePdfGenerator';
import { generatePurchaseOrderPDF } from '@/utils/purchasePdfGenerator';
import { generatePackingListPDF } from '@/utils/packingPdfGenerator';
import { supportsPDFPreview, getDeviceInfo, handlePDFPreview, openPDFInNewTab } from '@/utils/pdfHelpers';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  itemType: 'quotation' | 'confirmation' | 'invoice' | 'purchase' | 'packing';
}

export default function PDFPreviewModal({ isOpen, onClose, item, itemType }: PDFPreviewModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showDownloadFallback, setShowDownloadFallback] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [previewInfo, setPreviewInfo] = useState<any>(null);

  // 在客户端环境下获取设备信息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const info = getDeviceInfo();
        setDeviceInfo(info);
        
        if (info.isAndroid || !info.canPreviewPDF) {
          setShowDownloadFallback(true);
        }
      } catch (error) {
        console.warn('获取设备信息失败:', error);
        setShowDownloadFallback(true);
      }
    }
  }, []);

  // 更新预览信息
  useEffect(() => {
    if (typeof window !== 'undefined' && deviceInfo) {
      try {
        const info = handlePDFPreview(pdfPreviewUrl, {
          autoDetectDevice: true,
          forceAndroidFallback: true
        });
        setPreviewInfo(info);
      } catch (error) {
        console.warn('处理PDF预览失败:', error);
        setShowDownloadFallback(true);
      }
    }
  }, [pdfPreviewUrl, deviceInfo]);

  // 生成PDF预览
  const generatePdfPreview = async () => {
    if (!item) return;

    setIsGeneratingPdf(true);
    setPdfPreviewUrl(null);
    
    try {
      let pdfUrl: string | null = null;

      // 根据记录类型生成对应的PDF
      if (itemType === 'quotation') {
        const pdfBlob = await generateQuotationPDF(item.data, true);
        pdfUrl = URL.createObjectURL(pdfBlob);
      } else if (itemType === 'confirmation') {
        const pdfBlob = await generateOrderConfirmationPDF(item.data, true);
        pdfUrl = URL.createObjectURL(pdfBlob);
      } else if (itemType === 'invoice') {
        pdfUrl = await generateInvoicePDF(item.data, true);
      } else if (itemType === 'purchase') {
        const pdfBlob = await generatePurchaseOrderPDF(item.data, true);
        pdfUrl = URL.createObjectURL(pdfBlob);
      } else if (itemType === 'packing') {
        pdfUrl = await generatePackingListPDF(item.data, true);
      }

      if (pdfUrl) {
        setPdfPreviewUrl(pdfUrl);
        // 安卓设备不尝试iframe预览，直接显示fallback
        if (deviceInfo.isAndroid) {
          setShowDownloadFallback(true);
        }
      }
    } catch (error) {
      setShowDownloadFallback(true);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 下载PDF
  const downloadPDF = async () => {
    if (!item) return;

    setIsGeneratingPdf(true);
    try {
      // 根据记录类型生成对应的PDF并下载
      if (itemType === 'quotation') {
        await generateQuotationPDF(item.data, false);
      } else if (itemType === 'confirmation') {
        await generateOrderConfirmationPDF(item.data, false);
      } else if (itemType === 'invoice') {
        await generateInvoicePDF(item.data, false);
      } else if (itemType === 'purchase') {
        await generatePurchaseOrderPDF(item.data, false);
      } else if (itemType === 'packing') {
        await generatePackingListPDF(item.data, false);
      }
    } catch (error) {
      alert('PDF下载失败，请重试');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 在新窗口打开PDF
  const openInNewTab = () => {
    if (pdfPreviewUrl) {
      openPDFInNewTab(pdfPreviewUrl);
    }
  };

  // 获取预览标题
  const getPreviewTitle = () => {
    switch (itemType) {
      case 'quotation':
        return '报价单预览';
      case 'confirmation':
        return '订单确认预览';
      case 'invoice':
        return '发票预览';
      case 'purchase':
        return '采购单预览';
      case 'packing':
        return '装箱单预览';
      default:
        return 'PDF预览';
    }
  };

  // 清理PDF预览URL
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // 当模态框打开时生成PDF
  useEffect(() => {
    if (isOpen && item) {
      generatePdfPreview();
    }
  }, [isOpen, item, itemType]);

  if (!isOpen) return null;

  // 安卓设备专用简化界面
  if (deviceInfo?.isAndroid) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* 简化的头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {getPreviewTitle()}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 内容区域 */}
          <div className="p-6">
            {isGeneratingPdf ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">正在生成PDF...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  PDF已准备就绪
                </h4>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  选择您的查看方式
                </p>
                
                {/* 主操作按钮 */}
                <div className="space-y-3">
                  {/* 推荐操作 - 新窗口打开 */}
                  {pdfPreviewUrl && deviceInfo?.browser?.name === 'Chrome' && (
                    <button
                      onClick={openInNewTab}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>浏览器中查看</span>
                      <span className="px-2 py-0.5 bg-blue-500 text-xs rounded-full">推荐</span>
                    </button>
                  )}
                  
                  {/* 下载按钮 */}
                  <button
                    onClick={downloadPDF}
                    disabled={isGeneratingPdf}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-colors shadow-md ${
                      deviceInfo?.browser?.name === 'Chrome' 
                        ? 'border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700' 
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>下载到手机</span>
                        {deviceInfo?.browser?.name !== 'Chrome' && (
                          <span className="px-2 py-0.5 bg-green-500 text-xs rounded-full">推荐</span>
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* 备用选项 - 只有在Chrome中才显示 */}
                  {pdfPreviewUrl && deviceInfo?.browser?.name === 'Chrome' && (
                    <button
                      onClick={downloadPDF}
                      disabled={isGeneratingPdf}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>或者下载到手机</span>
                    </button>
                  )}
                </div>
                
                {/* 简化的提示信息 */}
                {deviceInfo?.browser?.name !== 'Chrome' && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <span>💡</span>
                      <span>建议使用Chrome浏览器以获得更好的预览体验</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 桌面端界面保持原样
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getPreviewTitle()}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* 新窗口打开按钮 */}
            {pdfPreviewUrl && (
              <button
                onClick={openInNewTab}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="在新窗口打开"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
            
            {/* 下载按钮 */}
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPdf}
              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="下载PDF"
            >
              <Download className={`w-5 h-5 ${isGeneratingPdf ? 'animate-pulse' : ''}`} />
            </button>
            
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-b-xl flex items-center justify-center border border-gray-200 dark:border-gray-600" style={{padding:0}}>
          {isGeneratingPdf ? (
            <div className="flex flex-col items-center space-y-4 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">正在生成PDF预览...</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">请稍候</p>
              </div>
            </div>
          ) : showDownloadFallback ? (
            <div className="text-center py-12 px-6 max-w-lg mx-auto">
              <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500 opacity-70" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                PDF预览
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {previewInfo.message || '选择您偏好的PDF查看方式'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* 推荐操作按钮 */}
                {deviceInfo?.recommendedAction === 'newTab' && pdfPreviewUrl && (
                  <button
                    onClick={openInNewTab}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>新窗口打开 (推荐)</span>
                  </button>
                )}
                
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPdf}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    deviceInfo?.recommendedAction === 'download' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>下载PDF {deviceInfo?.recommendedAction === 'download' ? '(推荐)' : ''}</span>
                    </>
                  )}
                </button>
                
                {deviceInfo?.recommendedAction !== 'newTab' && pdfPreviewUrl && (
                  <button
                    onClick={openInNewTab}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>新窗口打开</span>
                  </button>
                )}
              </div>
            </div>
          ) : pdfPreviewUrl ? (
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-[80vh] border-0 rounded-b-xl"
              title="PDF预览"
              style={{margin:0, padding:0}}
              onError={() => setShowDownloadFallback(true)}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">无法生成PDF预览</p>
              <p className="text-sm">请检查记录数据是否完整</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 