'use client';

import { Sidebar } from '@/components/Sidebar';
import { ManualBrowser } from '@/components/ManualBrowser';
import { Manual } from '@/types';
import { useState } from 'react';

export default function ManualsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  return (
    <div className="min-h-screen bg-industrial-darkest flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedManual={selectedManual}
        onClose={() => setSelectedManual(null)}
      />

      <main className="flex-1 flex flex-col min-w-0">
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
            <h1 className="text-xl font-bold text-white">Manual Library</h1>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ManualBrowser
            onSelectManual={setSelectedManual}
            onSelectSection={(manual, section) => {
              setSelectedManual(manual);
            }}
          />
        </div>
      </main>
    </div>
  );
}