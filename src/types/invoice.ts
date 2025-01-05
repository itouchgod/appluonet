export interface InvoiceTemplateConfig {
  headerType: 'bilingual' | 'english' | 'none';
  invoiceType: 'invoice' | 'commercial' | 'proforma';
  stampType: 'shanghai' | 'hongkong' | 'none';
} 

export interface InvoiceData {
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
  showPaymentTerms?: boolean;
  additionalPaymentTerms?: string;
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
} 