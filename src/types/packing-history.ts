// Packing list history type definitions

interface PackingItem {
  id: number;
  serialNo: string;
  description: string;
  hsCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  netWeight: number;
  grossWeight: number;
  packageQty: number;
  dimensions: string;
  unit: string;
  groupId?: string; // 分组ID
}

// 分组接口
export interface PackingGroup {
  id: string;
  name: string;
  items: PackingItem[];
  totalNetWeight: number;
  totalGrossWeight: number;
  totalPackageQty: number;
  isCollapsed?: boolean;
}

export interface PackingData {
  orderNo: string;
  invoiceNo: string;
  date: string;
  consignee: {
    name: string;
  };
  markingNo: string;
  items: PackingItem[];
  groups?: PackingGroup[]; // 分组列表
  useGrouping?: boolean; // 是否启用分组模式
  currency: string;
  remarks: string;
  remarkOptions: {
    shipsSpares: boolean;
    customsPurpose: boolean;
  };
  showHsCode: boolean;
  showDimensions: boolean;
  showWeightAndPackage: boolean;
  showPrice: boolean;
  dimensionUnit: string;
  documentType: 'proforma' | 'packing' | 'both';
  templateConfig: {
    headerType: 'none' | 'bilingual' | 'english';
  };
  customUnits?: string[];
}

export interface PackingHistory {
  id: string;
  createdAt: string;
  updatedAt: string;
  consigneeName: string;
  invoiceNo: string;
  orderNo: string;
  totalAmount: number;
  currency: string;
  documentType: 'proforma' | 'packing' | 'both';
  data: PackingData;
}

export interface PackingHistoryFilters {
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  documentType?: 'proforma' | 'packing' | 'both' | 'all';
} 