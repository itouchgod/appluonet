import type { QuotationData } from '@/types/quotation';
import { getDefaultNotes } from '@/utils/getDefaultNotes';

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
      {/* 第一行：报价单号和报价人 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={data.quotationNo}
            onChange={e => onChange({ ...data, quotationNo: e.target.value })}
            placeholder={type === 'quotation' ? "Quotation No. *" : "Quotation No."}
            className={`w-full px-4 py-2.5 rounded-xl backdrop-blur-lg
              ${type === 'quotation' 
                ? `bg-[#007AFF]/[0.03] dark:bg-[#0A84FF]/[0.03]
                   border border-[#007AFF]/20 dark:border-[#0A84FF]/20
                   focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20
                   hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
                   text-[#007AFF] dark:text-[#0A84FF]
                   placeholder:text-[#007AFF]/60 dark:placeholder:text-[#0A84FF]/60
                   font-medium`
                : `bg-white/90 dark:bg-[#1c1c1e]/90
                   border border-gray-200/30 dark:border-[#2c2c2e]/50
                   focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                   hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
                   text-gray-800 dark:text-gray-200
                   placeholder:text-gray-400/60 dark:placeholder:text-gray-500/40`
              }
              focus:outline-none focus:ring-2 
              text-[15px] leading-relaxed
              transition-all duration-300`}
            required={type === 'quotation'}
          />
        </div>
        <div className="w-[200px]">
          <select
            value={data.from}
            onChange={e => {
              const newValue = e.target.value;
              onChange({
                ...data,
                from: newValue,
                notes: getDefaultNotes(newValue, type)
              });
            }}
            className={`${inputClassName} appearance-none 
              bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')] 
              bg-[length:1em_1em] 
              bg-[right_0.5rem_center] 
              bg-no-repeat
              pr-8`}
          >
            <option value="Roger">Roger</option>
            <option value="Sharon">Sharon</option>
            <option value="Emily">Emily</option>
            <option value="Summer">Summer</option>
            <option value="Nina">Nina</option>
          </select>
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
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">Contract No.</span>
            </label>
            <input
              type="text"
              value={data.contractNo}
              onChange={e => onChange({ ...data, contractNo: e.target.value })}
              placeholder="Contract No."
              className={`w-full px-4 py-2.5 rounded-xl
                bg-[#007AFF]/[0.03] dark:bg-[#0A84FF]/[0.03] backdrop-blur-lg
                border border-[#007AFF]/20 dark:border-[#0A84FF]/20
                focus:outline-none focus:ring-2 
                focus:ring-[#007AFF]/20 dark:focus:ring-[#0A84FF]/20
                hover:border-[#007AFF]/30 dark:hover:border-[#0A84FF]/30
                text-[15px] leading-relaxed font-medium
                text-[#007AFF] dark:text-[#0A84FF]
                placeholder:text-[#007AFF]/40 dark:placeholder:text-[#0A84FF]/40
                transition-all duration-300`}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
} 