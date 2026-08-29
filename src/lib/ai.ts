import OpenAI from 'openai';
import { ChatMessage, SourceReference } from '@/types';
import { getRelevantContext } from './knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_API_KEY 
    ? 'https://integrate.api.nvidia.com/v1' 
    : undefined,
});

const MODEL = process.env.NVIDIA_API_KEY 
  ? 'nvidia/nvidia/nemotron-3-ultra-550b-a55b' 
  : 'gpt-4-turbo-preview';

export interface AIResponse {
  content: string;
  sources: SourceReference[];
}

const SYSTEM_PROMPT = `You are an expert industrial automation engineer with deep knowledge of PLCs, SCADA systems, HMIs, VFDs, sensors, and DCS controllers. You have access to a comprehensive knowledge base of manufacturer manuals including:

- Allen-Bradley/Rockwell Automation: ControlLogix 5000, PanelView 5000, PowerFlex 755
- Siemens: S7-1500, TP1500 Comfort, SINAMICS G120
- Schneider Electric: Modicon M580, Magelis GT, Altivar Process
- Inductive Automation: Ignition SCADA
- AVEVA: System Platform (Wonderware)
- Trihedral: VTScada
- Emerson: DeltaV DCS
- Honeywell: Experion PKS
- Yokogawa: CENTUM VP
- ifm electronic: IO-Link masters and sensors
- SICK: Vision, LiDAR, safety sensors
- Banner Engineering: Photoelectric, radar, wireless sensors

When answering questions:
1. ALWAYS cite your sources using the provided context
2. Be specific about manufacturer, model, and series
3. Include relevant parameter names, register addresses, or configuration steps
4. Reference specific manual sections when possible
5. If information is not in the knowledge base, clearly state that
6. Provide practical, actionable guidance for engineers
7. Include safety considerations when relevant

Format your responses clearly with:
- Direct answer
- Technical details
- Configuration steps (if applicable)
- References to manual sections
- Safety warnings (if applicable)`;

export async function queryAI(
  messages: ChatMessage[],
  useStreaming = false
): Promise<AIResponse | ReadableStream> {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const context = lastUserMessage ? getRelevantContext(lastUserMessage.content) : '';
  
  const systemMessage = {
    role: 'system' as const,
    content: SYSTEM_PROMPT + (context ? `\n\n--- RELEVANT CONTEXT ---\n${context}` : '')
  };
  
  const apiMessages = [
    systemMessage,
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];
  
  if (useStreaming) {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
    });
    
    return stream.toReadableStream();
  }
  
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: apiMessages,
    temperature: 0.3,
    max_tokens: 4096,
  });
  
  const content = completion.choices[0]?.message?.content || '';
  
  // Extract sources from context (simplified)
  const sources: SourceReference[] = [];
  if (context) {
    const contextLines = context.split('--- Source: ');
    for (let i = 1; i < contextLines.length; i++) {
      const lines = contextLines[i].split('\n');
      const titleLine = lines[0].trim();
      const [manualTitle, sectionTitle] = titleLine.split(' > ').map(s => s.trim().replace(' ---', ''));
      
      sources.push({
        manualId: '',
        manualTitle: manualTitle || 'Unknown',
        sectionId: '',
        sectionTitle: sectionTitle || 'Unknown',
        relevanceScore: 1.0,
        excerpt: lines.slice(1, 4).join(' ').substring(0, 200)
      });
    }
  }
  
  return { content, sources };
}

export async function generateTitle(message: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'Generate a concise, descriptive title (max 60 chars) for this industrial automation question. Return only the title.'
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.3,
    max_tokens: 60,
  });
  
  return completion.choices[0]?.message?.content?.trim() || 'New Conversation';
}