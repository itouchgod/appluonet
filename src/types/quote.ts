export interface LineItem {
  lineNo: number;
  partName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks?: string;
}

export interface AmountInWords {
  dollars: string;
  cents: string;
  hasDecimals: boolean;
}

export interface QuotationData {
  to: string;
  date: string;
  from: string;
  inquiryNo: string;
  quotationNo: string;
  contractNo?: string;
  currency: string;
  paymentDate: string;
  items: LineItem[];
  notes: string[];
  amountInWords: AmountInWords;
  bankInfo: string;
  showDescription: boolean;
  showRemarks: boolean;
  showPaymentTerms?: boolean;
  showHsCode?: boolean;
  remarks?: string;
}

export interface SettingsData {
  date: string;
  from: string;
  currency: string;
  showDescription: boolean;
  showRemarks: boolean;
  showHsCode?: boolean;
} 