import { NextResponse } from 'next/server';
import { QuotationData } from '@/types/quote';
import { generatePDF } from '@/lib/pdf';

export async function POST(request: Request) {
  try {
    const data: QuotationData = await request.json();
    const doc = generatePDF(data);
    const pdfBytes = doc.output('arraybuffer');
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation_${data.quoteNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 