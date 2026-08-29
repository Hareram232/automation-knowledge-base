'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { ManualBrowser } from '@/components/ManualBrowser';
import { Manual } from '@/types';
import { useState } from 'react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'manuals' | 'split'>('split');

  return (
    <div className="min-h-screen bg-industrial-darkest flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedManual={selectedManual}
        onClose={() => setSelectedManual(null)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-industrial-darker border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              Industrial Automation Knowledge Base
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {['chat', 'split', 'manuals'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode 
                      ? 'bg-industrial-accent text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {mode === 'chat' && 'Chat'}
                  {mode === 'manuals' && 'Manuals'}
                  {mode === 'split' && 'Split'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode !== 'manuals' && (
            <div className={`flex-1 ${viewMode === 'split' ? 'lg:w-1/2' : ''} flex flex-col min-w-0`}>
              <ChatInterface />
            </div>
          )}
          
          {viewMode !== 'chat' && (
            <div className={`flex-1 ${viewMode === 'split' ? 'lg:w-1/2' : ''} flex flex-col min-w-0 border-l border-gray-700`}>
              <ManualBrowser
                onSelectManual={setSelectedManual}
                onSelectSection={(manual, section) => {
                  setSelectedManual(manual);
                  // Could open section detail view
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}