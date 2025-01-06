import { createWorker } from 'tesseract.js';
import type { LineItem } from '@/types/quotation';

// 预处理图片
const preprocessImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 设置画布大小
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图片
        ctx.drawImage(img, 0, 0);

        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 增强对比度和亮度
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const threshold = 128;
          
          // 二值化处理
          const value = avg > threshold ? 255 : 0;
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// 解析识别出的文本
const parseText = (text: string): Partial<LineItem>[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const items: Partial<LineItem>[] = [];
  
  for (const line of lines) {
    // 尝试匹配数字
    const numbers = line.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length >= 2) {
      // 假设第一个数字是数量，第二个数字是单价
      const quantity = parseFloat(numbers[0]);
      const unitPrice = parseFloat(numbers[1]);
      
      // 提取商品名称（假设在数字之前的文本是商品名称）
      const partName = line.split(numbers[0])[0].trim();
      
      if (partName && !isNaN(quantity) && !isNaN(unitPrice)) {
        items.push({
          partName,
          quantity,
          unitPrice,
          amount: quantity * unitPrice,
          unit: 'pc' // 默认单位
        });
      }
    }
  }
  
  return items;
};

// 主函数：处理图片OCR
export const processImageOcr = async (file: File): Promise<Partial<LineItem>[]> => {
  try {
    // 预处理图片
    const processedImage = await preprocessImage(file);
    
    // 创建 Tesseract worker
    const worker = await createWorker('eng');
    
    // 识别文字
    const { data: { text } } = await worker.recognize(processedImage);
    
    // 终止 worker
    await worker.terminate();
    
    // 解析文本
    return parseText(text);
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}; 