powershell -NoProfile -Command "$path='src\components\ChatInterface.tsx'; $newFunc=@'
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
        throw new Error(err.error ?? \`HTTP \${resp.status}\`);
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
            ? { ...m, content: \`⚠️ \${err.message}\`, isStreaming: false }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };
'@ ; $path='src\components\ChatInterface.tsx'; $c=Get-Content \$path -Raw; \$pattern='(?s)const handleSubmit = async \(e: React\.FormEvent\) => \{.*?\n  \};'; \$new=\$c -replace \$pattern,\$newFunc; Set-Content \$path -Value \$new -Encoding UTF8"