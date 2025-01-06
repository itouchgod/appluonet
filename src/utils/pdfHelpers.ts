/// <reference types="node" />
/// <reference lib="dom" />

import { PDFGeneratorData } from '@/types/pdf';

export interface ImageLoader {
  (src: string): Promise<HTMLImageElement>;
}

export interface HeaderImageGetter {
  (headerType: string): Promise<HTMLImageElement | null>;
}

export interface StampImageGetter {
  (stampType: string): string | null;
}

export interface InvoiceTitleGetter {
  (data: PDFGeneratorData): string;
}

// 加载图片
export const loadImage: ImageLoader = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// 获取表头图片路径
export const getHeaderImage: HeaderImageGetter = async (headerType) => {
  switch (headerType) {
    case 'bilingual':
      return loadImage('/images/header-bilingual.png');
    case 'english':
      return loadImage('/images/header-english.png');
    case 'chinese':
      return loadImage('/images/header-chinese.png');
    default:
      return null;
  }
};

// 获取印章图片路径
export const getStampImage = (stampType: string) => {
  switch (stampType) {
    case 'shanghai':
      return '/images/stamp-shanghai.png';
    case 'hongkong':
      return '/images/stamp-hongkong.png';
    case 'english':
      return '/images/stamp-english.png';
    case 'chinese':
      return '/images/stamp-chinese.png';
    default:
      return null;
  }
};

// 获取发票标题
export const getInvoiceTitle: InvoiceTitleGetter = (data) => {
  switch (data.templateConfig.invoiceType) {
    case 'commercial':
      return data.currency === 'USD' ? 'COMMERCIAL INVOICE' : '商业发票';
    case 'proforma':
      return data.currency === 'USD' ? 'PROFORMA INVOICE' : '形式发票';
    default:
      return data.currency === 'USD' ? 'INVOICE' : '发票';
  }
};

// 计算总金额
export function getTotalAmount(items: PDFGeneratorData['items']) {
  return items.reduce((sum, item) => sum + item.amount, 0);
} 