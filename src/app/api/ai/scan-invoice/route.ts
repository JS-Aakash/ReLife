import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceData } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64OrText, fileName } = body;

    if (!imageBase64OrText && !fileName) {
      return NextResponse.json(
        { error: 'Provide an image payload or document file name' },
        { status: 400 }
      );
    }

    const result = await extractInvoiceData(imageBase64OrText || '', fileName);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Invoice scanning error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
