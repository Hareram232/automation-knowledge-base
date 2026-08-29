'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, SourceReference } from '@/types';
import { cn, generateId, formatDate } from '@/lib/utils';
import { Send, Bot, User, Copy, Check, Loader2, Paperclip, X, ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
}

export function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error ?? `HTTP ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...m, content: full } : m));
        }
      }

      // Fetch sources after stream
      const srcResp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage, { ...assistantMessage, content: full }],
          stream: false,
        }),
      });
      const srcData = await srcResp.json().catch(() => ({ sources: [] }));

      setMessages(prev => prev.map(m =>
        m.id === assistantMessage.id
          ? { ...m, content: full, isStreaming: false, sources: srcData.sources ?? [] }
          : m
      ));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: `⚠️ ${err.message}`, isStreaming: false }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const toggleSources = (messageId: string) => {
    setShowSources(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="flex flex-col h-full bg-industrial-darker rounded-xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-industrial-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-industrial-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-industrial-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Automation AI Assistant</h2>
            <p className="text-xs text-gray-400">Powered by Nemotron 3 Ultra • Industrial Knowledge Base</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            isStreaming ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          )}>
            {isStreaming ? 'Streaming' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={messagesEndRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Welcome to the Automation Knowledge Base</h3>
            <p className="text-sm text-center max-w-md mb-6">
              Ask me anything about PLCs, SCADA, HMIs, VFDs, sensors, or DCS systems. 
              I have access to manufacturer manuals and can provide specific configuration guidance.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'How do I configure EtherNet/IP on ControlLogix 5580?',
                'What are the safety functions in SINAMICS G120?',
                'How to set up MQTT in Ignition SCADA?',
                'Explain DeltaV CHARMs I/O architecture'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(suggestion); handleSubmit(new Event('submit') as any); }}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={message.id} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              message.role === 'user' 
                ? 'bg-industrial-accent/20 text-industrial-accent' 
                : 'bg-blue-500/20 text-blue-400'
            )}>
              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={cn(
              'flex-1 max-w-[85%]',
              message.role === 'user' ? 'text-right' : 'text-left'
            )}>
              <div className={cn(
                'px-4 py-3 rounded-2xl',
                message.role === 'user'
                  ? 'bg-industrial-accent/10 border border-industrial-accent/20 rounded-tr-none'
                  : 'bg-gray-800/50 border border-gray-700 rounded-tl-none'
              )}>
                <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleSources(message.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Sources ({message.sources.length}){' '}
                      {showSources[message.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    {showSources[message.id] && (
                      <div className="mt-2 space-y-2" style={{ animation: 'slideUp 0.2s ease-out' }}>
                        {message.sources.map((source, i) => (
                          <div key={i} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-300">{source.manualTitle}</span>
                              <span className="text-industrial-accent">{Math.round(source.relevanceScore * 100)}%</span>
                            </div>
                            <div className="text-gray-500">{source.sectionTitle}</div>
                            <div className="mt-1 text-gray-400 line-clamp-2">{source.excerpt}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-1 text-xs text-gray-500">
                <span>{formatDate(message.timestamp.toISOString())}</span>
                <button
                  onClick={() => handleCopy(message.content)}
                  className="p-1 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-industrial-dark">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? 'AI is responding...' : 'Ask about PLCs, SCADA, HMIs, VFDs, sensors, DCS...'}
              disabled={isLoading}
              rows={1}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent resize-none max-h-32"
              style={{ height: 'auto' }}
            />
          </div>
          
          {isLoading ? (
            <button
              onClick={handleStop}
              className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
              title="Stop generation"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-12 h-12 rounded-xl bg-industrial-accent text-white hover:bg-industrial-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Shift+Enter for new line • Enter to send • Powered by NVIDIA Nemotron 3 Ultra
        </p>
      </div>
    </div>
  );
}