import { jsPDF } from 'jspdf';

export interface PDFGeneratorData {
  templateConfig: {
    headerType: string;
    stampType: string;
    invoiceType?: 'invoice' | 'commercial' | 'proforma';
  };
  items: {
    hsCode?: string;
    partname: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }[];
  otherFees?: {
    description: string;
    amount: number;
  }[];
  to: string;
  customerPO: string;
  invoiceNo: string;
  date: string;
  currency: string;
  showHsCode: boolean;
  showDescription: boolean;
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  showBank: boolean;
  bankInfo: string;
  showPaymentTerms: boolean;
  paymentDate: string;
  additionalPaymentTerms?: string;
  showInvoiceReminder: boolean;
}

export interface PdfType {
  doc: jsPDF;
  didDrawPage?: () => void;
} 