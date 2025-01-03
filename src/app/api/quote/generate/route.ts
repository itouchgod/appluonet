import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_PROMPT = `你是一个专业的报价单生成助手，可以帮助用户生成专业的报价单。
根据用户提供的客户信息、产品信息和其他细节，生成一份格式规范的报价单。
报价单应该包含公司信息、客户信息、产品列表、总价、备注等内容。
生成的内容应该采用HTML格式，使用适当的标签来格式化文本。
确保计算准确，并使用合适的货币符号。`;

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

    const {
      customerName,
      customerEmail,
      customerAddress,
      quoteNumber,
      validUntil,
      currency,
      products,
      notes,
    } = await req.json();

    // 计算总价
    const total = products.reduce(
      (sum: number, product: any) =>
        sum + product.quantity * product.unitPrice,
      0
    );

    // 构建提示词
    const prompt = `
请生成一份报价单，包含以下信息：

客户信息：
- 名称：${customerName}
- 邮箱：${customerEmail}
- 地址：${customerAddress}

报价单信息：
- 报价单号：${quoteNumber}
- 有效期至：${validUntil}
- 货币：${currency}

产品列表：
${products
  .map(
    (product: any) => `
- ${product.name}
  描述：${product.description || '无'}
  数量：${product.quantity} ${product.unit}
  单价：${product.unitPrice}
  小计：${product.quantity * product.unitPrice}
`
  )
  .join('\n')}

总价：${total}

${notes ? `备注：${notes}` : ''}

请生成一份美观的HTML格式报价单，包含以下要求：
1. 使用适当的表格布局展示产品列表
2. 添加公司抬头和联系方式
3. 使用合适的字体大小和颜色
4. 确保数字格式正确（包含千位分隔符和小数点）
5. 添加报价单底部的条款和条件
`;

    // 调用 XAI API 生成报价单内容
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
    const generatedQuote = data.choices[0].message.content;

    // 保存到数据库
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerName,
        customerEmail,
        customerAddress,
        validUntil,
        currency,
        totalAmount: total,
        content: generatedQuote,
        notes: notes || '',
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      quote: generatedQuote,
      id: quote.id,
    });
  } catch (error) {
    console.error('报价单生成错误:', error);
    return NextResponse.json(
      { error: '报价单生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 