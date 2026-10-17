import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceData } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64OrText, fileName } = body;

    const result = await extractInvoiceData(imageBase64OrText || '', fileName || 'invoice.pdf');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Invoice scanning error, serving deterministic fallback:', error);
    const fallback = await extractInvoiceData('', 'invoice.pdf');
    return NextResponse.json(fallback);
  }
}
