import React from 'react';
import { PDFDocument } from '@/components/pdf/document';
import { pdf } from '@react-pdf/renderer';

export async function exportPDF(
  type: 'quote' | 'invoice',
  data: any,
  stamp?: string
) {
  try {
    // 生成 PDF blob
    const blob = await pdf(
      React.createElement(PDFDocument, {
        type,
        data,
        stamp
      })
    ).toBlob();

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type === 'quote' ? '报价单' : '发票'}_${data.number}.pdf`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF导出错误:', error);
    throw new Error('PDF导出失败');
  }
} 