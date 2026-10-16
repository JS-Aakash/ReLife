import { NextRequest, NextResponse } from 'next/server';
import { diagnoseRepairVsReplace } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, purchasePrice, productAgeYears, faultDescription } = body;

    if (!faultDescription) {
      return NextResponse.json(
        { error: 'Fault description is required' },
        { status: 400 }
      );
    }

    const diagnosis = await diagnoseRepairVsReplace(
      productName || 'Device',
      category || 'other',
      Number(purchasePrice) || 0,
      Number(productAgeYears) || 2,
      faultDescription
    );

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error('Copilot diagnostic error:', error);
    return NextResponse.json(
      { error: 'Failed to process diagnostic inquiry' },
      { status: 500 }
    );
  }
}
