import { NextRequest, NextResponse } from 'next/server';
import { getManualById, getAllSections } from '@/lib/knowledge-base';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const manual = getManualById(id);
    
    if (!manual) {
      return NextResponse.json({ error: 'Manual not found' }, { status: 404 });
    }

    const sections = getAllSections(manual);
    return NextResponse.json({ manual, sections });
  } catch (error) {
    console.error('Manual API error:', error);
    return NextResponse.json({ error: 'Failed to fetch manual' }, { status: 500 });
  }
}