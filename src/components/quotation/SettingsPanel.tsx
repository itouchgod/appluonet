import type { QuotationData } from '@/types/quotation';
import { getDefaultNotes } from '@/utils/getDefaultNotes';
import { useState, useEffect, useCallback } from 'react';
import { getLocalStorageJSON, getLocalStorageString } from '@/utils/safeLocalStorage';

interface SettingsPanelProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
  activeTab: 'quotation' | 'confirmation';
}

export function SettingsPanel({ data, onChange, activeTab }: SettingsPanelProps) {
  const [customUnit, setCustomUnit] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [fromOptions, setFromOptions] = useState<string[]>(['Roger', 'Sharon', 'Emily', 'Summer', 'Nina']);
  const [isClient, setIsClient] = useState(false);



  // 计算总金额
  const totalAmount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0) + 
                     (data.otherFees || []).reduce((sum, fee) => sum + fee.amount, 0);

  // 获取From选项的函数
  const getFromOptions = useCallback(() => {
    const options = ['Roger', 'Sharon', 'Emily', 'Summer', 'Nina'];
    
    // 在服务器端渲染时，只返回基本选项避免水合错误
    if (typeof window === 'undefined') {
      return options;
    }
    
    // 从localStorage获取当前用户名
    const currentUser = (() => {
      try {
        const userInfo = getLocalStorageJSON('userInfo', null) as { username?: string } | null;
        if (userInfo) return userInfo.username || '';
        
        // 使用安全的字符串获取函数
        const name = getLocalStorageString('username');
        return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : '';
      } catch { 
        return '' 
      }
    })();
    
    // 如果当前用户不在预设列表中，将其添加到列表开头
    if (currentUser && !options.some(option => option.toLowerCase() === currentUser.toLowerCase())) {
      options.unshift(currentUser);
    }
    
    // 如果当前值不在列表中，也添加进去
    if (data.from && !options.some(option => option.toLowerCase() === data.from.toLowerCase())) {
      options.unshift(data.from);
    }
    
    return options;
  }, [data.from]);

  // 客户端渲染时更新选项
  useEffect(() => {
    setIsClient(true);
    setFromOptions(getFromOptions());
    
    // 如果当前from值是默认值（Roger），且当前用户不是Roger，则自动更新为当前用户
    if (data.from === 'Roger' && typeof window !== 'undefined') {
      try {
        const userInfo = getLocalStorageJSON('userInfo', null) as { username?: string } | null;
        const currentUser = userInfo?.username || getLocalStorageString('username');
        
        if (currentUser && currentUser.toLowerCase() !== 'roger') {
          const formattedUser = currentUser.charAt(0).toUpperCase() + currentUser.slice(1).toLowerCase();
          // 调用onChange来更新from值
          onChange({
            ...data,
            from: formattedUser,
            notes: getDefaultNotes(formattedUser, activeTab)
          });
        }
      } catch (error) {
        console.warn('自动更新from字段失败:', error);
      }
    }
  }, [getFromOptions, data.from, onChange, data, activeTab]);

  const handleAddCustomUnit = () => {
    if (customUnit && !(data.customUnits || []).includes(customUnit)) {
      onChange({
        ...data,
        customUnits: [...(data.customUnits || []), customUnit]
      });
      setCustomUnit('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleRemoveCustomUnit = (index: number) => {
    const newUnits = (data.customUnits || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      customUnits: newUnits
    });
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-3 shadow-sm">
      
      {/* 响应式布局容器 */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        
        {/* 第一组：来源 */}
        <div className="flex items-center gap-1.5">
          <span className="text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">From:</span>
          <select
            value={data.from}
            onChange={(e) => {
              const newValue = e.target.value;
              onChange({
                ...data,
                from: newValue,
                notes: getDefaultNotes(newValue, activeTab)
              });
            }}
            className="px-2 py-1 rounded text-[11px] font-medium
              bg-white/90 dark:bg-[#1c1c1e]/90
              border border-gray-200/30 dark:border-[#2c2c2e]/50
              focus:outline-none focus:ring-1
              focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
              text-gray-800 dark:text-gray-200"
            suppressHydrationWarning
          >
            {isClient ? (
              fromOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            ) : (
              // 服务器端渲染时只显示基本选项，避免水合错误
              ['Roger', 'Sharon', 'Emily', 'Summer', 'Nina'].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 分隔线 */}
        <div className="hidden md:block h-4 w-px bg-blue-300 dark:bg-blue-700"></div>

        {/* 第二组：币种 */}
        <div className="flex items-center gap-1.5">
          <span className="text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">Currency:</span>
          <div className="flex gap-1">
            {[
              { value: 'USD', label: '$' },
              { value: 'EUR', label: '€' },
              { value: 'CNY', label: '¥' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...data, currency: option.value as 'USD' | 'EUR' | 'CNY' })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  data.currency === option.value 
                    ? 'bg-[#007AFF] text-white shadow-sm' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[#007AFF]/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="hidden md:block h-4 w-px bg-blue-300 dark:bg-blue-700"></div>

        {/* 第三组：Header */}
        <div className="flex items-center gap-1.5">
          <span className="text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">Header:</span>
          <div className="flex gap-1">
            {[
              { value: 'none', label: 'None' },
              { value: 'bilingual', label: 'CN+EN' },
              { value: 'english', label: 'EN' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({
                  ...data,
                  templateConfig: {
                    ...data.templateConfig,
                    headerType: option.value as 'none' | 'bilingual' | 'english'
                  }
                })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  data.templateConfig?.headerType === option.value 
                    ? 'bg-[#007AFF] text-white shadow-sm' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[#007AFF]/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="hidden md:block h-4 w-px bg-blue-300 dark:bg-blue-700"></div>

        {/* 第四组：定金设置 - 仅在销售确认页面显示 */}
        {activeTab === 'confirmation' && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">Deposit:</span>
              
              {/* 定金百分比输入 */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.depositPercentage || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const depositAmount = percentage > 0 ? (percentage / 100) * totalAmount : undefined;
                    
                    // 如果Balance按钮打开，同时更新balanceAmount
                    const balanceAmount = (data.showBalance && depositAmount) ? (totalAmount - depositAmount) : undefined;
                    
                    onChange({ 
                      ...data,
                      depositPercentage: percentage > 0 ? percentage : undefined,
                      depositAmount: depositAmount,
                      balanceAmount: balanceAmount
                    });
                  }}
                  placeholder="0"
                  className="w-16 px-2 py-1 rounded text-[9px]
                    bg-white/90 dark:bg-[#1c1c1e]/90
                    border border-gray-200/30 dark:border-[#2c2c2e]/50
                    focus:outline-none focus:ring-1
                    focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                    text-gray-800 dark:text-gray-200
                    text-center
                    [appearance:textfield] 
                    [&::-webkit-outer-spin-button]:appearance-none 
                    [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-600 dark:text-gray-400 text-[9px]">%</span>
              </div>

              {/* Balance切换按钮 */}
              {data.depositPercentage && data.depositPercentage > 0 && data.depositAmount && data.depositAmount > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newShowBalance = !data.showBalance;
                      const balanceAmount = newShowBalance ? (totalAmount - (data.depositAmount || 0)) : undefined;
                      onChange({ 
                        ...data,
                        showBalance: newShowBalance,
                        balanceAmount: balanceAmount
                      });
                    }}
                    className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${
                      data.showBalance 
                        ? 'bg-green-500 text-white shadow-sm' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-green-400'
                    }`}
                  >
                    Balance
                  </button>
                </div>
              )}
            </div>

            {/* 分隔线 */}
            <div className="hidden lg:block h-4 w-px bg-blue-300 dark:bg-blue-700"></div>
          </>
        )}

        {/* 第五组：HK印章设置 - 仅在销售确认页面显示 */}
        {activeTab === 'confirmation' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">Stamp:</span>
              <button
                type="button"
                onClick={() => onChange({ ...data, showStamp: !data.showStamp })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  data.showStamp
                    ? 'bg-[#007AFF] text-white shadow-sm' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[#007AFF]/40'
                }`}
                title="在PDF中添加香港印章"
              >
                HK Stamp
              </button>
            </div>

            {/* 分隔线 */}
            <div className="hidden lg:block h-4 w-px bg-blue-300 dark:bg-blue-700"></div>
          </>
        )}

        {/* 换行控制：小屏换行，中屏不换行 */}
        <div className="w-full sm:w-auto"></div>

        {/* 第六组：自定义单位 */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">Units:</span>
          
          {/* 自定义单位输入 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomUnit();
                  }
                }}
                placeholder="Add custom unit"
                className="w-24 px-2 py-1 rounded text-[9px]
                  bg-white/90 dark:bg-[#1c1c1e]/90
                  border border-gray-200/30 dark:border-[#2c2c2e]/50
                  focus:outline-none focus:ring-1
                  focus:ring-[#007AFF]/40 dark:focus:ring-[#0A84FF]/40
                  text-gray-800 dark:text-gray-200
                  placeholder:text-gray-400 placeholder:text-[9px]"
                style={{ caretColor: '#007AFF' }}
              />
              {showSuccess && (
                <div className="absolute left-0 right-0 -bottom-5 text-center text-[9px] text-green-500 dark:text-green-400
                  animate-[fadeIn_0.2s_ease-in,fadeOut_0.2s_ease-out_1.8s]">
                  Added
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddCustomUnit}
              className="px-2 py-1 rounded text-[9px] font-medium
                bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                hover:bg-[#007AFF]/[0.12] dark:hover:bg-[#0A84FF]/[0.12]
                text-[#007AFF] dark:text-[#0A84FF]"
            >
              +
            </button>
          </div>

          {/* 已添加的自定义单位 */}
          {(data.customUnits || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(data.customUnits || []).map((unit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded
                    bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/[0.08]
                    text-[#007AFF] dark:text-[#0A84FF]
                    text-[9px]"
                >
                  <span>{unit}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomUnit(index)}
                    className="w-3 h-3 flex items-center justify-center
                      hover:bg-[#007AFF]/20 dark:hover:bg-[#0A84FF]/20
                      rounded-full text-[8px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 性能调试标记（开发模式下可启用）
if (process.env.NODE_ENV === 'development') {
  // SettingsPanel.whyDidYouRender = true;
} 