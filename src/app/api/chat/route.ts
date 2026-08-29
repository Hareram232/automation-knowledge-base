// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryAI, AIResponse } from '@/lib/ai';
import { ChatMessage } from '@/types';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: '`messages` must be a non‑empty array' }, { status: 400 });
    }

    const formatted: ChatMessage[] = messages.map((m, i) => ({
      id: m.id ?? `msg-${i}`,
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      sources: m.sources,
    }));

    if (stream) {
      const streamResult = await queryAI(formatted, true) as ReadableStream;
      return new NextResponse(streamResult, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    const result = await queryAI(formatted, false) as AIResponse;
    return NextResponse.json({
      content: result.content,
      sources: result.sources ?? [],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[chat API] ❌', err);
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}