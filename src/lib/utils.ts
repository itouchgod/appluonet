import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 

const CHINESE_NUMBERS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const CHINESE_UNITS = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
const DECIMAL_UNITS = ['角', '分'];

export function numberToChinese(num: number): {
  dollars: string;
  cents: string;
  hasDecimals: boolean;
} {
  const [integerPart, decimalPart = ''] = num.toFixed(2).split('.');
  const integer = parseInt(integerPart);
  
  if (integer === 0 && decimalPart === '00') {
    return {
      dollars: 'ZERO',
      cents: '',
      hasDecimals: false
    };
  }

  let result = '';
  const digits = integer.toString().split('').map(Number);
  let lastWasZero = false;

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const unit = CHINESE_UNITS[digits.length - 1 - i];

    if (digit === 0) {
      if (!lastWasZero && i !== digits.length - 1) {
        result += CHINESE_NUMBERS[0];
      }
      lastWasZero = true;
    } else {
      result += CHINESE_NUMBERS[digit] + unit;
      lastWasZero = false;
    }
  }

  // Handle decimal part
  let cents = '';
  if (decimalPart !== '00') {
    const [tenths, hundredths] = decimalPart.split('').map(Number);
    if (tenths !== 0) {
      cents += CHINESE_NUMBERS[tenths] + DECIMAL_UNITS[0];
    }
    if (hundredths !== 0) {
      cents += CHINESE_NUMBERS[hundredths] + DECIMAL_UNITS[1];
    }
  }

  return {
    dollars: result + '圆',
    cents,
    hasDecimals: decimalPart !== '00'
  };
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `Q${year}${month}${day}${random}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `O${year}${month}${day}${random}`;
} 