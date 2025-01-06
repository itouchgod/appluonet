import { jsPDF } from 'jspdf';
import type { QuotationData } from '@/types/quotation';

export function generateQuotationPdf(data: QuotationData, isPreview: boolean = false): jsPDF {
  const doc = new jsPDF();
  // PDF 生成逻辑
  if (isPreview) {
    // 预览模式的处理
    doc.setProperties({ title: 'Preview: Quotation' });
  }
  return doc;
} 