import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QuotationData } from '@/types/quotation';
import { loadImage } from '@/utils/pdfHelpers';

// 扩展jsPDF类型
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// 货币符号映射
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  CNY: '¥'
};

export const generateOrderConfirmationPDF = async (data: QuotationData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  }) as ExtendedJsPDF;

  // 添加字体
  doc.addFont('/fonts/NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
  doc.addFont('/fonts/NotoSansSC-Bold.ttf', 'NotoSansSC', 'bold');
  doc.setFont('NotoSansSC', 'normal');

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let startY = margin;

  try {
    // 添加表头
    try {
      const headerImage = await loadImage('/images/header-bilingual.png');
      if (headerImage) {
        const imgWidth = pageWidth - 30;
        const imgHeight = (headerImage.height * imgWidth) / headerImage.width;
        doc.addImage(headerImage, 'PNG', 15, 15, imgWidth, imgHeight);
        
        doc.setFontSize(14);
        doc.setFont('NotoSansSC', 'bold');
        const title = 'SALES CONFIRMATION';
        const titleWidth = doc.getTextWidth(title);
        const titleY = margin + imgHeight + 5;
        doc.text(title, (pageWidth - titleWidth) / 2, titleY);
        startY = titleY + 10;
      }
    } catch (error) {
      console.error('Error processing header:', error);
      doc.setFontSize(14);
      doc.setFont('NotoSansSC', 'bold');
      const title = 'SALES CONFIRMATION';
      const titleWidth = doc.getTextWidth(title);
      const titleY = margin + 5;
      doc.text(title, (pageWidth - titleWidth) / 2, titleY);
      startY = titleY + 10;
    }

    // 设置字体和样式
    doc.setFontSize(8);
    doc.setFont('NotoSansSC', 'normal');
    
    let currentY = startY;

    // 右上角信息区域
    const rightMargin = pageWidth - 20;
    const rightInfoY = startY;
    const colonX = rightMargin - 15;  // 冒号的固定位置
    
    doc.setFont('NotoSansSC', 'bold');
    
    // Contract No.
    doc.text('Contract No.', colonX - 2, rightInfoY, { align: 'right' });
    doc.text(':', colonX, rightInfoY);
    doc.text(data.contractNo || '', colonX + 3, rightInfoY);
    
    // Date
    doc.text('Date', colonX - 2, rightInfoY + 5, { align: 'right' });
    doc.text(':', colonX, rightInfoY + 5);
    doc.text(data.date || '', colonX + 3, rightInfoY + 5);

    // From
    doc.text('From', colonX - 2, rightInfoY + 10, { align: 'right' });
    doc.text(':', colonX, rightInfoY + 10);
    doc.text(data.from || '', colonX + 3, rightInfoY + 10);
    
    // Currency
    doc.text('Currency', colonX - 2, rightInfoY + 15, { align: 'right' });
    doc.text(':', colonX, rightInfoY + 15);
    doc.text(data.currency || '', colonX + 3, rightInfoY + 15);

    // 客户信息区域
    const leftMargin = 20;
    doc.text('To:', leftMargin, currentY);
    const toTextWidth = doc.getTextWidth('To: ');
    
    // 计算右侧信息区域的起始位置（从右边缘减去合适的宽度）
    const rightColumnWidth = 50; // 右侧信息列的宽度（mm）
    const rightColumnStart = pageWidth - rightColumnWidth - margin;

    // 计算左侧文本的最大宽度（考虑右侧信息区域）
    const maxWidth = rightColumnStart - leftMargin - toTextWidth - 5; // 5mm作为安全间距
    
    // 处理客户信息自动换行
    const toText = data.to.trim();
    if (toText) {
      const wrappedLines = doc.splitTextToSize(toText, maxWidth);
      wrappedLines.forEach((line: string) => {
        doc.text(line, leftMargin + toTextWidth, currentY);
        currentY += 3.5;
      });
    }

    // 添加 Order No.
    currentY += 2;
    doc.text('Order No.:', leftMargin, currentY);
    const orderNoX = leftMargin + doc.getTextWidth('Order No.: ');
    
    // 处理订单号自动换行，使用相同的最大宽度
    if (data.inquiryNo) {
      const wrappedOrderNo = doc.splitTextToSize(data.inquiryNo.trim(), maxWidth);
      wrappedOrderNo.forEach((line: string, index: number) => {
        doc.text(line, orderNoX, currentY + (index * 3.5));
      });
      currentY += (wrappedOrderNo.length - 1) * 3.5;
    }
   // 恢复普通字体
   doc.setFont('NotoSansSC', 'normal');
    // 添加确认文本，增加与上方Order No.的间距
    currentY += 8;  // 设置为5mm的间距
    doc.setFontSize(8);
    doc.text('We hereby confirm having sold to you the following goods on terms and condition as specified below:', leftMargin, currentY);

 

    // 确保表格与上方内容有足够间距
    currentY = Math.max(currentY, startY + 25);

    // 使用 autoTable
    doc.autoTable({
      startY: currentY + 3,
      head: [['No.', 'Part Name', ...(data.showDescription ? ['Description'] : []), 'Q\'TY', 'Unit', 'U/Price', 'Amount', ...(data.showRemarks ? ['Remarks'] : [])]],
      body: [
        // 常规商品行
        ...data.items.map((item, index) => [
          index + 1,
          item.partName,
          ...(data.showDescription ? [item.description || ''] : []),
          item.quantity,
          item.unit,
          `${currencySymbols[data.currency]}${item.unitPrice.toFixed(2)}`,
          `${currencySymbols[data.currency]}${item.amount.toFixed(2)}`,
          ...(data.showRemarks ? [item.remarks || ''] : [])
        ]),
        // Other Fees 行
        ...(data.otherFees || []).map(fee => [
          {
            content: fee.description,
            colSpan: data.showDescription ? 6 : 5,
            styles: { halign: 'left' }
          } as unknown as string,
          `${currencySymbols[data.currency]}${fee.amount.toFixed(2)}`,
          ...(data.showRemarks ? [''] : [])
        ])
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        font: 'NotoSansSC',
        valign: 'middle'
      },
      headStyles: {
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        font: 'NotoSansSC',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },  // No.
        1: { halign: 'center', cellWidth: 'auto' },  // Part Name
        ...(data.showDescription ? { 2: { halign: 'center', cellWidth: 'auto' } } : {}),  // Description
        [data.showDescription ? 3 : 2]: { halign: 'center', cellWidth: 15 },  // Q'TY
        [data.showDescription ? 4 : 3]: { halign: 'center', cellWidth: 15 },  // Unit
        [data.showDescription ? 5 : 4]: { halign: 'center', cellWidth: 20 },  // U/Price
        [data.showDescription ? 6 : 5]: { halign: 'center', cellWidth: 20 },  // Amount
        ...(data.showRemarks ? { [data.showDescription ? 7 : 6]: { halign: 'center', cellWidth: 'auto' } } : {})  // Remarks
      } as { [key: number]: { cellWidth: number | 'auto', halign: 'center' } },
      margin: { left: 15, right: 15 },
      tableWidth: pageWidth - 30  // 设置表格宽度为页面宽度减去左右边距
    });

    // 获取表格结束的Y坐标
    const finalY = doc.lastAutoTable.finalY || currentY;
    currentY = finalY + 10;

    // 添加总金额
    const itemsTotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    const feesTotal = (data.otherFees || []).reduce((sum, fee) => sum + fee.amount, 0);
    const total = itemsTotal + feesTotal;
    doc.setFontSize(10);
    doc.setFont('NotoSansSC', 'bold');
    const totalText = `Total Amount: ${currencySymbols[data.currency]}${total.toFixed(2)}`;
    doc.text(totalText, pageWidth - 20 - doc.getTextWidth(totalText), currentY);

    // 添加备注
    if (data.notes) {
      currentY += 8;  // 减小间距
      doc.setFontSize(9);
      doc.setFont('NotoSansSC', 'bold');
      doc.text('Notes:', leftMargin, currentY);
      currentY += 5;
      
      doc.setFont('NotoSansSC', 'normal');
      const numberWidth = doc.getTextWidth('10.');  // 仅使用序号的实际宽度，不添加额外间距
      const notesMaxWidth = pageWidth - leftMargin - numberWidth - 20; // Notes内容的最大宽度
      
      // 过滤掉空行，并重新计算序号
      const validNotes = data.notes.filter(line => line.trim() !== '');
      
      validNotes.forEach((line: string, index: number) => {
        // 添加编号
        doc.text(`${index + 1}.`, leftMargin, currentY);
        
        // 处理长文本自动换行
        const wrappedText = doc.splitTextToSize(line, notesMaxWidth);
        wrappedText.forEach((textLine: string, lineIndex: number) => {
          doc.text(textLine, leftMargin + numberWidth, currentY + (lineIndex * 5));
        });
        
        // 更新Y坐标到最后一行之后，统一使用5mm行间距
        currentY += wrappedText.length * 5;
      });
    }

    // 添加银行信息
    if (data.showBank) {
      currentY += 5;
      doc.setFontSize(9);
      doc.setFont('NotoSansSC', 'bold');
      doc.text('Bank Information:', leftMargin, currentY);
      currentY += 5;
      doc.setFont('NotoSansSC', 'normal');
      [
        'Bank Name: The Hongkong and Shanghai Banking Corporation Limited',
        'Swift code: HSBCHKHHHKH',
        'Bank address: Head Office 1 Queen\'s Road Central Hong Kong',
        'A/C No.: 801470337838',
        'Beneficiary: Luo & Company Co., Limited'
      ].forEach(line => {
        doc.text(line, leftMargin, currentY);
        currentY += 5;
      });
    }

    // 添加签名区域
    if (data.showStamp) {
      currentY += 5;  // 减小与上方内容的间距（从20mm改为10mm）
      
      try {
        const stampImage = await loadImage('/images/stamp-hongkong.png');
        if (!stampImage) {
          throw new Error('Failed to load stamp image: Image is null');
        }
        // 香港印章尺寸：73mm x 34mm
        doc.addImage(
          stampImage,
          'PNG',
          margin,  // 使用左边距
          currentY,
          73,
          34
        );
      } catch (error) {
        console.error('Error loading stamp:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    doc.save(`Sales-${data.quotationNo}-${data.date}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 