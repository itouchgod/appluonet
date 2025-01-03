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

const formSchema = z.object({
  recipient: z.string().email('请输入有效的邮箱地址'),
  subject: z.string().min(1, '请输入邮件主题'),
  content: z.string().min(1, '请输入邮件内容要点'),
  tone: z.enum(['professional', 'friendly', 'formal'], {
    required_error: '请选择邮件语气',
  }),
  language: z.enum(['zh', 'en', 'zh-en'], {
    required_error: '请选择邮件语言',
  }),
});

export default function EmailAssistantPage() {
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      subject: '',
      content: '',
      tone: 'professional',
      language: 'zh',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('邮件生成失败');
      }

      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error('邮件生成错误:', error);
      // TODO: 添加错误提示
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">邮件助手</h2>
        <p className="mt-1 text-sm text-gray-500">
          输入关键信息，快速生成专业邮件
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>收件人邮箱</FormLabel>
                    <FormControl>
                      <Input placeholder="example@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮件主题</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入邮件主题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮件内容要点</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入邮件内容的关键点，每行一个要点"
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
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮件语气</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择邮件语气" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">专业</SelectItem>
                          <SelectItem value="friendly">友好</SelectItem>
                          <SelectItem value="formal">正式</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮件语言</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择邮件语言" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="en">英文</SelectItem>
                          <SelectItem value="zh-en">中英双语</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? '生成中...' : '生成邮件'}
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
                <TabsTrigger value="html" className="flex-1">
                  HTML
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="p-4">
                {generatedEmail ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedEmail }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    生成的邮件将在这里显示
                  </div>
                )}
              </TabsContent>
              <TabsContent value="html" className="p-4">
                {generatedEmail ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <code>{generatedEmail}</code>
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    生成的邮件 HTML 将在这里显示
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
              disabled={!generatedEmail}
            >
              复制
            </Button>
            <Button
              onClick={() => {
                // TODO: 发送邮件
              }}
              disabled={!generatedEmail}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 