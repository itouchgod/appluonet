'use client';

import { useState } from 'react';
import { Download, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { generateQuotationPDF, generateOrderConfirmationPDF } from '@/lib/pdf';
import { useQuotation } from '@/hooks/useQuotation';

interface DocumentHeader {
  title: string;
  customerLabel: string;
  numberLabel: string;
  numberPlaceholder: string;
  showContractNo?: boolean;
}

const documentTypes: { [key: string]: DocumentHeader } = {
  quotation: {
    title: 'Generate Quotation',
    customerLabel: 'Customer Name',
    numberLabel: 'Quotation No.',
    numberPlaceholder: 'Quotation No.',
    showContractNo: false
  },
  confirmation: {
    title: 'Generate Order',
    customerLabel: 'Customer Name',
    numberLabel: 'Quotation No.',
    numberPlaceholder: 'Quotation No.',
    showContractNo: true
  }
};

export default function QuotationPage() {
  const [activeTab, setActiveTab] = useState('quotation');
  const [showSettings, setShowSettings] = useState(false);
  const {
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
  } = useQuotation();

  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    CNY: '¥'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedData = await generatePDF(activeTab as 'quotation' | 'confirmation');
      switch (activeTab) {
        case 'quotation':
          await generateQuotationPDF(updatedData, activeTab);
          break;
        case 'confirmation':
          await generateOrderConfirmationPDF(updatedData);
          break;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const DocumentHeaderForm = ({ type }: { type: 'quotation' | 'confirmation' }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <textarea
          defaultValue={quotationData.to}
          onBlur={e => handleInputChange('to', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
            border border-gray-200/30 dark:border-[#2c2c2e]/50
            focus:outline-none focus:ring-2 focus:ring-blue-500/40
            text-[15px] leading-relaxed min-h-[60px] resize"
          placeholder="Enter customer name and address"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Inquiry No.</label>
        <input
          type="text"
          defaultValue={quotationData.inquiryNo}
          onBlur={e => handleInputChange('inquiryNo', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
            border border-gray-200/30 dark:border-[#2c2c2e]/50
            focus:outline-none focus:ring-2 focus:ring-blue-500/40
            text-[15px] leading-relaxed"
          placeholder="Inquiry No."
        />
      </div>
      {type === 'confirmation' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Contract No.</label>
          <input
            type="text"
            defaultValue={quotationData.contractNo}
            onBlur={e => handleInputChange('contractNo', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
              border border-gray-200/30 dark:border-[#2c2c2e]/50
              focus:outline-none focus:ring-2 focus:ring-blue-500/40
              text-[15px] leading-relaxed"
            placeholder="Contract No."
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <main className="flex-1">
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
          <Link 
            href="/dashboard" 
            className="group inline-flex items-center px-5 py-2.5 rounded-2xl
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl
              border border-gray-200/30 dark:border-gray-700/30
              text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100
              transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
              hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="flex justify-center gap-3 mb-6 mt-6">
            {['quotation', 'confirmation'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-sm font-medium transition-all duration-300
                  ${activeTab === tab 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]' 
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-md'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl
            shadow-2xl border border-gray-200/30 dark:border-[#2c2c2e]/50
            rounded-[2.5rem] p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold flex-1">
                  {documentTypes[activeTab].title}
                </h2>
                
                <div className="w-48">
                  <input
                    type="text"
                    defaultValue={quotationData.quotationNo}
                    onBlur={e => handleInputChange('quotationNo', e.target.value)}
                    placeholder={documentTypes[activeTab].numberPlaceholder}
                    className="w-full px-4 py-2 rounded-xl 
                      bg-white/50 dark:bg-gray-900/50
                      border border-gray-200/50 dark:border-gray-700/50
                      hover:border-gray-300 dark:hover:border-gray-600
                      focus:ring-2 focus:ring-blue-500/30
                      text-sm"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowSettings(prev => !prev)}
                  className="inline-flex items-center justify-center p-2 
                    rounded-xl border border-gray-200/50 dark:border-gray-700/50
                    bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg
                    text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100
                    transition-all hover:shadow-lg hover:scale-[1.02]
                    group"
                  title="Settings"
                >
                  <Settings className="h-5 w-5 transition-transform group-hover:rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className={`overflow-hidden transition-all duration-300 ease-in-out
                  ${showSettings ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-blue-50/80 dark:bg-blue-900/10 backdrop-blur-xl
                    border border-blue-200/50 dark:border-blue-700/30
                    rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <input
                        type="date"
                        value={settings.date}
                        onChange={e => updateSettings('date', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
                          border border-gray-200/30 dark:border-[#2c2c2e]/50
                          focus:outline-none focus:ring-2 focus:ring-blue-500/40
                          text-[15px] leading-relaxed"
                      />
                      
                      <select
                        value={settings.from}
                        onChange={e => updateSettings('from', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
                          border border-gray-200/30 dark:border-[#2c2c2e]/50
                          focus:outline-none focus:ring-2 focus:ring-blue-500/40
                          text-[15px] leading-relaxed appearance-none"
                      >
                        <option value="Roger">Roger</option>
                        <option value="Sharon">Sharon</option>
                        <option value="Emily">Emily</option>
                        <option value="Summer">Summer</option>
                        <option value="Nina">Nina</option>
                      </select>

                      <div className="flex p-0.5 gap-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-lg
                        border border-gray-200/50 dark:border-gray-700/50 h-[38px]">
                        {Object.entries(currencySymbols).map(([currency, symbol]) => (
                          <label
                            key={currency}
                            className={`flex items-center justify-center px-3 py-1.5 rounded-md
                              text-xs font-medium cursor-pointer transition-all duration-200
                              ${settings.currency === currency 
                                ? 'bg-white dark:bg-gray-800 text-blue-500 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400'}`}
                          >
                            <input
                              type="radio"
                              name="currency"
                              value={currency}
                              checked={settings.currency === currency}
                              onChange={e => updateSettings('currency', e.target.value)}
                              className="sr-only"
                            />
                            <span>{symbol}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex gap-4 px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50
                        border border-gray-200/50 dark:border-gray-700/50 rounded-xl h-[38px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showDescription}
                            onChange={e => updateSettings('showDescription', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600
                              text-blue-500 focus:ring-blue-500/40 cursor-pointer"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Description
                          </span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showRemarks}
                            onChange={e => updateSettings('showRemarks', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600
                              text-blue-500 focus:ring-blue-500/40 cursor-pointer"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Remarks
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <DocumentHeaderForm type={activeTab as 'quotation' | 'confirmation'} />

                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                          bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl
                          px-3 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-gray-100
                          first:pl-4 last:pr-4 first:rounded-tl-xl last:rounded-tr-xl">
                          No.
                        </th>
                        <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                          bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl
                          px-3 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Part Name
                        </th>
                        {settings.showDescription && (
                          <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                            bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl
                            px-3 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                            Description
                          </th>
                        )}
                        <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                          bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl w-[120px]
                          px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                          Quantity
                        </th>
                        <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                          bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl w-[100px]
                          px-3 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Unit
                        </th>
                        <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                          bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl w-[120px]
                          px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                          Unit Price
                        </th>
                        <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                          bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl w-[120px]
                          px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                          Amount
                        </th>
                        {settings.showRemarks && (
                          <th className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50
                            bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl
                            px-3 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                            Remarks
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {quotationData.items.map((item, index) => (
                        <tr key={item.lineNo}>
                          <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                            px-3 py-4 text-sm text-gray-500 dark:text-gray-400 first:pl-4">
                            {item.lineNo}
                          </td>
                          <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                            px-3 py-4">
                            <input
                              type="text"
                              value={item.partName}
                              onChange={e => updateLineItem(index, 'partName', e.target.value)}
                              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100
                                focus:outline-none focus:ring-0 border-0 p-0"
                              placeholder="Enter part name"
                            />
                          </td>
                          {settings.showDescription && (
                            <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                              px-3 py-4">
                              <input
                                type="text"
                                value={item.description}
                                onChange={e => updateLineItem(index, 'description', e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100
                                  focus:outline-none focus:ring-0 border-0 p-0"
                                placeholder="Enter description"
                              />
                            </td>
                          )}
                          <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                            px-3 py-4">
                            {editingQuantityIndex === index ? (
                              <input
                                type="number"
                                value={editingQuantity}
                                onChange={e => setEditingQuantity(e.target.value)}
                                onBlur={() => {
                                  updateLineItem(index, 'quantity', Number(editingQuantity));
                                  setEditingQuantityIndex(null);
                                }}
                                className="w-full bg-transparent text-right text-sm text-gray-900 dark:text-gray-100
                                  focus:outline-none focus:ring-0 border-0 p-0"
                                placeholder="0"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingQuantityIndex(index);
                                  setEditingQuantity(String(item.quantity));
                                }}
                                className="text-right text-sm text-gray-900 dark:text-gray-100 cursor-text"
                              >
                                {item.quantity}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                            px-3 py-4">
                            <select
                              value={item.unit}
                              onChange={e => updateLineItem(index, 'unit', e.target.value)}
                              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100
                                focus:outline-none focus:ring-0 border-0 p-0 appearance-none cursor-pointer"
                            >
                              <option value="pc">pc</option>
                              <option value="set">set</option>
                              <option value="kg">kg</option>
                              <option value="m">m</option>
                            </select>
                          </td>
                          <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                            px-3 py-4">
                            {editingUnitPriceIndex === index ? (
                              <input
                                type="number"
                                value={editingUnitPrice}
                                onChange={e => setEditingUnitPrice(e.target.value)}
                                onBlur={() => {
                                  updateLineItem(index, 'unitPrice', Number(editingUnitPrice));
                                  setEditingUnitPriceIndex(null);
                                }}
                                className="w-full bg-transparent text-right text-sm text-gray-900 dark:text-gray-100
                                  focus:outline-none focus:ring-0 border-0 p-0"
                                placeholder="0.00"
                                step="0.01"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingUnitPriceIndex(index);
                                  setEditingUnitPrice(String(item.unitPrice));
                                }}
                                className="text-right text-sm text-gray-900 dark:text-gray-100 cursor-text"
                              >
                                {currencySymbols[quotationData.currency]}{item.unitPrice.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                            px-3 py-4">
                            <div className="text-right text-sm text-gray-900 dark:text-gray-100">
                              {currencySymbols[quotationData.currency]}{item.amount.toFixed(2)}
                            </div>
                          </td>
                          {settings.showRemarks && (
                            <td className="whitespace-nowrap border-b border-gray-200/50 dark:border-gray-700/50
                              px-3 py-4">
                              <input
                                type="text"
                                value={item.remarks}
                                onChange={e => updateLineItem(index, 'remarks', e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100
                                  focus:outline-none focus:ring-0 border-0 p-0"
                                placeholder="Enter remarks"
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-6 mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="px-5 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400
                        hover:bg-blue-500/15 transition-all duration-300
                        text-sm font-medium flex items-center gap-2"
                    >
                      <span className="text-lg leading-none">+</span>
                      Add Line
                    </button>
                    
                    <div className="flex items-center gap-3" style={{ marginRight: '8.33%' }}>
                      <span className="text-sm font-medium text-gray-500">Total Amount</span>
                      <div className="w-[100px] text-right">
                        <span className="text-xl font-semibold tracking-tight">
                          {currencySymbols[quotationData.currency]}{getTotalAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600
                      text-white font-medium transition-all duration-300
                      shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
                      hover:-translate-y-0.5 active:scale-[0.98]
                      flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Generate {activeTab === 'quotation' ? 'Quotation' : 'Order Confirmation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
