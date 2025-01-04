import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuotationData } from '@/types/quotation';

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
  autoTable(doc, {
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
  
  // 设置表格样式
  autoTable(doc, {
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