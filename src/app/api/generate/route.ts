import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

interface APIError {
  message: string;
  status?: number;
}

const BASE_URL = 'https://api.deepseek.com';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API 密钥未配置，请联系管理员' },
        { status: 500 }
      );
    }

    const { content, language, type, originalMail = '', mode } = await request.json();

    const systemPrompt = mode === 'mail' 
      ? `You are a professional business email assistant. Help users write business emails in ${language}. 
         The tone should be ${type}. Focus on clarity, professionalism, and cultural appropriateness.
         Please format the output with clear sections:
         1. For bilingual emails, use [English] and [中文] to separate languages
         2. Start with [Subject] for email subject
         3. Use proper spacing between sections`
      : `You are a professional business email assistant. Help users reply to business emails in ${language}. 
         The tone should be ${type}. Ensure the reply is contextually appropriate and professional.
         Please format the output with clear sections:
         1. For bilingual emails, use [English] and [中文] to separate languages
         2. Use proper spacing between sections`;

    const userPrompt = mode === 'mail'
      ? `Please help me write a business email with the following content: ${content}`
      : `Please help me reply to this email:\n\nOriginal email:\n${originalMail}\n\nMy reply draft:\n${content}`;

    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} of ${maxRetries + 1}`);
        
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Accept': 'application/json',
            'User-Agent': 'Vercel Edge Function'
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 800,
            presence_penalty: 0,
            frequency_penalty: 0,
            stream: false
          })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: text
          });
          throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('API 返回数据格式错误');
        }

        return NextResponse.json({ result: data.choices[0].message.content });
        
      } catch (error: unknown) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        
        const err = error as APIError;
        
        if (err.message?.includes('504') || err.message?.includes('408')) {
          if (retryCount === maxRetries) {
            return NextResponse.json(
              { error: '服务器响应超时，请稍后重试' },
              { status: 504 }
            );
          }
          await new Promise(resolve => setTimeout(resolve, 3000 * (retryCount + 1)));
          retryCount++;
          continue;
        }
        
        if (err.message?.includes('429')) {
          return NextResponse.json(
            { error: '请求过于频繁，请稍后重试' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: err.message || '生成失败，请稍后重试' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: '达到最大重试次数' },
      { status: 500 }
    );
    
  } catch (error: unknown) {
    console.error('Final Error:', error);
    const err = error as APIError;
    return NextResponse.json(
      { error: err.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 