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
    <div className="grid grid-cols-12 gap-6 mb-6">
      <div className="col-span-5">
        <textarea
          value={data.to}
          onChange={e => onChange({ ...data, to: e.target.value })}
          placeholder="Enter customer name and address"
          rows={3}
          className={inputClassName}
        />
      </div>
      <div className="col-span-4">
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
        <div className="col-span-3">
          <label className={labelClassName}>
            Contract No.
          </label>
          <input
            type="text"
            value={data.contractNo}
            onChange={e => onChange({ ...data, contractNo: e.target.value })}
            placeholder="Contract No."
            className={inputClassName}
          />
        </div>
      )}
    </div>
  );
} 