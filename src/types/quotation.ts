export interface LineItem {
  id: number;
  partName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks?: string;
}

export interface OtherFee {
  id: number;
  description: string;
  amount: number;
  remarks?: string;
}

export interface QuotationData {
  to: string;
  inquiryNo: string;
  quotationNo: string;
  date: string;
  from: string;
  currency: 'USD' | 'EUR' | 'CNY';
  paymentDate: string;
  items: LineItem[];
  notes: string[];
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  showDescription: boolean;
  showRemarks: boolean;
  showBank: boolean;
  showStamp: boolean;
  contractNo: string;
  otherFees?: OtherFee[];
  customUnits?: string[];
} 