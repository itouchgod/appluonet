import { InvoiceTemplateConfig } from './invoice';

export interface AutoTableConfig {
  startY?: number;
  head: (string | number)[][];
  body: (string | number)[][];
  theme?: string;
  styles?: {
    fontSize?: number;
    cellPadding?: number | { top: number; right: number; bottom: number; left: number };
    textColor?: number[];
    lineColor?: number[];
    lineWidth?: number;
    font?: string;
    valign?: 'top' | 'middle' | 'bottom';
  };
  headStyles?: {
    fontSize?: number;
    fillColor?: number[] | false;
    textColor?: number[];
    fontStyle?: string;
    font?: string;
    lineWidth?: number;
    lineColor?: number[];
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
  columnStyles?: {
    [key: number]: {
      cellWidth?: number | 'auto';
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
    };
  };
  didDrawCell?: (data: { 
    cell: { 
      x: number; 
      y: number; 
      width: number; 
      height: number; 
      styles: { lineWidth: number };
      raw: string | number | null;
    }; 
    doc: jsPDF 
  }) => void;
  willDrawCell?: (data: { cell: { styles: { lineWidth: number } } }) => void;
  didDrawPage?: (data: { doc: jsPDF; cursor: { x: number }; table: { width: number } }) => void;
  margin?: { left: number; right: number };
  tableWidth?: string | number;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableConfig) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface PDFGeneratorData {
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
  showPaymentTerms: boolean;
  additionalPaymentTerms: string;
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  remarks?: string;
  showHsCode: boolean;
  showBank: boolean;
  showInvoiceReminder: boolean;
  currency: 'USD' | 'CNY';
  templateConfig: InvoiceTemplateConfig;
  otherFees?: Array<{
    id: number;
    description: string;
    amount: number;
  }>;
} 