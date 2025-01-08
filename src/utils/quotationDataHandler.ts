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
      
      // 如果名称为空，返回 null
      if (!cleanColumns[0]) {
        return null;
      }

      // 初始化变量
      let partName = '';
      let quantity = 0;
      let unit = 'lengths';  // 默认使用 lengths
      let unitPrice = 0;

      // 根据不同的格式处理数据
      // 格式1：名称 tab 描述 tab 数量 tab 单位 tab 单价
      // 格式2：名称 tab tab 数量 tab 单位 tab 单价
      // 格式3：名称 tab 数量 tab tab 单价
      // 格式4：名称 tab 数量 tab 单价

      partName = cleanColumns[0];  // 名称总是第一列

      // 查找非空值
      const nonEmptyColumns = cleanColumns.filter(col => col !== '');
      
      // 从后往前找数字，分别是单价和数量
      const numbers = nonEmptyColumns.filter(col => !isNaN(parseFloat(col)));
      if (numbers.length >= 2) {
        unitPrice = parseFloat(numbers[numbers.length - 1]);
        quantity = parseFloat(numbers[numbers.length - 2]);
      } else if (numbers.length === 1) {
        quantity = parseFloat(numbers[0]);
      }

      const amount = calculateAmount(quantity, unitPrice);

      // 创建新的行项目
      const newItem: LineItem = {
        id: index + 1,
        partName: partName,
        description: '',
        quantity: quantity,
        unit: unit,
        unitPrice: unitPrice,
        amount: amount
      };

      console.log('Parsed item:', {
        raw: cleanColumns,
        processed: newItem
      });

      return newItem;
    }).filter((row): row is LineItem => row !== null);

  } catch (error) {
    console.error('Error importing data:', error);
    return [];
  }
}; 