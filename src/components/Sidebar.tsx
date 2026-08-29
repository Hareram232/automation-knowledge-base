'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, MessageSquare, BookOpen, Settings, ChevronLeft, ChevronRight, 
  Cpu, Monitor, Server, Zap, Radar, Database, Box, 
  FolderOpen, Search, History, Star, AlertTriangle, Info
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedManual?: any;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Chat', href: '/dashboard', icon: MessageSquare },
  { name: 'Manual Library', href: '/manuals', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const deviceTypes = [
  { type: 'PLC', icon: Cpu, count: 3 },
  { type: 'HMI', icon: Monitor, count: 3 },
  { type: 'SCADA', icon: Server, count: 3 },
  { type: 'VFD', icon: Zap, count: 3 },
  { type: 'Sensor', icon: Radar, count: 3 },
  { type: 'Controller', icon: Database, count: 2 },
];

export function Sidebar({ isOpen, onToggle, selectedManual, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative z-50 flex flex-col bg-industrial-darker border-r border-gray-700 transition-all duration-300',
        isOpen ? 'w-72' : 'w-20'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-industrial-accent/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-industrial-accent" />
            </div>
            {isOpen && (
              <span className="text-lg font-bold text-white">Automation KB</span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {isOpen && (
            <div className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </h3>
            </div>
          )}
          
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-industrial-accent/20 text-industrial-accent' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
                title={isOpen ? undefined : item.name}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Device Types */}
        {isOpen && (
          <div className="border-t border-gray-700 pt-3">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Device Types
            </h3>
            <div className="space-y-1">
              {deviceTypes.map(({ type, icon: Icon, count }) => (
                <div key={type}>
                  <button
                    onClick={() => setExpandedType(expandedType === type ? null : type)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors',
                      expandedType === type ? 'bg-gray-800' : 'hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-industrial-accent" />
                      <span className="font-medium text-white">{type}</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-full text-gray-300">
                      {count}
                    </span>
                  </button>
                  
                  {expandedType === type && (
                    <div className="mt-1 ml-8 space-y-1 border-l border-gray-700 pl-2">
                      {['Manual 1', 'Manual 2', 'Manual 3'].slice(0, count).map((m, i) => (
                        <button
                          key={i}
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isOpen && (
          <div className="border-t border-gray-700 pt-3">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-1 px-3">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Search className="w-5 h-5" />
                <span>Search All Manuals</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <History className="w-5 h-5" />
                <span>Recent Searches</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Star className="w-5 h-5" />
                <span>Bookmarked Sections</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Manual Detail */}
        {selectedManual && isOpen && (
          <div className="border-t border-gray-700 pt-3 p-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', 
                  selectedManual.deviceType === 'PLC' && 'bg-blue-500/20 text-blue-400',
                  selectedManual.deviceType === 'HMI' && 'bg-green-500/20 text-green-400',
                  selectedManual.deviceType === 'SCADA' && 'bg-purple-500/20 text-purple-400',
                  selectedManual.deviceType === 'VFD' && 'bg-orange-500/20 text-orange-400',
                  selectedManual.deviceType === 'Sensor' && 'bg-pink-500/20 text-pink-400',
                  selectedManual.deviceType === 'Controller' && 'bg-red-500/20 text-red-400'
                )}>
                  {selectedManual.deviceType}
                </span>
              </div>
              <h4 className="font-medium text-white truncate mb-1">{selectedManual.title}</h4>
              <p className="text-sm text-gray-400 mb-2">{selectedManual.manufacturer} • {selectedManual.model}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>{selectedManual.pages} pages</span>
                <span>•</span>
                <span>v{selectedManual.version}</span>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-2 px-3 text-sm text-industrial-accent hover:bg-industrial-accent/10 rounded transition-colors border border-industrial-accent/30"
              >
                Close Manual
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-gray-700">
          {isOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4" />
                <span>Powered by NVIDIA Nemotron 3 Ultra</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Always verify with official docs</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Info className="w-5 h-5 mx-auto" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}