import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QuotationData } from '@/types/quotation';
import { InvoiceTemplateConfig } from '@/types/invoice';

interface AutoTableConfig {
  startY?: number;
  head: (string | number)[][];
  body: (string | number)[][];
  theme?: string;
  styles?: {
    fontSize?: number;
    cellPadding?: number | { top: number; right: number; bottom: number; left: number };
    textColor?: number[];
    lineColor?: number[];
    lineWidth?: number;
    font?: string;
    valign?: 'top' | 'middle' | 'bottom';
  };
  headStyles?: {
    fontSize?: number;
    fillColor?: number[] | false;
    textColor?: number[];
    fontStyle?: string;
    font?: string;
    lineWidth?: number;
    lineColor?: number[];
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
  columnStyles?: {
    [key: number]: {
      cellWidth?: number | 'auto';
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
    };
  };
  didDrawCell?: (data: { 
    cell: { 
      x: number; 
      y: number; 
      width: number; 
      height: number; 
      styles: { lineWidth: number };
      raw: string | number | null;
    }; 
    doc: jsPDF 
  }) => void;
  willDrawCell?: (data: { cell: { styles: { lineWidth: number } } }) => void;
  didDrawPage?: (data: { doc: jsPDF; cursor: { x: number }; table: { width: number } }) => void;
  margin?: { left: number; right: number };
  tableWidth?: string | number;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableConfig) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PDFGeneratorData {
  invoiceNo: string;
  date: string;
  to: string;
  customerPO: string;
  items: Array<{
    lineNo: number;
    hsCode: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }>;
  bankInfo: string;
  paymentDate: string;
  showPaymentTerms?: boolean;
  additionalPaymentTerms?: string;
  amountInWords: {
    dollars: string;
    cents: string;
    hasDecimals: boolean;
  };
  remarks?: string;
  showHsCode: boolean;
  currency: 'USD' | 'CNY';
  templateConfig: InvoiceTemplateConfig;
}

// 货币符号映射
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  CNY: '¥'
};

