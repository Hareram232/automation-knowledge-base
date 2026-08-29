import { NextRequest, NextResponse } from 'next/server';
import { queryAI, AIResponse } from '@/lib/ai';
import { ChatMessage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { messages, stream } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }
    
    const formattedMessages: ChatMessage[] = messages.map((m, i) => ({
      id: m.id || `msg-${i}`,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      sources: m.sources
    }));
    
    if (stream) {
      const streamResult = await queryAI(formattedMessages, true) as ReadableStream;
      
      return new NextResponse(streamResult, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }
    
    const result = await queryAI(formattedMessages, false) as AIResponse;
    
    return NextResponse.json({
      content: result.content,
      sources: result.sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}