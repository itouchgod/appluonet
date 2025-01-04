import type { QuotationData } from '@/types/quotation';

interface SettingsPanelProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
  activeTab: 'quotation' | 'confirmation';
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

const radioGroupClassName = `flex p-1 gap-2
  bg-gray-100/50 dark:bg-gray-900/50 
  rounded-lg
  border border-gray-200/50 dark:border-gray-700/50`;

const radioButtonClassName = `flex items-center justify-center px-3 py-1.5
  rounded-lg
  text-xs font-medium
  transition-all duration-200
  cursor-pointer
  min-w-[36px]
  border border-transparent
  hover:shadow-md
  active:scale-[0.97]`;

const radioButtonActiveClassName = `bg-white dark:bg-[#1c1c1e] 
  text-[#007AFF] dark:text-[#0A84FF]
  shadow-md
  border-gray-200/50 dark:border-gray-700/50`;

const checkboxGroupClassName = `flex gap-4 px-4 py-2.5
  bg-gray-50/50 dark:bg-[#1c1c1e]/50
  border border-gray-200/50 dark:border-gray-700/50
  rounded-xl`;

export function SettingsPanel({ data, onChange, activeTab }: SettingsPanelProps) {
  return (
    <div className={settingsPanelClassName}>
      {/* 小屏布局 */}
      <div className="sm:hidden flex flex-col gap-4">
        {/* 第一行：日期和名字 */}
        <div className="flex items-center justify-center gap-4">
          <input
            type="date"
            value={data.date}
            onChange={e => onChange({ ...data, date: e.target.value })}
            className={`${inputClassName} w-[130px]`}
          />
          
          <select
            value={data.from}
            onChange={e => onChange({ ...data, from: e.target.value })}
            className={`${inputClassName} appearance-none 
              bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')] 
              bg-[length:1em_1em] 
              bg-[right_0.5rem_center] 
              bg-no-repeat
              pr-8
              w-[120px]`}
          >
            <option value="Roger">Roger</option>
            <option value="Sharon">Sharon</option>
            <option value="Emily">Emily</option>
            <option value="Summer">Summer</option>
            <option value="Nina">Nina</option>
          </select>
        </div>

        {/* 第二行：币种选择 */}
        <div className="flex justify-center">
          <div className={`${radioGroupClassName} h-[38px] w-[120px]`}>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'USD' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="USD"
                checked={data.currency === 'USD'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>$</span>
            </label>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'EUR' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="EUR"
                checked={data.currency === 'EUR'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>€</span>
            </label>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'CNY' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="CNY"
                checked={data.currency === 'CNY'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>¥</span>
            </label>
          </div>
        </div>

        {/* 第三行：复选框组 */}
        <div className="flex items-center justify-center gap-4">
          {/* Bank复选框 */}
          {activeTab === 'confirmation' && (
            <label className="flex items-center gap-2 cursor-pointer h-[38px] px-4 shrink-0">
              <input
                type="checkbox"
                checked={data.showBank}
                onChange={e => onChange({ ...data, showBank: e.target.checked })}
                className="w-3.5 h-3.5 rounded 
                  border-gray-300 dark:border-gray-600
                  text-[#007AFF] dark:text-[#0A84FF]
                  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                  cursor-pointer"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Bank
              </span>
            </label>
          )}

          {/* Description/Remarks复选框组 */}
          <div className={`${checkboxGroupClassName} h-[38px] shrink-0`}>
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

      {/* 中屏布局 */}
      <div className="hidden sm:flex lg:hidden flex-col gap-4">
        {/* 第一行：日期和名字 */}
        <div className="flex items-center justify-center gap-4">
          <input
            type="date"
            value={data.date}
            onChange={e => onChange({ ...data, date: e.target.value })}
            className={`${inputClassName} w-[130px]`}
          />
          
          <select
            value={data.from}
            onChange={e => onChange({ ...data, from: e.target.value })}
            className={`${inputClassName} appearance-none 
              bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')] 
              bg-[length:1em_1em] 
              bg-[right_0.5rem_center] 
              bg-no-repeat
              pr-8
              w-[120px]`}
          >
            <option value="Roger">Roger</option>
            <option value="Sharon">Sharon</option>
            <option value="Emily">Emily</option>
            <option value="Summer">Summer</option>
            <option value="Nina">Nina</option>
          </select>
        </div>

        {/* 第二行：Bank、复选框组、币种 */}
        <div className="flex items-center justify-center gap-4">
          {/* Bank复选框 */}
          {activeTab === 'confirmation' && (
            <label className="flex items-center gap-2 cursor-pointer h-[38px] px-4 shrink-0">
              <input
                type="checkbox"
                checked={data.showBank}
                onChange={e => onChange({ ...data, showBank: e.target.checked })}
                className="w-3.5 h-3.5 rounded 
                  border-gray-300 dark:border-gray-600
                  text-[#007AFF] dark:text-[#0A84FF]
                  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                  cursor-pointer"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Bank
              </span>
            </label>
          )}

          {/* Description/Remarks复选框组 */}
          <div className={`${checkboxGroupClassName} h-[38px] shrink-0`}>
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

          {/* 币种选择 */}
          <div className={`${radioGroupClassName} h-[38px] w-[120px] shrink-0`}>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'USD' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="USD"
                checked={data.currency === 'USD'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>$</span>
            </label>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'EUR' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="EUR"
                checked={data.currency === 'EUR'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>€</span>
            </label>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'CNY' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="CNY"
                checked={data.currency === 'CNY'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>¥</span>
            </label>
          </div>
        </div>
      </div>

      {/* 大屏布局 - 所有组件在同一行 */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        {/* 日期和名字 */}
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={data.date}
            onChange={e => onChange({ ...data, date: e.target.value })}
            className={`${inputClassName} w-[130px]`}
          />
          
          <select
            value={data.from}
            onChange={e => onChange({ ...data, from: e.target.value })}
            className={`${inputClassName} appearance-none 
              bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')] 
              bg-[length:1em_1em] 
              bg-[right_0.5rem_center] 
              bg-no-repeat
              pr-8
              w-[120px]`}
          >
            <option value="Roger">Roger</option>
            <option value="Sharon">Sharon</option>
            <option value="Emily">Emily</option>
            <option value="Summer">Summer</option>
            <option value="Nina">Nina</option>
          </select>
        </div>

        {/* 控制组 */}
        <div className="flex items-center gap-4">
          {/* Bank复选框 */}
          {activeTab === 'confirmation' && (
            <label className="flex items-center gap-2 cursor-pointer h-[38px] px-4 shrink-0">
              <input
                type="checkbox"
                checked={data.showBank}
                onChange={e => onChange({ ...data, showBank: e.target.checked })}
                className="w-3.5 h-3.5 rounded 
                  border-gray-300 dark:border-gray-600
                  text-[#007AFF] dark:text-[#0A84FF]
                  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                  cursor-pointer"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Bank
              </span>
            </label>
          )}

          {/* Description/Remarks复选框组 */}
          <div className={`${checkboxGroupClassName} h-[38px] shrink-0`}>
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

          {/* 币种选择 */}
          <div className={`${radioGroupClassName} h-[38px] w-[120px] shrink-0`}>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'USD' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="USD"
                checked={data.currency === 'USD'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>$</span>
            </label>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'EUR' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="EUR"
                checked={data.currency === 'EUR'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>€</span>
            </label>
            <label
              className={`${radioButtonClassName} ${
                data.currency === 'CNY' ? radioButtonActiveClassName : 
                'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-[#1c1c1e]/60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value="CNY"
                checked={data.currency === 'CNY'}
                onChange={e => onChange({ ...data, currency: e.target.value })}
                className="sr-only"
              />
              <span>¥</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 