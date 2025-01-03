import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_PROMPT = `你是一个专业的发票生成助手，可以帮助用户生成形式发票和商业发票。
根据用户提供的客户信息、金额和其他细节，生成一份格式规范的发票。
发票应该包含公司抬头、客户信息、金额、商品或服务描述等内容。
生成的内容应该采用HTML格式，使用适当的标签来格式化文本。
确保计算准确，并使用合适的货币符号。`;

const INVOICE_TYPES = {
  proforma: {
    title: '形式发票',
    description: '本发票仅作报价参考，不作为付款凭证。',
  },
  commercial: {
    title: '商业发票',
    description: '本发票作为实际交易凭证。',
  },
};

// 模拟数据，实际应该从数据库获取
const COMPANY_INFO = {
  company1: {
    name: '示例公司 1',
    address: '示例地址 1',
    phone: '12345678901',
    email: 'contact@example1.com',
  },
  company2: {
    name: '示例公司 2',
    address: '示例地址 2',
    phone: '12345678902',
    email: 'contact@example2.com',
  },
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

    const {
      type,
      invoiceNumber,
      date,
      customerName,
      customerAddress,
      amount,
      currency,
      description,
      letterhead,
      seal,
    } = await req.json();

    const company = COMPANY_INFO[letterhead as keyof typeof COMPANY_INFO];
    const invoiceType = INVOICE_TYPES[type as keyof typeof INVOICE_TYPES];

    // 构建提示词
    const prompt = `
请生成一份${invoiceType.title}，包含以下信息：

公司信息：
- 名称：${company.name}
- 地址：${company.address}
- 电话：${company.phone}
- 邮箱：${company.email}

客户信息：
- 名称：${customerName}
- 地址：${customerAddress}

发票信息：
- 发票号码：${invoiceNumber}
- 发票日期：${date}
- 金额：${amount} ${currency}
- 商品/服务描述：${description}

${invoiceType.description}

请生成一份美观的HTML格式发票，包含以下要求：
1. 使用适当的表格布局
2. 添加公司抬头和联系方式
3. 使用合适的字体大小和颜色
4. 确保数字格式正确（包含千位分隔符和小数点）
5. 预留印章位置
6. 添加发票底部的声明和条款
`;

    // 调用 XAI API 生成发票内容
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
    const generatedInvoice = data.choices[0].message.content;

    // 保存到数据库
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type,
        customerName,
        customerAddress,
        amount,
        currency,
        description,
        content: generatedInvoice,
        letterhead,
        seal,
        date,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      invoice: generatedInvoice,
      id: invoice.id,
    });
  } catch (error) {
    console.error('发票生成错误:', error);
    return NextResponse.json(
      { error: '发票生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 