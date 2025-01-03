import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const SYSTEM_PROMPT = `你是一个专业的邮件助手，可以帮助用户生成各种类型的商务邮件。
根据用户提供的主题、内容要点和语气要求，生成一封专业的邮件。
邮件应该包含适当的称谓、正文和结尾。
生成的内容应该采用HTML格式，使用适当的标签来格式化文本。`;

const TONE_PROMPTS = {
  professional: '使用专业、正式的语气，突出专业性和可信度。',
  friendly: '使用友好、亲切的语气，保持专业但更加平易近人。',
  formal: '使用非常正式的语气，适合重要的商务沟通。',
};

const LANGUAGE_PROMPTS = {
  zh: '请用中文撰写邮件。',
  en: 'Please write the email in English.',
  'zh-en': '请用中文和英文撰写邮件，先中文后英文。',
};

export async function POST(req: Request) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { recipient, subject, content, tone, language } = await req.json();

    // 构建提示词
    const prompt = `
收件人: ${recipient}
主题: ${subject}
内容要点:
${content}

${TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS]}
${LANGUAGE_PROMPTS[language as keyof typeof LANGUAGE_PROMPTS]}

请生成一封完整的邮件，使用HTML格式。
`;

    // 调用 XAI API 生成邮件内容
    const response = await fetch(process.env.XAI_CHAT_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_CHAT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('AI 服务调用失败');
    }

    const data = await response.json();
    const generatedEmail = data.choices[0].message.content;

    // 保存到数据库（可选）
    // TODO: 将生成的邮件保存到数据库

    return NextResponse.json({ email: generatedEmail });
  } catch (error) {
    console.error('邮件生成错误:', error);
    return NextResponse.json(
      { error: '邮件生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 