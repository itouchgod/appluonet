import type { LineItem } from '@/types/quotation';

// 计算金额
export const calculateAmount = (quantity: number, unitPrice: number) => {
  return Number((quantity * unitPrice).toFixed(2));
};

// 处理导入数据
export const handleImportData = (text: string): LineItem[] => {
  try {
    // 按行分割，过滤掉空行
    const rows = text.trim().split('\n').filter(row => row.trim() !== '');
    
    // 解析每一行数据
    return rows.map((row, index) => {
      // 使用制表符分割，保留空字符串
      const columns = row.split('\t');
      
      // 清理数组，移除空字符串但保留位置
      const cleanColumns = columns.map(col => col.trim());
      
      // 如果描述为空，返回 null
      if (!cleanColumns[0]) {
        return null;
      }

      // 解析数量和单价
      const quantity = parseFloat(cleanColumns[2]) || 0;
      const unitPrice = parseFloat(cleanColumns[4]) || 0;

      // 创建新的行项目
      const newItem: LineItem = {
        id: index + 1,
        partName: cleanColumns[0] || '',
        description: '',
        quantity: quantity,
        unit: cleanColumns[3] || 'pc',  // 直接使用原始单位
        unitPrice: unitPrice,
        amount: calculateAmount(quantity, unitPrice)
      };

      return newItem;
    }).filter((row): row is LineItem => row !== null);

  } catch (error) {
    console.error('Error importing data:', error);
    return [];
  }
}; 