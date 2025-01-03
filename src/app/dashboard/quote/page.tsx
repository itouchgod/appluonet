'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { exportPDF } from '@/lib/pdf';

const productSchema = z.object({
  name: z.string().min(1, '请输入产品名称'),
  description: z.string().optional(),
  quantity: z.number().min(1, '数量必须大于0'),
  unit: z.string().min(1, '请选择单位'),
  unitPrice: z.number().min(0, '单价不能为负数'),
});

const formSchema = z.object({
  customerName: z.string().min(1, '请输入客户名称'),
  customerEmail: z.string().email('请输入有效的邮箱地址'),
  customerAddress: z.string().min(1, '请输入客户地址'),
  quoteNumber: z.string().min(1, '请输入报价单号'),
  validUntil: z.string().min(1, '请选择有效期'),
  currency: z.string().min(1, '请选择货币'),
  products: z.array(productSchema).min(1, '至少添加一个产品'),
  notes: z.string().optional(),
});

const unitOptions = [
  { value: 'piece', label: '件' },
  { value: 'set', label: '套' },
  { value: 'box', label: '箱' },
  { value: 'kg', label: '千克' },
  { value: 'm', label: '米' },
];

const currencyOptions = [
  { value: 'CNY', label: '人民币 (CNY)' },
  { value: 'USD', label: '美元 (USD)' },
  { value: 'EUR', label: '欧元 (EUR)' },
];

export default function QuotePage() {
  const [generatedQuote, setGeneratedQuote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerAddress: '',
      quoteNumber: `QT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'CNY',
      products: [
        {
          name: '',
          description: '',
          quantity: 1,
          unit: 'piece',
          unitPrice: 0,
        },
      ],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'products',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/quote/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('报价单生成失败');
      }

      const data = await response.json();
      setGeneratedQuote(data.quote);
    } catch (error) {
      console.error('报价单生成错误:', error);
      // TODO: 添加错误提示
    } finally {
      setIsGenerating(false);
    }
  }

  const handleExportPDF = async () => {
    try {
      const data = {
        number: form.getValues('number'),
        date: form.getValues('date'),
        customer: form.getValues('customer'),
        items: form.getValues('items'),
        total: calculateTotal(form.getValues('items')),
        remarks: form.getValues('remarks'),
      };

      await exportPDF('quote', data);
      // TODO: 添加成功提示
    } catch (error) {
      console.error('导出PDF失败:', error);
      // TODO: 添加错误提示
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">报价订单</h2>
        <p className="mt-1 text-sm text-gray-500">
          填写客户和产品信息，生成专业报价单
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">客户信息</h3>
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>客户名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入客户名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>客户邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="example@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>客户地址</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入客户详细地址"
                          className="h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">报价信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quoteNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>报价单号</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>有效期至</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>货币</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择货币" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">产品列表</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: '',
                        description: '',
                        quantity: 1,
                        unit: 'piece',
                        unitPrice: 0,
                      })
                    }
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    添加产品
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">产品 {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`products.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>产品名称</FormLabel>
                          <FormControl>
                            <Input placeholder="请输入产品名称" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>产品描述</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="请输入产品描述（可选）"
                              className="h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`products.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>数量</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`products.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>单位</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择单位" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {unitOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`products.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>单价</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="添加报价单备注（可选）"
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? '生成中...' : '生成报价单'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border shadow-sm">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="preview" className="flex-1">
                  预览
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex-1">
                  PDF
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="p-4">
                {generatedQuote ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedQuote }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    生成的报价单将在这里显示
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pdf" className="p-4">
                {generatedQuote ? (
                  <div className="text-center">
                    <Button
                      onClick={() => {
                        // TODO: 下载 PDF
                      }}
                    >
                      下载 PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    生成报价单后可下载 PDF 版本
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: 复制到剪贴板
              }}
              disabled={!generatedQuote}
            >
              复制
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={!generatedQuote}
            >
              导出PDF
            </Button>
            <Button
              onClick={() => {
                // TODO: 发送邮件
              }}
              disabled={!generatedQuote}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 