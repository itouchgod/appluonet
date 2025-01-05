import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QuotationData } from '@/types/quotation';
import { InvoiceTemplateConfig } from '@/types/invoice';

interface AutoTableConfig {
  startY?: number;
  head: (string | number)[][];
  body: (string | number)[][];
  theme?: string;
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    textColor?: number[];
    lineColor?: number[];
    lineWidth?: number;
  };
  headStyles?: {
    fillColor?: number[];
    textColor?: number[];
    fontStyle?: string;
  };
  columnStyles?: {
    [key: number]: {
      cellWidth?: number | 'auto';
      halign?: 'left' | 'center' | 'right';
    };
  };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableConfig) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PDFGeneratorData {
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
  templateConfig: InvoiceTemplateConfig;
}

// 货币符号映射
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  CNY: '¥'
};

// 生成报价单PDF
export const generateQuotationPDF = async (data: QuotationData) => {
  const doc = new jsPDF();
  
  // 使用 currencySymbols
  const currencySymbol = currencySymbols[data.currency];
  
  // 使用 autoTable
  doc.autoTable({
    head: [['No.', 'Part Name', 'Q\'TY', 'Unit', 'U/Price', 'Amount']],
    body: data.items.map((item, index) => [
      index + 1,
      item.partName,
      item.quantity,
      item.unit,
      `${currencySymbol}${item.unitPrice.toFixed(2)}`,
      `${currencySymbol}${item.amount.toFixed(2)}`
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2
    }
  });

  doc.save(`Quotation-${data.quotationNo}-${data.date}.pdf`);
};

// 生成订单确认PDF
export const generateOrderConfirmationPDF = async (data: QuotationData) => {
  const doc = new jsPDF();
  
  doc.autoTable({
    head: [['No.', 'Part Name', 'Q\'TY', 'Unit', 'U/Price', 'Amount']],
    body: data.items.map((item, index) => [
      index + 1,
      item.partName,
      item.quantity,
      item.unit,
      item.unitPrice.toFixed(2),
      item.amount.toFixed(2)
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2
    }
  });
  
  doc.save(`Order-${data.quotationNo}-${data.date}.pdf`);
};

// 生成发票PDF
export async function generateInvoicePDF(data: PDFGeneratorData) {
  // 根据模板配置选择不同的头部图片
  const getHeaderImage = () => {
    if (data.templateConfig.headerType === 'bilingual') {
      return '/images/header-bilingual.png';
    }
    return '/images/header-english.png';
  };

  // 根据模板配置选择不同的印章图片
  const getStampImage = () => {
    switch (data.templateConfig.stampType) {
      case 'shanghai':
        return '/images/stamp-shanghai.png';
      case 'hongkong':
        return '/images/stamp-hongkong.png';
      case 'none':
        return null;
      default:
        return null;
    }
  };

  // 根据模板配置设置发票类型标题
  const getInvoiceTitle = () => {
    switch (data.templateConfig.invoiceType) {
      case 'commercial':
        return 'COMMERCIAL INVOICE';
      case 'proforma':
        return 'PROFORMA INVOICE';
      default:
        return 'INVOICE';
    }
  };

  const doc = new jsPDF();
  
  // 添加头部图片
  const headerImage = getHeaderImage();
  try {
    const img = await loadImage(headerImage);
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (img.height * imgWidth) / img.width;
    doc.addImage(img, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // 调整后续内容的起始位置
    const contentStartY = imgHeight + 10;
    
    // 添加标题
    doc.setFontSize(20);
    doc.text('INVOICE', 105, contentStartY, { align: 'center' });
    
    // 添加基本信息
    doc.setFontSize(10);
    const leftMargin = 20;
    const rightMargin = doc.internal.pageSize.getWidth() - 20;

    // 左侧信息
    doc.text('To:', leftMargin, contentStartY + 20);
    doc.text(data.to.split('\n'), leftMargin, contentStartY + 25);
    doc.text('Order No.:', leftMargin, contentStartY + 45);

    // 右侧信息
    doc.text(`Invoice No. :`, rightMargin - 60, contentStartY + 20);
    doc.text(data.invoiceNo, rightMargin, contentStartY + 20, { align: 'right' });
    doc.text(`Date : ${data.date}`, rightMargin, contentStartY + 30, { align: 'right' });
    doc.text(`Currency : ${data.currency}`, rightMargin, contentStartY + 40, { align: 'right' });
    
    // 调整表格起始位置和样式
    doc.autoTable({
      startY: contentStartY + 60,
      head: [['No.', 'Description', 'Q\'TY', 'Unit', 'Unit Price', 'Amount']],
      body: data.items.map((item, index) => [
        index + 1,
        item.description,
        item.quantity,
        item.unit,
        Number(item.unitPrice).toFixed(2),
        Number(item.amount).toFixed(2)
      ]),
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 40, halign: 'right' },
        5: { cellWidth: 40, halign: 'right' }
      }
    });

    // 添加总金额
    const finalY = doc.lastAutoTable.finalY + 2;
    doc.text('Total Amount:', rightMargin - 60, finalY);
    doc.text(Number(getTotalAmount(data.items)).toFixed(2), rightMargin, finalY, { align: 'right' });

    // 添加大写金额
    doc.text('SAY TOTAL', leftMargin, finalY + 15);
    doc.setTextColor(0, 0, 255);
    doc.text('US DOLLARS', leftMargin + 45, finalY + 15);
    doc.setTextColor(0, 0, 0);
    doc.text(`${data.amountInWords.dollars} ONLY`, leftMargin + 90, finalY + 15);

    // 添加付款条款
    doc.text('Payment Terms:', leftMargin, finalY + 35);
    doc.text('1. ', leftMargin, finalY + 45);
    doc.text(`Full paid not later than ${data.paymentDate} by telegraphic transfer.`, leftMargin + 10, finalY + 45);
    doc.text('2. ', leftMargin, finalY + 55);
    doc.text(`Please state our invoice no. on your payment documents.`, leftMargin + 10, finalY + 55);

    // 添加印章
    const stampImage = getStampImage();
    if (stampImage) {
      try {
        const img = await loadImage(stampImage);
        doc.addImage(img, 'PNG', 150, finalY + 30, 40, 40);
      } catch (error) {
        console.error('Error loading stamp image:', error);
      }
    }
    
    // 保存文件
    doc.save(`${getInvoiceTitle()}-${data.invoiceNo}.pdf`);
  } catch (error) {
    console.error('Error loading header image:', error);
  }
}

// 辅助函数：加载图片
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 辅助函数：计算总金额
function getTotalAmount(items: PDFGeneratorData['items']) {
  return items.reduce((sum, item) => sum + item.amount, 0);
} 