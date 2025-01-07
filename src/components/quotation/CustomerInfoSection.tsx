import type { QuotationData } from '@/types/quotation';

interface CustomerInfoSectionProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
  type: 'quotation' | 'confirmation';
}

const inputClassName = `w-full px-4 py-2.5 rounded-xl
  bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-lg
  border border-gray-200/30 dark:border-[#2c2c2e]/50
  focus:outline-none focus:ring-2 
  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
  hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
  text-[15px] leading-relaxed
  text-gray-800 dark:text-gray-200
  placeholder:text-gray-400/60 dark:placeholder:text-gray-500/40
  transition-all duration-300`;

const labelClassName = `block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5`;

export function CustomerInfoSection({ data, onChange, type }: CustomerInfoSectionProps) {
  return (
    <div className="space-y-4">
      {/* 第一行：报价单号 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={data.quotationNo}
            onChange={e => onChange({ ...data, quotationNo: e.target.value })}
            placeholder={type === 'quotation' ? "Quotation No. *" : "Quotation No."}
            className={`${inputClassName} ${
              type === 'quotation' 
                ? `border-[#007AFF]/20 dark:border-[#0A84FF]/20
                   focus:border-[#007AFF]/30 dark:focus:border-[#0A84FF]/30
                   focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20
                   bg-[#007AFF]/[0.03] dark:bg-[#0A84FF]/[0.03]
                   placeholder:text-[#007AFF]/60 dark:placeholder:text-[#0A84FF]/60
                   font-medium`
                : ''
            }`}
            required={type === 'quotation'}
          />
        </div>
      </div>

      {/* 第二行：客户信息 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <textarea
            value={data.to}
            onChange={e => onChange({ ...data, to: e.target.value })}
            placeholder="Enter customer name and address"
            rows={3}
            className={inputClassName}
          />
        </div>
      </div>

      {/* 第三行：询价单号和合同号 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClassName}>
            Inquiry No.
          </label>
          <input
            type="text"
            value={data.inquiryNo}
            onChange={e => onChange({ ...data, inquiryNo: e.target.value })}
            placeholder="Inquiry No."
            className={inputClassName}
          />
        </div>
        {type === 'confirmation' && (
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <span className="text-[#34C759] dark:text-[#30D158]">*</span>
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">Contract No.</span>
            </label>
            <input
              type="text"
              value={data.contractNo}
              onChange={e => onChange({ ...data, contractNo: e.target.value })}
              placeholder="Contract No."
              className={`${inputClassName} 
                border-[#34C759]/20 dark:border-[#30D158]/20
                focus:border-[#34C759]/30 dark:focus:border-[#30D158]/30
                focus:ring-[#34C759]/20 dark:focus:ring-[#30D158]/20
                bg-[#34C759]/[0.03] dark:bg-[#30D158]/[0.03]
                placeholder:text-[#34C759]/40 dark:placeholder:text-[#30D158]/40`}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
} 