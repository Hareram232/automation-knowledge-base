
import OpenAI from 'openai';
import { ChatMessage, SourceReference } from '@/types';
import { getRelevantContext } from './knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';

const SYSTEM_PROMPT = `You are an expert industrial automation engineer with deep knowledge of PLCs, SCADA, HMIs, VFDs, sensors, and DCS controllers. You have access to a comprehensive knowledge base of manufacturer manuals. When answering: 1) ALWAYS cite sources from the provided context. 2) Be specific about manufacturer, model, series. 3) Include parameter names, register addresses, or configuration steps. 4) Reference manual sections when possible. 5) If information is not in the knowledge base, clearly state that. 6) Provide practical, actionable guidance. 7) Include safety considerations when relevant.`;

export interface AIResponse {
  content: string;
  sources: SourceReference[];
}

export async function queryAI(
  messages: ChatMessage[],
  useStreaming = false
): Promise<AIResponse | ReadableStream> {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  const context = lastUserMessage ? getRelevantContext(lastUserMessage.content) : '';

  const systemMessage = {
    role: 'system' as const,
    content: SYSTEM_PROMPT + (context ? `\n\n--- RELEVANT CONTEXT ---\n${context}` : ''),
  };

  const apiMessages = [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content }))];

  if (useStreaming) {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
    });
    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content ?? '';
          if (content) controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: apiMessages,
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content ?? '';

  const sources: SourceReference[] = [];
  if (context) {
    const lines = context.split('--- Source: ');
    for (let i = 1; i < lines.length; i++) {
      const [titleLine, ...rest] = lines[i].split('\n');
      const [manualTitle, sectionTitle] = titleLine.replace(' ---', '').split(' > ').map(s => s.trim());
      sources.push({
        manualId: '',
        manualTitle: manualTitle || 'Unknown',
        sectionId: '',
        sectionTitle: sectionTitle || 'Unknown',
        relevanceScore: 1.0,
        excerpt: rest.slice(0, 3).join(' ').substring(0, 200),
      });
    }
  }

  return { content, sources };
}

export async function generateTitle(message: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: 'Generate a concise, descriptive title (max 60 chars) for this industrial automation question. Return only the title.' },
      { role: 'user', content: message },
    ],
    temperature: 0.3,
    max_tokens: 60,
  });
  return completion.choices[0]?.message?.content?.trim() || 'New Conversation';
}