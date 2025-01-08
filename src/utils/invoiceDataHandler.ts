import type { LineItem } from '@/types/invoice';

// 计算金额
export const calculateAmount = (quantity: number, unitPrice: number) => {
  return Number((quantity * unitPrice).toFixed(2));
};

// 处理导入数据
export const handleImportData = (text: string) => {
  try {
    // 按行分割，过滤掉空行
    const rows = text.trim().split('\n').filter(row => row.trim() !== '');
    
    // 解析每一行数据
    const parsedRows = rows.map((row, index) => {
      // 使用制表符分割，保留空字符串
      const columns = row.split('\t');
      
      // 清理数组，移除空字符串但保留位置
      const cleanColumns = columns.map(col => col.trim());
      
      // 如果描述为空，返回 null
      if (!cleanColumns[0]) {
        return null;
      }

      // 解析数量和单价
      // 由于报价页面多了一列 Part Name，所以这里的列索引需要调整
      // 报价页：Part Name(0) | Description(1) | Q'TY(2) | Unit(3) | U/Price(4)
      const quantity = parseFloat(cleanColumns[2]) || 0;
      const unitPrice = parseFloat(cleanColumns[4]) || 0;

      // 处理单位
      // 从粘贴数据中获取单位（去掉可能的复数形式）
      const pastedUnit = (cleanColumns[3] || '').toLowerCase().replace(/s$/, '');
      // 检查是否是预定义的单位之一
      const defaultUnits = ['pc', 'set', 'length'];
      const baseUnit = defaultUnits.includes(pastedUnit) ? pastedUnit : 'pc';
      // 根据数量决定是否使用复数形式
      const unit = quantity > 1 ? `${baseUnit}s` : baseUnit;

      // 创建新的行项目
      const newItem: LineItem = {
        lineNo: index + 1,
        hsCode: '',
        description: cleanColumns[0] || '',
        quantity: quantity,
        unit: unit,
        unitPrice: unitPrice,
        amount: calculateAmount(quantity, unitPrice)
      };

      return newItem;
    }).filter((row): row is LineItem => row !== null);

    return parsedRows;
  } catch (error) {
    console.error('Error importing data:', error);
    return [];
  }
}; 