'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Manual, ManualSection, SearchResult } from '@/types';
import { cn, formatDate, getDeviceTypeColor, getDeviceTypeIcon, truncate } from '@/lib/utils';
import { ChevronRight, ChevronDown, Search, Filter, BookOpen, Tag, Clock, FileText, Download, ExternalLink, Loader2, X } from 'lucide-react';

interface ManualBrowserProps {
  onSelectManual?: (manual: Manual) => void;
  onSelectSection?: (manual: Manual, section: ManualSection) => void;
}

export function ManualBrowser({ onSelectManual, onSelectSection }: ManualBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [expandedManuals, setExpandedManuals] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch manuals on mount
  useEffect(() => {
    fetchManuals();
  }, []);

  const fetchManuals = async () => {
    try {
      const res = await fetch('/api/manuals');
      const data = await res.json();
      const manualsData = (data.manuals || []) as Manual[];
      setManuals(manualsData);
      
      const mfrs = Array.from(new Set(manualsData.map((m: Manual) => m.manufacturer))).sort();
      const types = Array.from(new Set(manualsData.map((m: Manual) => m.deviceType))).sort();
      setManufacturers(mfrs);
      setDeviceTypes(types);
    } catch (error) {
      console.error('Failed to fetch manuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/manuals/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const filteredManuals = useMemo(() => {
    let result = manuals;
    
    if (selectedType !== 'all') {
      result = result.filter(m => m.deviceType === selectedType);
    }
    
    if (selectedManufacturer !== 'all') {
      result = result.filter(m => m.manufacturer === selectedManufacturer);
    }
    
    return result;
  }, [manuals, selectedType, selectedManufacturer]);

  const handleToggleManual = (manualId: string) => {
    setExpandedManuals(prev => {
      const next = new Set(prev);
      if (next.has(manualId)) next.delete(manualId);
      else next.add(manualId);
      return next;
    });
  };

  const getAllSections = (manual: Manual): ManualSection[] => {
    const sections: ManualSection[] = [];
    const collect = (secs: ManualSection[]) => {
      for (const s of secs) {
        sections.push(s);
        if (s.subsections) collect(s.subsections);
      }
    };
    collect(manual.content);
    return sections;
  };

  // Show search results when searching
  if (searchQuery.trim() && (searchResults.length > 0 || isSearching)) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 bg-industrial-dark">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Search className="w-4 h-4" />
            <span>Search results for "{searchQuery}" - {searchResults.length} matches</span>
            <button 
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="ml-auto p-1 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-industrial-accent animate-spin" />
            </div>
          )}
          {searchResults.map((result, i) => (
            <div 
              key={i}
              onClick={() => onSelectSection?.(result.manual, result.section)}
              className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-industrial-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className={cn('px-2 py-0.5 rounded', getDeviceTypeColor(result.manual.deviceType))}>
                      {result.manual.deviceType}
                    </span>
                    <span className="text-gray-500">{result.manual.manufacturer}</span>
                    <span className="text-industrial-accent">{Math.round(result.score * 10)}% match</span>
                  </div>
                  <h4 className="font-medium text-white truncate">{result.manual.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{result.section.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.section.content.substring(0, 200)}...</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
            </div>
          ))}
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 bg-industrial-dark">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-industrial-accent" />
            Technical Manuals
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-industrial-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-industrial-darker rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-industrial-dark">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-industrial-accent" />
            Technical Manuals
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded', viewMode === 'list' ? 'bg-industrial-accent/20 text-industrial-accent' : 'text-gray-500 hover:text-white')}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded', viewMode === 'grid' ? 'bg-industrial-accent/20 text-industrial-accent' : 'text-gray-500 hover:text-white')}
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search manuals, sections, keywords..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-industrial-accent"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-industrial-accent whitespace-nowrap"
            >
              <option value="all">All Types</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-industrial-accent whitespace-nowrap"
            >
              <option value="all">All Manufacturers</option>
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Manual List */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' ? (
          <div className="p-4 space-y-3">
            {filteredManuals.map(manual => (
              <ManualCard
                key={manual.id}
                manual={manual}
                isExpanded={expandedManuals.has(manual.id)}
                onToggle={() => handleToggleManual(manual.id)}
                onSelect={() => onSelectManual?.(manual)}
                onSelectSection={onSelectSection}
              />
            ))}
            {filteredManuals.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No manuals match your filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredManuals.map(manual => (
              <ManualGridCard
                key={manual.id}
                manual={manual}
                onSelect={() => onSelectManual?.(manual)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManualCard({ manual, isExpanded, onToggle, onSelect, onSelectSection }: {
  manual: Manual;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onSelectSection?: (manual: Manual, section: ManualSection) => void;
}) {
  const getAllSections = (manual: Manual): ManualSection[] => {
    const sections: ManualSection[] = [];
    const collect = (secs: ManualSection[]) => {
      for (const s of secs) {
        sections.push(s);
        if (s.subsections) collect(s.subsections);
      }
    };
    collect(manual.content);
    return sections;
  };

  const sections = getAllSections(manual);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between gap-4 text-left hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', getDeviceTypeColor(manual.deviceType).replace('text-', 'bg-').replace('bg-', 'bg-').replace('100', '100'))}>
            <span className="text-2xl">{getDeviceTypeIcon(manual.deviceType)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getDeviceTypeColor(manual.deviceType))}>
                {manual.deviceType}
              </span>
              <span className="text-xs text-gray-500">{manual.manufacturer}</span>
              <span className="text-xs text-gray-500">{manual.series}</span>
            </div>
            <h3 className="font-medium text-white truncate pr-8">{manual.title}</h3>
            <p className="text-sm text-gray-400 truncate">{manual.model}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {manual.pages} pages</span>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {manual.category}</span>
              <span className="flex items-center gap-1">v{manual.version}</span>
            </div>
          </div>
        </div>
        <ChevronDown className={cn('w-5 h-5 text-gray-400 flex-shrink-0 transition-transform', isExpanded && 'rotate-180')} />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-700 bg-gray-900/50 p-4" style={{ animation: 'slideUp 0.2s ease-out' }}>
          <div className="space-y-2">
            {sections.map((section, i) => (
              <button
                key={section.id}
                onClick={(e) => { e.stopPropagation(); onSelectSection?.(manual, section); }}
                className="w-full p-3 text-left rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate pr-4">{section.title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{section.content.substring(0, 150)}...</p>
              </button>
            ))}
            <button
              onClick={onSelect}
              className="w-full py-2 px-4 text-center text-industrial-accent hover:bg-industrial-accent/10 rounded-lg transition-colors border border-industrial-accent/30"
            >
              View Full Manual →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ManualGridCard({ manual, onSelect }: { manual: Manual; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-industrial-accent/50 hover:bg-gray-800 transition-all text-left group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getDeviceTypeColor(manual.deviceType).replace('text-', 'bg-'))}>
          <span className="text-xl">{getDeviceTypeIcon(manual.deviceType)}</span>
        </div>
        <span className={cn('px-2 py-1 rounded text-xs font-medium', getDeviceTypeColor(manual.deviceType))}>
          {manual.deviceType}
        </span>
      </div>
      <h3 className="font-medium text-white mb-1 line-clamp-1 group-hover:text-industrial-accent transition-colors">{manual.title}</h3>
      <p className="text-sm text-gray-400 mb-1">{manual.manufacturer} • {manual.series}</p>
      <p className="text-xs text-gray-500 mb-2">{manual.model}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-700 pt-3">
        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {manual.pages}p</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(manual.lastUpdated)}</span>
      </div>
    </button>
  );
}