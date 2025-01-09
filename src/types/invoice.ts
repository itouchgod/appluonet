export interface LineItem {
  lineNo: number;
  hsCode: string;
  partname: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface OtherFee {
  id: number;
  description: string;
  amount: number;
}

export interface InvoiceTemplateConfig {
  headerType: 'none' | 'bilingual' | 'english';
  invoiceType: 'invoice' | 'commercial' | 'proforma';
  stampType: 'none' | 'shanghai' | 'hongkong';
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  to: string;
  customerPO: string;
  items: LineItem[];
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
  otherFees?: OtherFee[];
} 