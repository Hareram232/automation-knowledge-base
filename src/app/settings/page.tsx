'use client';

import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { Save, Key, Database, Brain, Globe, Shield, Bell, Moon, Sun, Monitor, HardDrive, BookOpen, Cpu } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'knowledge' | 'appearance' | 'notifications' | 'security'>('ai');
  const [settings, setSettings] = useState({
    // AI Settings
    model: 'nvidia/nvidia/nemotron-3-ultra-550b-a55b',
    temperature: 0.3,
    maxTokens: 4096,
    streaming: true,
    apiKey: '',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    
    // Knowledge Base
    autoIndex: true,
    maxSearchResults: 10,
    contextWindow: 4000,
    
    // Appearance
    theme: 'system',
    compactMode: false,
    showLineNumbers: true,
    
    // Notifications
    emailNotifications: false,
    pushNotifications: true,
    searchAlerts: false,
    
    // Security
    twoFactor: false,
    sessionTimeout: 60,
  });

  const tabs = [
    { id: 'ai', label: 'AI Model', icon: Brain },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('automation-kb-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-industrial-darkest flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
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
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>
          
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Tab Navigation */}
          <aside className="hidden lg:block w-48 bg-industrial-darker border-r border-gray-700 p-4">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    activeTab === id
                      ? 'bg-industrial-accent/20 text-industrial-accent'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {activeTab === 'ai' && (
              <SettingsSection title="AI Model Configuration" description="Configure the AI model and API settings">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <select
                      value={settings.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="input"
                    >
                      <option value="nvidia/nvidia/nemotron-3-ultra-550b-a55b">Nemotron 3 Ultra (NVIDIA Build API)</option>
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo (OpenAI)</option>
                      <option value="gpt-4o">GPT-4o (OpenAI)</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus (Anthropic)</option>
                      <option value="claude-3-sonnet-20240229">Claude 3 Sonnet (Anthropic)</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Select the AI model for chat responses</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Temperature</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.temperature}
                          onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                          className="flex-1 accent-industrial-accent"
                        />
                        <span className="text-sm text-gray-300 w-10">{settings.temperature.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Controls randomness (0 = deterministic, 1 = creative)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                      <input
                        type="number"
                        value={settings.maxTokens}
                        onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                        className="input"
                        min="512"
                        max="8192"
                        step="512"
                      />
                      <p className="text-sm text-gray-500 mt-1">Maximum response length</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.streaming}
                        onChange={(e) => handleChange('streaming', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-industrial-accent focus:ring-industrial-accent"
                      />
                      <span className="text-gray-300">Enable streaming responses</span>
                    </label>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      API Configuration
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input
                          type="password"
                          value={settings.apiKey}
                          onChange={(e) => handleChange('apiKey', e.target.value)}
                          placeholder="Enter your NVIDIA API key (or set NVIDIA_API_KEY env var)"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">Get your key at <a href="https://build.nvidia.com" target="_blank" rel="noopener" className="text-industrial-accent hover:underline">build.nvidia.com</a></p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Base URL</label>
                        <input
                          type="url"
                          value={settings.baseURL}
                          onChange={(e) => handleChange('baseURL', e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeTab === 'knowledge' && (
              <SettingsSection title="Knowledge Base" description="Configure search and retrieval settings">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={settings.autoIndex}
                        onChange={(e) => handleChange('autoIndex', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-industrial-accent focus:ring-industrial-accent"
                      />
                      <span className="text-gray-300">Auto-index new manuals on startup</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Search Results</label>
                      <input
                        type="number"
                        value={settings.maxSearchResults}
                        onChange={(e) => handleChange('maxSearchResults', parseInt(e.target.value))}
                        className="input"
                        min="5"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Context Window (tokens)</label>
                      <input
                        type="number"
                        value={settings.contextWindow}
                        onChange={(e) => handleChange('contextWindow', parseInt(e.target.value))}
                        className="input"
                        min="1000"
                        max="8000"
                        step="500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-gray-200 mb-4">Knowledge Base Stats</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Total Manuals" value="15" icon={BookOpen} />
                      <StatCard label="Total Pages" value="4,200+" icon={HardDrive} />
                      <StatCard label="Manufacturers" value="10" icon={Globe} />
                      <StatCard label="Device Types" value="6" icon={Cpu} />
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeTab === 'appearance' && (
              <SettingsSection title="Appearance" description="Customize the look and feel">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => handleChange('theme', theme)}
                          className={cn(
                            'p-4 rounded-lg border-2 transition-colors',
                            settings.theme === theme
                              ? 'border-industrial-accent bg-industrial-accent/10'
                              : 'border-gray-700 hover:border-gray-600'
                          )}
                        >
                          <div className={cn(
                            'w-full h-16 rounded mb-2',
                            theme === 'light' && 'bg-white',
                            theme === 'dark' && 'bg-gray-900',
                            theme === 'system' && 'bg-gradient-to-r from-white to-gray-900'
                          )} />
                          <span className="text-sm font-medium capitalize">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => handleChange('compactMode', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-industrial-accent focus:ring-industrial-accent"
                      />
                      <span className="text-gray-300">Compact mode (denser UI)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showLineNumbers}
                        onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-industrial-accent focus:ring-industrial-accent"
                      />
                      <span className="text-gray-300">Show line numbers in code blocks</span>
                    </label>
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeTab === 'notifications' && (
              <SettingsSection title="Notifications" description="Manage notification preferences">
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive email updates about new manuals and features' },
                      { key: 'pushNotifications', label: 'Push notifications', desc: 'Browser notifications for search results and updates' },
                      { key: 'searchAlerts', label: 'Search alerts', desc: 'Get notified when new content matches your saved searches' },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{label}</p>
                          <p className="text-sm text-gray-400">{desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(settings[key as keyof typeof settings])}
                          onChange={(e) => handleChange(key, e.target.checked)}
                          className="w-5 h-5 rounded border-gray-600 text-industrial-accent focus:ring-industrial-accent"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeTab === 'security' && (
              <SettingsSection title="Security" description="Manage security settings">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactor}
                        onChange={(e) => handleChange('twoFactor', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-industrial-accent/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-industrial-accent"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                      className="input w-32"
                      min="15"
                      max="480"
                      step="15"
                    />
                  </div>
                </div>
              </SettingsSection>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>
      <div className="card p-6">
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="card p-4 text-center">
      <Icon className="w-8 h-8 text-industrial-accent mx-auto mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}