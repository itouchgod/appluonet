'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { exportPDF } from '@/lib/pdf';

const formSchema = z.object({
  type: z.enum(['proforma', 'commercial'], {
    required_error: '请选择发票类型',
  }),
  invoiceNumber: z.string().min(1, '请输入发票号码'),
  date: z.string().min(1, '请选择发票日期'),
  customerName: z.string().min(1, '请输入客户名称'),
  customerAddress: z.string().min(1, '请输入客户地址'),
  amount: z.number().min(0.01, '金额必须大于0'),
  currency: z.string().min(1, '请选择货币'),
  description: z.string().min(1, '请输入商品或服务描述'),
  letterhead: z.string().min(1, '请选择发票抬头'),
  seal: z.string().min(1, '请选择印章'),
});

const currencyOptions = [
  { value: 'CNY', label: '人民币 (CNY)' },
  { value: 'USD', label: '美元 (USD)' },
  { value: 'EUR', label: '欧元 (EUR)' },
];

// 模拟数据，实际应该从数据库获取
const letterheadOptions = [
  { value: 'company1', label: '公司抬头 1' },
  { value: 'company2', label: '公司抬头 2' },
];

const sealOptions = [
  { value: 'seal1', label: '公章 1' },
  { value: 'seal2', label: '财务章' },
];

export default function InvoicePage() {
  const [generatedInvoice, setGeneratedInvoice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'proforma',
      invoiceNumber: `INV${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      amount: 0,
      currency: 'CNY',
      description: '',
      letterhead: 'company1',
      seal: 'seal1',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('发票生成失败');
      }

      const data = await response.json();
      setGeneratedInvoice(data.invoice);
    } catch (error) {
      console.error('发票生成错误:', error);
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

      // 获取选中的印章
      const stamp = form.getValues('stamp');
      
      await exportPDF('invoice', data, stamp);
      // TODO: 添加成功提示
    } catch (error) {
      console.error('导出PDF失败:', error);
      // TODO: 添加错误提示
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">发票助手</h2>
        <p className="mt-1 text-sm text-gray-500">
          生成形式发票或商业发票
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>发票类型</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="proforma" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            形式发票
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="commercial" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            商业发票
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发票号码</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发票日期</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>金额</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0.01"
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>商品或服务描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入商品或服务的详细描述"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="letterhead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发票抬头</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择发票抬头" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {letterheadOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="seal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>印章选择</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择印章" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sealOptions.map((option) => (
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

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? '生成中...' : '生成发票'}
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
                {generatedInvoice ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedInvoice }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    生成的发票将在这里显示
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pdf" className="p-4">
                {generatedInvoice ? (
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
                    生成发票后可下载 PDF 版本
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
              disabled={!generatedInvoice}
            >
              复制
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={!generatedInvoice}
            >
              导出PDF
            </Button>
            <Button
              onClick={() => {
                // TODO: 发送邮件
              }}
              disabled={!generatedInvoice}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 