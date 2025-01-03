import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuotationData, LineItem } from '@/types/quote';
import { StyleSheet, Font } from "@react-pdf/renderer";

interface StyleDefinition {
  [key: string]: {
    [key: string]: string | number | undefined;
  };
}

interface AutoTableResult {
  finalY: number;
}

export const styles = StyleSheet.create<StyleDefinition>({
  page: {
    padding: 50,
  },
  logo: {
    width: 74,
    height: 66,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "SimSun",
  },
  header: {
    fontSize: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  table: {
    display: "table" as const,
    width: "auto",
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row" as const,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
  stamp: {
    width: 100,
    height: 100,
    position: "absolute" as const,
    right: 50,
    bottom: 150,
  },
});

// 加载字体
Font.register({
  family: 'SimSun',
  src: '/fonts/simsun.ttf'
});

// 基础 PDF 生成函数
export function generatePDF(data: QuotationData): jsPDF {
  const doc = new jsPDF();
  
  // 添加表头
  doc.setFontSize(20);
  doc.text('报价单', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  // 添加基本信息
  doc.setFontSize(10);
  doc.text(`报价单号：${data.quoteNo}`, 20, 40);
  doc.text(`日期：${data.date}`, 20, 50);
  doc.text(`客户名称：${data.customerName}`, 20, 60);
  doc.text(`联系人：${data.contact}`, 20, 70);
  doc.text(`电话：${data.phone}`, 20, 80);
  doc.text(`地址：${data.address}`, 20, 90);

  // 添加表格
  const tableData = data.items.map((item: LineItem) => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toString(),
    (item.quantity * item.unitPrice).toString()
  ]);

  autoTable(doc, {
    head: [['描述', '数量', '单价', '金额']],
    body: tableData,
    startY: 100,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    }
  });

  // 添加总计
  const result = (doc as unknown as { lastAutoTable: AutoTableResult }).lastAutoTable;
  const finalY = result.finalY || 150;
  doc.text(`总计：${data.total}`, 150, finalY + 10);

  // 添加备注
  if (data.notes) {
    doc.text(`备注：${data.notes}`, 20, finalY + 30);
  }

  return doc;
}

// 发票 PDF 生成函数
export async function generateInvoicePDF(data: QuotationData): Promise<jsPDF> {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('INVOICE', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // 添加基本信息
  doc.setFontSize(10);
  doc.text(`Invoice No.: ${data.invoiceNo}`, 20, 40);
  doc.text(`Date: ${data.date}`, 20, 50);
  doc.text(`To: ${data.customerName}`, 20, 60);
  
  // 添加表格
  const tableData = data.items.map((item: LineItem) => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toString(),
    (item.quantity * item.unitPrice).toString()
  ]);

  autoTable(doc, {
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    startY: 70,
    theme: 'grid'
  });

  return doc;
}

// 报价单 PDF 生成函数
export async function generateQuotationPDF(data: QuotationData): Promise<jsPDF> {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('QUOTATION', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // 添加基本信息
  doc.setFontSize(10);
  doc.text(`Quotation No.: ${data.quoteNo}`, 20, 40);
  doc.text(`Date: ${data.date}`, 20, 50);
  doc.text(`To: ${data.customerName}`, 20, 60);
  
  // 添加表格
  const tableData = data.items.map((item: LineItem) => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toString(),
    (item.quantity * item.unitPrice).toString()
  ]);

  autoTable(doc, {
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    startY: 70,
    theme: 'grid'
  });

  return doc;
}

// 订单确认 PDF 生成函数
export async function generateOrderConfirmationPDF(data: QuotationData): Promise<jsPDF> {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('ORDER CONFIRMATION', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // 添加基本信息
  doc.setFontSize(10);
  doc.text(`Order No.: ${data.quoteNo}`, 20, 40);
  doc.text(`Date: ${data.date}`, 20, 50);
  doc.text(`To: ${data.customerName}`, 20, 60);
  
  // 添加表格
  const tableData = data.items.map((item: LineItem) => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toString(),
    (item.quantity * item.unitPrice).toString()
  ]);

  autoTable(doc, {
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    startY: 70,
    theme: 'grid'
  });

  return doc;
} 