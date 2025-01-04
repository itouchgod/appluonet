import type { QuotationData } from '@/types/quotation';

interface SettingsPanelProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

const settingsPanelClassName = `bg-[#007AFF]/5 dark:bg-[#0A84FF]/5 backdrop-blur-xl
  border border-[#007AFF]/10 dark:border-[#0A84FF]/10
  rounded-2xl overflow-hidden
  shadow-lg shadow-[#007AFF]/5 dark:shadow-[#0A84FF]/5
  p-4`;

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

const radioGroupClassName = `flex p-0.5 gap-1
  bg-gray-100/50 dark:bg-gray-900/50 
  rounded-lg
  border border-gray-200/50 dark:border-gray-700/50`;

const radioButtonClassName = `flex items-center justify-center px-3 py-1.5
  rounded-md
  text-xs font-medium
  transition-all duration-200
  cursor-pointer`;

const radioButtonActiveClassName = `bg-white dark:bg-[#1c1c1e] 
  text-[#007AFF] dark:text-[#0A84FF]
  shadow-sm`;

const checkboxGroupClassName = `flex gap-4 px-4 py-2.5
  bg-gray-50/50 dark:bg-[#1c1c1e]/50
  border border-gray-200/50 dark:border-gray-700/50
  rounded-xl`;

export function SettingsPanel({ data, onChange }: SettingsPanelProps) {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    CNY: '¥'
  };

  return (
    <div className={settingsPanelClassName}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 日期选择 */}
        <input
          type="date"
          value={data.date}
          onChange={e => onChange({ ...data, date: e.target.value })}
          className={inputClassName}
        />
        
        {/* 销售人员选择 */}
        <select
          value={data.from}
          onChange={e => onChange({ ...data, from: e.target.value })}
          className={`${inputClassName} appearance-none 
            bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')] 
            bg-[length:1em_1em] 
            bg-[right_1rem_center] 
            bg-no-repeat
            pr-10`}
        >
          <option value="Roger">Roger</option>
          <option value="Sharon">Sharon</option>
          <option value="Emily">Emily</option>
          <option value="Summer">Summer</option>
          <option value="Nina">Nina</option>
        </select>

        {/* 币种选择 */}
        <div className={`${radioGroupClassName} h-[38px]`}>
          {Object.entries(currencySymbols).map(([currency, symbol]) => (
            <label
              key={currency}
              className={`${radioButtonClassName} flex-1 ${
                data.currency === currency ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value={currency}
                checked={data.currency === currency}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>{symbol}</span>
            </label>
          ))}
        </div>

        {/* 显示选项 */}
        <div className={`${checkboxGroupClassName} h-[38px]`}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showDescription}
              onChange={e => onChange({ ...data, showDescription: e.target.checked })}
              className="w-3.5 h-3.5 rounded 
                border-gray-300 dark:border-gray-600
                text-[#007AFF] dark:text-[#0A84FF]
                focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                cursor-pointer"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Description
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showRemarks}
              onChange={e => onChange({ ...data, showRemarks: e.target.checked })}
              className="w-3.5 h-3.5 rounded 
                border-gray-300 dark:border-gray-600
                text-[#007AFF] dark:text-[#0A84FF]
                focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                cursor-pointer"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Remarks
            </span>
          </label>
        </div>
      </div>
    </div>
  );
} 