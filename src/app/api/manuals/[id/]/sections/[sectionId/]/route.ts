import { NextRequest, NextResponse } from 'next/server';
import { getManualSection } from '@/lib/knowledge-base';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const section = getManualSection(id, sectionId);
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error('Section API error:', error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}