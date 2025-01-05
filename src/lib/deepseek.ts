import OpenAI from 'openai';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable');
}

// 创建 OpenAI 客户端实例
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

interface GenerateMailOptions {
  content: string;
  language: string;
  type: string;
  originalMail?: string;
  mode: 'mail' | 'reply';
}

export async function generateMail({
  content,
  language,
  type,
  originalMail = '',
  mode
}: GenerateMailOptions): Promise<string> {
  try {
    // 构建系统提示词
    const systemPrompt = mode === 'mail' 
      ? `You are a professional business email assistant. Help users write business emails in ${language}. 
         The tone should be ${type}. Focus on clarity, professionalism, and cultural appropriateness.`
      : `You are a professional business email assistant. Help users reply to business emails in ${language}. 
         The tone should be ${type}. Ensure the reply is contextually appropriate and professional.`;

    // 构建用户提示词
    const userPrompt = mode === 'mail'
      ? `Please help me write a business email with the following content: ${content}`
      : `Please help me reply to this email:\n\nOriginal email:\n${originalMail}\n\nMy reply draft:\n${content}`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    throw new Error(error instanceof Error ? error.message : '生成失败，请稍后重试');
  }
} 