// 生成报价单PDF
export const generateQuotationPDF = async (data: QuotationData) => {
  const doc = new jsPDF();
  
  // 使用 currencySymbols
  const currencySymbol = currencySymbols[data.currency];
  
  // 使用 autoTable
  doc.autoTable({
    head: [['No.', 'Part Name', 'Q\'TY', 'Unit', 'U/Price', 'Amount']],
    body: data.items.map((item, index) => [
      index + 1,
      item.partName,
      item.quantity,
      item.unit,
      `${currencySymbol}${item.unitPrice.toFixed(2)}`,
      `${currencySymbol}${item.amount.toFixed(2)}`
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2
    }
  });

  doc.save(`Quotation-${data.quotationNo}-${data.date}.pdf`);
};

// 生成订单确认PDF
export const generateOrderConfirmationPDF = async (data: QuotationData) => {
  const doc = new jsPDF();
  
  doc.autoTable({
    head: [['No.', 'Part Name', 'Q\'TY', 'Unit', 'U/Price', 'Amount']],
    body: data.items.map((item, index) => [
      index + 1,
      item.partName,
      item.quantity,
      item.unit,
      item.unitPrice.toFixed(2),
      item.amount.toFixed(2)
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2
    }
  });
  
  doc.save(`Order-${data.quotationNo}-${data.date}.pdf`);
};

// 生成发票PDF
export async function generateInvoicePDF(data: PDFGeneratorData, preview: boolean = false) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 添加字体
  doc.addFont('/fonts/NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
  doc.addFont('/fonts/NotoSansSC-Bold.ttf', 'NotoSansSC', 'bold');
  doc.setFont('NotoSansSC', 'normal');

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;  // 页面边距
  let startY = margin;  // 初始化起始位置

  try {
    // 添加表头
    if (data.templateConfig.headerType !== 'none') {
      try {
        const headerImage = await getHeaderImage(data.templateConfig.headerType);
        if (headerImage) {
          const imgWidth = pageWidth - 30;  // 左右各留15mm
          const imgHeight = (headerImage.height * imgWidth) / headerImage.width;
          doc.addImage(
            headerImage,
            'PNG',
            15,  // 左边距15mm
            15,  // 上边距15mm
            imgWidth,
            imgHeight
          );
          doc.setFontSize(14);
          doc.setFont('NotoSansSC', 'bold');
          const title = getInvoiceTitle(data);
          const titleWidth = doc.getTextWidth(title);
          const titleY = margin + imgHeight + 5;  // 标题Y坐标
          doc.text(title, (pageWidth - titleWidth) / 2, titleY);  // 标题位置
          startY = titleY;  // 主体内容从标题下方开始
        } else {
          console.warn('Header image not loaded, using default layout');
          // 使用默认布局
          doc.setFontSize(14);
          doc.setFont('NotoSansSC', 'bold');
          const title = getInvoiceTitle(data);
          const titleWidth = doc.getTextWidth(title);
          const titleY = margin + 5;  // 标题Y坐标
          doc.text(title, (pageWidth - titleWidth) / 2, titleY);  // 标题位置
          startY = titleY;  // 主体内容从标题下方开始
        }
      } catch (error) {
        console.error('Error processing header:', error);
        // 使用默认布局
        doc.setFontSize(14);
        doc.setFont('NotoSansSC', 'bold');
        const title = getInvoiceTitle(data);
        const titleWidth = doc.getTextWidth(title);
        const titleY = margin + 5;  // 标题Y坐标
        doc.text(title, (pageWidth - titleWidth) / 2, titleY);  // 标题位置
        startY = titleY;  // 主体内容从标题下方开始
      }
    } else {
      doc.setFontSize(14);
      doc.setFont('NotoSansSC', 'bold');
      const title = getInvoiceTitle(data);
      const titleWidth = doc.getTextWidth(title);
      const titleY = margin + 5;
      doc.text(title, (pageWidth - titleWidth) / 2, titleY);
      startY = titleY + 10;  // 增加标题下方间距
    }

    // 添加基本信息
    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(10);
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    let currentY = startY + 10;  // 修改这里，使用 startY 并增加额外间距

    // 设置字体和样式
    doc.setFontSize(8);  // 将抬头信息字号改为8
    doc.setFont('NotoSansSC', 'normal');
    
    // 客户信息区域
    const toLines = data.to.split('\n').filter(line => line.trim());
    doc.text('To:', leftMargin, currentY);
    const toTextWidth = doc.getTextWidth('To: ');
    
    // 第一行跟在To:后面
    if (toLines.length > 0) {
      doc.text(toLines[0], leftMargin + toTextWidth, currentY);
    }
    
    // 剩余行依次向下排列
    for (let i = 1; i < toLines.length; i++) {
      currentY += 5;
      doc.text(toLines[i], leftMargin + toTextWidth, currentY);
    }
    
    // Order No. 位置（在客户信息下方）
    currentY += 10;
    doc.text('Order No.:', leftMargin, currentY);
    const orderNoTextWidth = doc.getTextWidth('Order No.: ');
    
    // 处理 Order No. 内容的自动换行
    if (data.customerPO) {
      const maxWidth = pageWidth - (leftMargin + orderNoTextWidth + margin); // 计算最大可用宽度
      const orderNoLines = doc.splitTextToSize(data.customerPO, maxWidth);
      
      // 显示第一行
      doc.text(orderNoLines[0], leftMargin + orderNoTextWidth, currentY);
      
      // 显示剩余行（如果有的话）
      for (let i = 1; i < orderNoLines.length; i++) {
        currentY += 5;
        doc.text(orderNoLines[i], leftMargin + orderNoTextWidth, currentY);
      }
    }

    // 发票信息区域（右侧对齐）
    const initialY = startY + 10;  // 重置Y坐标到初始位置
    const colonX = rightMargin - 20;  // 设置冒号的固定X坐标位置
    
    // 定义标签和值的数组，方便统一处理
    const infoItems = [
      { 
        label: 'Invoice No.', 
        value: data.invoiceNo,
        isRed: true  // 标记需要显示为红色的项
      },
      { label: 'Date', value: data.date },
      { label: 'Currency', value: data.currency }
    ];

    // 绘制每一行
    infoItems.forEach((item, index) => {
      const y = initialY + (index * 5);
      // 标签右对齐到冒号位置
      doc.text(`${item.label}`, colonX, y, { align: 'right' });
      // 冒号固定位置
      doc.text(':', colonX + 1, y);
      
      // 如果需要显示红色，先改变文字颜色
      if (item.isRed) {
        doc.setTextColor(255, 0, 0);  // 设置为红色
      }
      
      // 值左对齐（从冒号后开始）
      doc.text(item.value, colonX + 3, y);
      
      // 恢复为黑色
      if (item.isRed) {
        doc.setTextColor(0, 0, 0);  // 恢复为黑色
      }
    });
    
    // 更新当前Y坐标，为表格预留间距
    currentY += 5;  // 将间距从10改为5

    // 调整表格起始位置和样式
    doc.autoTable({
      startY: currentY,
      head: [['No.', 'Description', 'Q\'TY', 'Unit', 'Unit Price', 'Amount']],
      body: data.items.map((item, index) => [
        index + 1,
        item.description,
        item.quantity,
        item.unit,
        `${data.currency === 'USD' ? '$' : '¥'}${Number(item.unitPrice).toFixed(2)}`,
        `${data.currency === 'USD' ? '$' : '¥'}${Number(item.amount).toFixed(2)}`
      ]),
      theme: 'plain',           // 使用plain主题，移除默认样式
      styles: {
        fontSize: 8,            // 将表格内容字号从9改为8
        cellPadding: 2,
        lineColor: [0, 0, 0],   // 边框
        lineWidth: 0.1,         // 细边框
        textColor: [0, 0, 0],    // 黑色文字
        font: 'NotoSansSC',  // 设置表格使用中文字体
        valign: 'middle'  // 添加垂直居中
      },
      headStyles: {
        fontSize: 8,            // 为表头也设置相同的字号
        fontStyle: 'bold',
        halign: 'center',
        font: 'NotoSansSC',
        valign: 'middle'  // 表头也垂直居中
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },      // No.列
        1: { halign: 'center', cellWidth: 'auto' },    // Description列
        2: { halign: 'center', cellWidth: 20 },      // Q'TY列
        3: { halign: 'center', cellWidth: 20 },      // Unit列
        4: { halign: 'center', cellWidth: 30 },       // Unit Price列
        5: { halign: 'center', cellWidth: 30 }        // Amount列
      },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto',
      didDrawCell: (data) => {
        // 确保所有单元格都有边框
        if (data.cell.raw === '') {
          data.cell.styles.lineWidth = 0.1;
        }
      }
    });

    // 获取表格结束位置
    const finalY = doc.lastAutoTable.finalY;
    
    // 设置字体和样式
    doc.setFontSize(8);  // 将总金额字号也改为8
    doc.setFont('NotoSansSC', 'normal');
    
    // 显示总金额（添加货币符号）
    const totalAmountLabel = 'Total Amount:';
    const totalAmountValue = `${data.currency === 'USD' ? '$' : '¥'}${Number(getTotalAmount(data.items)).toFixed(2)}`;
    
    // 使用表格的最后一列位置来对齐
    const valueX = pageWidth - margin;
    const labelX = valueX - 50;  // 固定标签位置，确保不会重叠
    
    // 绘制总金额行
    doc.text(totalAmountLabel, labelX, finalY + 8);
    doc.text(totalAmountValue, valueX, finalY + 8, { align: 'right' });
    
    // 分割为单词数组并组织成行
    const lines = doc.splitTextToSize(`SAY TOTAL US DOLLARS ${data.amountInWords.dollars}`, pageWidth - (margin * 2));
    
    // 设置较小的字体
    doc.setFontSize(8);
    
    // 绘制大写金额（调整与总金额的间距）
    lines.forEach((line: string, index: number) => {
      doc.text(line, margin, finalY + 15 + (index * 5));
    });

    // 计算银行信息的起始位置
    currentY = finalY + 15 + (lines.length * 5) + 8;  // 增加到8mm的间距
    
    // 显示银行信息
    if (data.bankInfo && data.bankInfo.trim()) {
      doc.text('Bank Information:', margin, currentY);
      const bankInfoLines = data.bankInfo.split('\n').filter(line => line.trim());
      currentY += 5;  // 标题与内容之间保持5mm间距
      
      // 处理每一行，如果太长则自动换行
      bankInfoLines.forEach(line => {
        const wrappedLines = doc.splitTextToSize(line.trim(), pageWidth - (margin * 2));
        wrappedLines.forEach((wrappedLine: string, index: number) => {
          doc.text(wrappedLine, margin, currentY + (index * 5));
        });
        currentY += wrappedLines.length * 5;
      });
    }

    // 计算 Payment Terms 的起始位置
    currentY += 8;  // 与上方内容保持8mm间距

    // 显示付款条款
    let totalTerms = 0;
    if (data.showPaymentTerms) totalTerms++;
    if (data.additionalPaymentTerms && data.additionalPaymentTerms.trim()) {
      totalTerms += data.additionalPaymentTerms.trim().split('\n').filter(line => line.trim()).length;
    }
    totalTerms++; // 加上发票号提示这一条

    if (totalTerms === 1) {
      // 单条付款条款的情况，使用单行格式
      doc.text('Payment Term:', margin, currentY);
      const prefixWidth = doc.getTextWidth('Payment Term: Please state our invoice no. "');
      doc.text('Please state our invoice no. "', margin + doc.getTextWidth('Payment Term: '), currentY);
      
      // 发票号显示为红色
      doc.setTextColor(255, 0, 0);
      doc.text(data.invoiceNo, margin + prefixWidth, currentY);
      
      // 恢复黑色
      doc.setTextColor(0, 0, 0);
      const invoiceNoWidth = doc.getTextWidth(data.invoiceNo);
      doc.text('" on your payment documents.', margin + prefixWidth + invoiceNoWidth, currentY);

      currentY += 15;  // 单条付款条款时，与印章之间的间距设为15mm
    } else {
      // 多条付款条款的情况，使用编号列表格式
      doc.text('Payment Terms:', margin, currentY);
      currentY += 5;  // 标题和第一条之间的间距改为5mm
      
      const termLeftMargin = 25;
      const termRightMargin = 15;
      const maxWidth = pageWidth - termLeftMargin - termRightMargin;
      const termSpacing = 5;  // 条款之间的固定间距
      let termCount = 1;
      
      // 只有当showPaymentTerms为true时才显示第一条付款条款
      if (data.showPaymentTerms) {
        // 绘制条款编号
        doc.text(`${termCount}.`, 20, currentY);
        
        // 绘制第一部分文本
        const term1Text = `Full paid not later than ${data.paymentDate} by telegraphic transfer.`;
        const term1Parts = term1Text.split(data.paymentDate);
        const firstPartWidth = doc.getTextWidth(term1Parts[0]);
        doc.text(term1Parts[0], termLeftMargin, currentY);
        
        // 日期显示为红色
        doc.setTextColor(255, 0, 0);
        doc.text(data.paymentDate, termLeftMargin + firstPartWidth, currentY);
        
        // 恢复黑色并绘制剩余部分
        doc.setTextColor(0, 0, 0);
        doc.text(term1Parts[1], termLeftMargin + firstPartWidth + doc.getTextWidth(data.paymentDate), currentY);
        
        currentY += termSpacing;
        termCount++;
      }

      // 如果有额外的付款条款，显示为中间条款
      if (data.additionalPaymentTerms && data.additionalPaymentTerms.trim()) {
        const additionalTerms = data.additionalPaymentTerms.trim().split('\n').filter(line => line.trim());
        for (const term of additionalTerms) {
          // 绘制条款编号
          doc.text(`${termCount}.`, 20, currentY);
          
          // 处理长文本自动换行
          const textLines = doc.splitTextToSize(term.trim(), maxWidth);
          textLines.forEach((line: string, index: number) => {
            const lineY = currentY + (index * 4); // 同一条款内的行间距为4mm
            doc.text(line, termLeftMargin, lineY);
          });
          
          // 移动到下一个条款的位置
          currentY += Math.max(4 * (textLines.length - 1) + termSpacing, termSpacing);
          termCount++;
        }
      }
      
      // 发票号提示作为最后一条
      doc.text(`${termCount}.`, 20, currentY);
      const lastTerm = `Please state our invoice no. "${data.invoiceNo}" on your payment documents.`;
      const term2Parts = lastTerm.split(`"${data.invoiceNo}"`);
      const secondPartWidth = doc.getTextWidth(term2Parts[0]);
      
      // 绘制第一部分
      doc.text(term2Parts[0], termLeftMargin, currentY);
      
      // 发票号显示为红色
      doc.setTextColor(255, 0, 0);
      doc.text(data.invoiceNo, termLeftMargin + secondPartWidth, currentY);
      
      // 恢复黑色并绘制最后部分
      doc.setTextColor(0, 0, 0);
      doc.text(term2Parts[1], termLeftMargin + secondPartWidth + doc.getTextWidth(data.invoiceNo), currentY);
      
      currentY += 15;  // 为印章预留空间
    }

    // 添加印章
    const stampImage = getStampImage(data.templateConfig.stampType);
    if (stampImage) {
      try {
        const stampImg = await loadImage(stampImage);
        // 根据印章类型设置不同的尺寸
        if (data.templateConfig.stampType === 'shanghai') {
          doc.addImage(stampImg, 'PNG', margin, currentY, 40, 40);  // 上海印章：40mm x 40mm
        } else {
          doc.addImage(stampImg, 'PNG', margin, currentY, 73, 34);  // 其他印章保持原有尺寸
        }
      } catch (error) {
        console.error('Error loading stamp image:', error);
      }
    }
    
    // 保存或预览文件
    if (preview) {
      return doc.output('bloburl');
    } else {
      doc.save(`${getInvoiceTitle(data)}-${data.invoiceNo}.pdf`);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// 辅助函数：获取表头图片
async function getHeaderImage(headerType: string): Promise<HTMLImageElement | null> {
  console.log('Loading header type:', headerType);
  try {
    let imagePath;
    switch (headerType) {
      case 'bilingual':
        imagePath = '/images/header-bilingual.png';
        break;
      case 'english':
        imagePath = '/images/header-english.png';
        break;
      default:
        console.log('No header type selected or invalid type:', headerType);
        return null;
    }
    console.log('Loading image from path:', imagePath);
    const image = await loadImage(imagePath);
    console.log('Image loaded successfully');
    return image;
  } catch (error) {
    console.error('Error loading header image:', error);
    return null;
  }
}

// 辅助函数：加载图片
async function loadImage(src: string): Promise<HTMLImageElement> {
  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image from blob`));
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    throw error;
  }
}

// 辅助函数：计算总金额
function getTotalAmount(items: PDFGeneratorData['items']) {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

// 辅助函数：获取发票标题
function getInvoiceTitle(data: PDFGeneratorData): string {
  switch (data.templateConfig.invoiceType) {
    case 'commercial':
      return 'COMMERCIAL INVOICE';
    case 'proforma':
      return 'PROFORMA INVOICE';
    default:
      return 'INVOICE';
  }
}

// 辅助函数：获取印章图片
function getStampImage(stampType: string): string | null {
  switch (stampType) {
    case 'shanghai':
      return '/images/stamp-shanghai.png';
    case 'hongkong':
      return '/images/stamp-hongkong.png';
    default:
      return null;
  }
} 