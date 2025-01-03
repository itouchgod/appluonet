import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { QuotationData } from '@/types/quote';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const quotationData: QuotationData = {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      from: data.from || session.user?.name || '',
      items: data.items || [],
      notes: data.notes || [
        'Delivery time: 30 days',
        'Price based on EXW-Shanghai, Mill TC',
        'Delivery terms: as mentioned above, subj to unsold',
        'Payment term: 50% deposit, the balance paid before delivery',
        'Validity: 5 days'
      ],
      amountInWords: {
        dollars: 'ZERO',
        cents: '',
        hasDecimals: false
      },
      bankInfo: data.bankInfo || '',
      showDescription: data.showDescription || false,
      showRemarks: data.showRemarks || false
    };

    // TODO: Save order confirmation to database
    
    return NextResponse.json(quotationData);
  } catch (error) {
    console.error('Error generating order confirmation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 