'use client';

import { useState } from 'react';
import { QuotationData, LineItem, SettingsData } from '@/types/quote';
import { numberToChinese, generateQuoteNumber } from '@/lib/utils';

export function useQuotation() {
  const [quotationData, setQuotationData] = useState<QuotationData>({
    to: '',
    date: new Date().toISOString().split('T')[0],
    from: 'Roger',
    inquiryNo: '',
    quotationNo: '',
    contractNo: 'FL25',
    currency: 'USD',
    paymentDate: new Date().toISOString().split('T')[0],
    items: [
      {
        lineNo: 1,
        partName: '',
        description: '',
        quantity: 0,
        unit: 'pc',
        unitPrice: 0,
        amount: 0,
        remarks: ''
      }
    ],
    notes: [
      'Delivery time: 30 days',
      'Price based on EXW-Shanghai, Mill TC',
      'Delivery terms: as mentioned above, subj to unsold',
      'Payment term: 50% deposit, the balance paid before delivery',
      'Validity: 5 days'
    ],
    amountInWords: {
      dollars: 'ZERO',
      cents: '',
      hasDecimals: false
    },
    bankInfo: '',
    showDescription: false,
    showRemarks: false
  });

  const [settings, setSettings] = useState<SettingsData>({
    date: new Date().toISOString().split('T')[0],
    from: 'Roger',
    currency: 'USD',
    showDescription: false,
    showRemarks: false
  });

  const [editingUnitPriceIndex, setEditingUnitPriceIndex] = useState<number | null>(null);
  const [editingUnitPrice, setEditingUnitPrice] = useState<string>('');
  const [editingQuantityIndex, setEditingQuantityIndex] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string>('');

  const addLineItem = () => {
    setQuotationData(prev => ({
      ...prev,
      items: [...prev.items, {
        lineNo: prev.items.length + 1,
        partName: '',
        description: '',
        quantity: 0,
        unit: 'pc',
        unitPrice: 0,
        amount: 0,
        remarks: ''
      }]
    }));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: LineItem[keyof LineItem]) => {
    setQuotationData(prev => {
      const newItems = [...prev.items];
      const currentItem = { ...newItems[index] };
      
      (currentItem[field] as LineItem[keyof LineItem]) = value;
      
      if (field === 'quantity') {
        const quantity = Number(value);
        if (!currentItem.unit) {
          currentItem.unit = quantity <= 1 ? 'pc' : 'pcs';
        } else {
          const unitBase = currentItem.unit.replace(/s$/, '');
          currentItem.unit = quantity <= 1 ? unitBase : `${unitBase}s`;
        }
      }
      
      if (field === 'unit') {
        const unitBase = (value as string).replace(/s$/, '');
        currentItem.unit = currentItem.quantity <= 1 ? unitBase : `${unitBase}s`;
      }
      
      if (field === 'quantity' || field === 'unitPrice') {
        currentItem.amount = Number(currentItem.quantity) * Number(currentItem.unitPrice);
      }
      
      newItems[index] = currentItem;
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const getTotalAmount = () => {
    return quotationData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleInputChange = (field: string, value: string) => {
    setQuotationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSettings = (field: keyof SettingsData, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePDF = async () => {
    const totalAmount = getTotalAmount();
    const amountInWords = numberToChinese(totalAmount);
    return {
      ...quotationData,
      amountInWords,
      quotationNo: quotationData.quotationNo || generateQuoteNumber()
    };
  };

  return {
    quotationData,
    settings,
    editingUnitPriceIndex,
    editingUnitPrice,
    editingQuantityIndex,
    editingQuantity,
    setEditingUnitPriceIndex,
    setEditingUnitPrice,
    setEditingQuantityIndex,
    setEditingQuantity,
    addLineItem,
    updateLineItem,
    getTotalAmount,
    handleInputChange,
    updateSettings,
    generatePDF
  };
} 