import { NextRequest, NextResponse } from 'next/server';
import { getAllManuals, searchManuals, getKnowledgeBaseStats } from '@/lib/knowledge-base';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || '';
    const manufacturer = searchParams.get('manufacturer') || '';

    if (!query && !type && !manufacturer) {
      const manuals = getAllManuals();
      let filtered = manuals;

      if (type) {
        filtered = filtered.filter(m => m.deviceType === type);
      }
      if (manufacturer) {
        filtered = filtered.filter(m => m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase()));
      }

      return NextResponse.json({ manuals: filtered });
    }

    if (query) {
      const results = searchManuals(query, limit);
      return NextResponse.json({ results });
    }

    const manuals = getAllManuals();
    let filtered = manuals;

    if (type) {
      filtered = filtered.filter(m => m.deviceType === type);
    }
    if (manufacturer) {
      filtered = filtered.filter(m => m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase()));
    }

    return NextResponse.json({ manuals: filtered });
  } catch (error) {
    console.error('Manuals API error:', error);
    return NextResponse.json({ error: 'Failed to fetch manuals' }, { status: 500 });
  }
}