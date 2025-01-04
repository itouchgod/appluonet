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

export interface QuotationData {
  to: string;
  date: string;
  from: string;
  inquiryNo: string;
  quotationNo: string;
  contractNo?: string;
  currency: string;
  paymentDate: string;
  items: {
    lineNo: number;
    partName: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
    remarks?: string;
  }[];
  notes: string[];
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  bankInfo: string;
  showDescription: boolean;
  showRemarks: boolean;
  showBank: boolean;
} 