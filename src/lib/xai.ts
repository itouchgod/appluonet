import { ChatCompletionCreateParams } from 'openai/resources/chat';

const API_KEY = process.env.XAI_API_KEY;
const API_URL = 'https://api.x.ai/v1/chat/completions';

const SYSTEM_PROMPT = `你是一位专业的邮件助手，可以帮助用户生成和优化各种类型的商务邮件。
请根据用户提供的内容，生成专业、得体的邮件。

邮件生成规则：
1. 根据指定的语言(中文/英文/中英双语)生成邮件
2. 根据指定的语气(正式/专业/友好等)调整邮件风格
3. 确保邮件格式规范，包含适当的称谓、正文和结尾
4. 使用 [Subject]、[English]、[中文] 等标记来分隔不同部分
5. 保持邮件内容简洁明了，重点突出
6. 确保语言表达专业、礼貌、得体

输出格式示例：
[Subject] 邮件主题

[English]
Dear xxx,
...
Best regards,
Name

[中文]
尊敬的xxx：
...
此致
敬礼
姓名`;

export interface EmailGenerateParams {
  mode: 'mail' | 'reply';
  type: string;
  language: string;
  content: string;
  originalMail?: string;
  userName?: string;
}

export async function generateEmail(params: EmailGenerateParams) {
  const { mode, type, language, content, originalMail, userName } = params;

  // 构建用户提示词
  const userPrompt = mode === 'mail'
    ? `请根据以下内容生成一封${language}的${type}邮件：\n\n${content}`
    : `请根据以下邮件内容生成一个${language}的${type}回复：\n\n原始邮件：\n${originalMail}\n\n回复要点：\n${content}`;

  // 构建请求消息
  const messages: ChatCompletionCreateParams.Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];

  // 如果有用户名，添加到系统提示中
  if (userName) {
    messages[0].content += `\n\n当前用户：${userName}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-api-version': '2023-07-01'
      },
      body: JSON.stringify({
        messages,
        model: 'x-magister-7b',
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('XAI API 调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('XAI API Error:', error);
    throw error;
  }
} 