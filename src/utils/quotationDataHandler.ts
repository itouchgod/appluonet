import type { LineItem } from '@/types/quotation';

// 计算金额
export const calculateAmount = (quantity: number, unitPrice: number) => {
  return Number((quantity * unitPrice).toFixed(2));
};

// 默认单位列表
const defaultUnits = ['pc', 'set', 'length'];

// 处理单位
const processUnit = (unit: string): string => {
  if (!unit) return 'pc';
  
  // 转换为小写并移除前后空格
  const normalizedUnit = unit.trim().toLowerCase();
  
  // 处理复数形式
  const singularUnit = normalizedUnit.endsWith('s') ? normalizedUnit.slice(0, -1) : normalizedUnit;
  
  // 特殊处理 'pcs'
  if (normalizedUnit === 'pcs') return 'pc';
  
  // 检查是否是默认单位之一
  return defaultUnits.includes(singularUnit) ? singularUnit : 'pc';
};

// 处理导入数据
export const handleImportData = (text: string): LineItem[] => {
  try {
    // 按硬回车分割成行，但保留原始格式
    const rows = text.split(/\r\n|\r|\n/);
    const items: LineItem[] = [];
    
    for (const row of rows) {
      if (!row.trim()) continue;
      
      // 按 tab 分割单元格
      const cells = row.split('\t');
      
      // 检查是否是有效的数据行
      if (cells.length >= 3) {
        // 从后往前找到数量、单位和单价的位置
        let foundData = false;
        for (let i = cells.length - 1; i >= 2; i--) {
          const priceStr = cells[i]?.trim();
          const unitStr = cells[i - 1]?.trim();
          const qtyStr = cells[i - 2]?.trim();
          
          if (
            priceStr && 
            unitStr && 
            qtyStr && 
            /^\d+\.?\d*$/.test(priceStr) && 
            /^\d+$/.test(qtyStr)
          ) {
            // 找到了数量、单位和单价
            const quantity = parseInt(qtyStr);
            const unit = unitStr;
            const unitPrice = parseFloat(priceStr);
            
            // 前面的所有单元格都是 partName，保持原始格式
            const partName = cells.slice(0, i - 2).join('\t');
            
            items.push({
              id: items.length + 1,
              partName,
              description: '',
              quantity,
              unit: processUnit(unit),
              unitPrice,
              amount: calculateAmount(quantity, unitPrice)
            });
            
            foundData = true;
            break;
          }
        }
        
        if (!foundData && cells[0]) {
          // 如果没有找到数量和单价，但有内容
          items.push({
            id: items.length + 1,
            partName: cells[0],
            description: '',
            quantity: 0,
            unit: 'pc',
            unitPrice: 0,
            amount: 0
          });
        }
      } else if (cells[0]) {
        // 如果列数不够但有内容
        items.push({
          id: items.length + 1,
          partName: cells[0],
          description: '',
          quantity: 0,
          unit: 'pc',
          unitPrice: 0,
          amount: 0
        });
      }
    }
    
    return items;
  } catch (error) {
    console.error('Error importing data:', error);
    return [];
  }
}; 