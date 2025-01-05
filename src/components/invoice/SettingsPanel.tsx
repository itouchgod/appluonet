import { RadioGroup } from '@headlessui/react';
import { InvoiceTemplateConfig } from '@/types/invoice';

interface SettingsPanelProps {
  config: InvoiceTemplateConfig;
  onChange: (config: InvoiceTemplateConfig) => void;
}

export default function SettingsPanel({ config, onChange }: SettingsPanelProps) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Invoice Template Settings</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Header Type</h3>
          <RadioGroup value={config.headerType} onChange={(value) => onChange({ ...config, headerType: value })}>
            <div className="space-x-4">
              <RadioGroup.Option value="bilingual">
                {({ checked }) => (
                  <span className={`inline-flex items-center ${checked ? 'text-blue-600' : ''}`}>
                    <span className={`w-4 h-4 mr-2 rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
                      {checked && <span className="block w-2 h-2 mx-auto mt-1 bg-blue-600 rounded-full" />}
                    </span>
                    Bilingual Header
                  </span>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value="english">
                {({ checked }) => (
                  <span className={`inline-flex items-center ${checked ? 'text-blue-600' : ''}`}>
                    <span className={`w-4 h-4 mr-2 rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
                      {checked && <span className="block w-2 h-2 mx-auto mt-1 bg-blue-600 rounded-full" />}
                    </span>
                    English Header
                  </span>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Invoice Type</h3>
          <RadioGroup value={config.invoiceType} onChange={(value) => onChange({ ...config, invoiceType: value })}>
            <div className="space-x-4">
              <RadioGroup.Option value="commercial">
                {({ checked }) => (
                  <span className={`inline-flex items-center ${checked ? 'text-blue-600' : ''}`}>
                    <span className={`w-4 h-4 mr-2 rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
                      {checked && <span className="block w-2 h-2 mx-auto mt-1 bg-blue-600 rounded-full" />}
                    </span>
                    Commercial Invoice
                  </span>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value="proforma">
                {({ checked }) => (
                  <span className={`inline-flex items-center ${checked ? 'text-blue-600' : ''}`}>
                    <span className={`w-4 h-4 mr-2 rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
                      {checked && <span className="block w-2 h-2 mx-auto mt-1 bg-blue-600 rounded-full" />}
                    </span>
                    Proforma Invoice
                  </span>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Company Stamp</h3>
          <RadioGroup value={config.stampType} onChange={(value) => onChange({ ...config, stampType: value })}>
            <div className="space-x-4">
              <RadioGroup.Option value="shanghai">
                {({ checked }) => (
                  <span className={`inline-flex items-center ${checked ? 'text-blue-600' : ''}`}>
                    <span className={`w-4 h-4 mr-2 rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
                      {checked && <span className="block w-2 h-2 mx-auto mt-1 bg-blue-600 rounded-full" />}
                    </span>
                    Shanghai Company
                  </span>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value="hongkong">
                {({ checked }) => (
                  <span className={`inline-flex items-center ${checked ? 'text-blue-600' : ''}`}>
                    <span className={`w-4 h-4 mr-2 rounded-full border ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
                      {checked && <span className="block w-2 h-2 mx-auto mt-1 bg-blue-600 rounded-full" />}
                    </span>
                    Hong Kong Company
                  </span>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={() => onChange(config)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          onClick={() => onChange(config)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
} 