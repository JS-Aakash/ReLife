import { NextRequest, NextResponse } from 'next/server';
import { diagnoseRepairVsReplace } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, purchasePrice, productAgeYears, faultDescription } = body;

    const diagnosis = await diagnoseRepairVsReplace(
      productName || 'Hardware Asset',
      category || 'other',
      Number(purchasePrice) || 800,
      Number(productAgeYears) || 2,
      faultDescription || 'Component diagnostic review and assessment'
    );

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error('Copilot diagnostic error, serving deterministic fallback:', error);
    const fallback = await diagnoseRepairVsReplace(
      'Hardware Asset',
      'other',
      800,
      2,
      'Power supply and component wear review'
    );
    return NextResponse.json(fallback);
  }
}
