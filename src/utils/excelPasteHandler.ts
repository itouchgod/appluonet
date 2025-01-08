/**
 * 解析Excel粘贴的文本数据
 * 处理规则：
 * 1. 普通单元格用制表符（\t）分隔
 * 2. 引号内的所有内容（包括换行符）被视为同一个单元格的内容
 * 3. 引号仅作为边界标识，不作为内容的一部分
 */
export const parseExcelData = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let lastChar = '';
  
  // 遍历每个字符
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // 处理引号
    if (char === '"' && lastChar !== '\\') {
      inQuotes = !inQuotes;
      continue;
    }
    
    // 处理制表符（仅在引号外有效）
    if (char === '\t' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      continue;
    }
    
    // 处理换行符
    if ((char === '\n' || char === '\r') && !inQuotes) {
      // 在引号外，换行符标志着新行的开始
      if (char === '\r' && text[i + 1] === '\n') {
        i++; // 跳过 \r\n 中的 \n
      }
      
      // 保存当前单元格和行
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell.trim())) {
          rows.push([...currentRow]);
        }
      }
      
      // 重置当前行和单元格
      currentRow = [];
      currentCell = '';
    } else {
      // 收集单元格内容
      currentCell += char;
    }
    
    lastChar = char;
  }
  
  // 处理最后一个单元格和行
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.trim())) {
      rows.push(currentRow);
    }
  }
  
  return rows;
};

/**
 * 将Excel数据转换为行项目数据
 */
export interface ExcelLineItem {
  id: number;
  partName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export const convertExcelToLineItems = (rows: string[][]): ExcelLineItem[] => {
  const items: ExcelLineItem[] = [];
  let currentPartName: string[] = [];
  let currentItem: Partial<ExcelLineItem> | null = null;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // 跳过空行
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue;
    }
    
    // 检查是否是数据行（包含数量、单位和单价）
    const quantity = parseNumberCell(row[3]);
    const unit = row[4]?.trim();
    const unitPrice = parseNumberCell(row[5]);
    
    if (quantity !== null && unit && unitPrice !== null) {
      // 这是一个有效的数据行，创建新的商品项
      if (currentItem) {
        // 如果有未完成的项目，先添加到列表中
        items.push({
          ...currentItem,
          id: items.length + 1,
          partName: currentPartName.join('\n'),
          description: '',
          quantity,
          unit,
          unitPrice,
          amount: quantity * unitPrice
        } as ExcelLineItem);
        
        // 重置当前状态
        currentPartName = [];
        currentItem = null;
      } else {
        // 直接创建新项目
        items.push({
          id: items.length + 1,
          partName: currentPartName.join('\n'),
          description: '',
          quantity,
          unit,
          unitPrice,
          amount: quantity * unitPrice
        });
        // 重置当前商品名称
        currentPartName = [];
      }
    } else if (row[0]?.trim()) {
      // 如果第一列有内容但不是数据行，收集到当前商品名称
      currentPartName.push(row[0].trim());
      // 标记有未完成的项目
      if (!currentItem) {
        currentItem = {};
      }
    }
  }
  
  // 处理最后一个未完成的项目（如果有的话）
  if (currentItem && currentPartName.length > 0) {
    items.push({
      ...currentItem,
      id: items.length + 1,
      partName: currentPartName.join('\n'),
      description: '',
      quantity: 0,
      unit: 'pc',
      unitPrice: 0,
      amount: 0
    } as ExcelLineItem);
  }
  
  return items;
};

/**
 * 解析单个Excel单元格的内容
 */
export const parseExcelCell = (text: string): string => {
  if (!text) return '';
  // 移除开头和结尾的引号
  return text.replace(/^"|"$/g, '').trim();
};

/**
 * 解析数字单元格
 */
export const parseNumberCell = (text: string): number | null => {
  if (!text) return null;
  // 移除引号并解析数字
  const value = parseFloat(text.replace(/^"|"$/g, '').trim());
  return isNaN(value) ? null : value;
}; 