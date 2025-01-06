import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QuotationData } from '@/types/quotation';
import { loadImage } from '@/utils/pdfHelpers';

// 货币符号映射
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  CNY: '¥'
};

// 生成报价单PDF
export const generateQuotationPDF = async (data: QuotationData, isPreview: boolean = false) => {
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
    try {
      const headerImage = await loadImage('/images/header-bilingual.png');
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
        const title = 'QUOTATION';
        const titleWidth = doc.getTextWidth(title);
        const titleY = margin + imgHeight + 5;  // 标题Y坐标
        doc.text(title, (pageWidth - titleWidth) / 2, titleY);  // 标题位置
        startY = titleY + 10;  // 主体内容从标题下方开始
      }
    } catch (error) {
      console.error('Error processing header:', error);
      // 使用默认布局
      doc.setFontSize(14);
      doc.setFont('NotoSansSC', 'bold');
      const title = 'QUOTATION';
      const titleWidth = doc.getTextWidth(title);
      const titleY = margin + 5;  // 标题Y坐标
      doc.text(title, (pageWidth - titleWidth) / 2, titleY);  // 标题位置
      startY = titleY + 10;  // 主体内容从标题下方开始
    }

    // 设置字体和样式
    doc.setFontSize(8);
    doc.setFont('NotoSansSC', 'normal');
    
    // 从 startY 开始绘制主体内容
    let currentY = startY;

    // 客户信息区域
    const leftMargin = 20;
    doc.text('To:', leftMargin, currentY);
    const toTextWidth = doc.getTextWidth('To: ');
    
    // 分行显示客户信息
    const toLines = data.to.split('\n').filter(line => line.trim());
    toLines.forEach(line => {
      doc.text(line, leftMargin + toTextWidth, currentY);
      currentY += 5;
    });

    // 使用 autoTable
    doc.autoTable({
      startY: currentY + 5,
      head: [['No.', 'Part Name', 'Q\'TY', 'Unit', 'U/Price', 'Amount']],
      body: data.items.map((item, index) => [
        index + 1,
        item.partName,
        item.quantity,
        item.unit,
        `${currencySymbols[data.currency]}${item.unitPrice.toFixed(2)}`,
        `${currencySymbols[data.currency]}${item.amount.toFixed(2)}`
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 2
      }
    });

    // 根据模式选择保存或返回预览URL
    if (isPreview) {
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      // 触发自定义事件，通知前端更新预览URL
      window.dispatchEvent(new CustomEvent('pdf-preview', { detail: pdfUrl }));
    } else {
      doc.save(`Quotation-${data.quotationNo}-${data.date}.pdf`);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 