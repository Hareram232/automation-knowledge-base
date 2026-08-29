import manualsData from './manuals-data.json';
import { Manual, ManualSection, SearchResult, KnowledgeBaseStats } from '@/types';

// Type the imported data
interface ManualsData {
  manuals: Manual[];
  searchIndex: Array<{
    manualId: string;
    manualTitle: string;
    manufacturer: string;
    deviceType: string;
    model: string;
    series: string;
    version: string;
    sectionId: string;
    sectionTitle: string;
    sectionContent: string;
    sectionLevel: number;
  }>;
  generatedAt: string;
}

const typedData = manualsData as ManualsData;
const MANUALS_CACHE = typedData.manuals;
const SEARCH_INDEX = typedData.searchIndex;

export function getAllManuals(): Manual[] {
  return MANUALS_CACHE;
}

export function getManualById(id: string): Manual | undefined {
  return MANUALS_CACHE.find(m => m.id === id);
}

export function getManualsByType(type: Manual['deviceType']): Manual[] {
  return MANUALS_CACHE.filter(m => m.deviceType === type);
}

export function getManualsByManufacturer(manufacturer: string): Manual[] {
  return MANUALS_CACHE.filter(m =>
    m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

export function searchManuals(query: string, limit = 10): SearchResult[] {
  const results: SearchResult[] = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const item of SEARCH_INDEX) {
    const sectionText = `${item.sectionTitle} ${item.sectionContent}`.toLowerCase();
    let score = 0;
    const matchedTerms: string[] = [];

    for (const term of query.toLowerCase().split(/\s+/).filter(t => t.length > 1)) {
      const count = (item.sectionTitle.toLowerCase().match(new RegExp(term, 'g')) || []).length +
                     (item.sectionContent.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      if (count > 0) {
        score += count;
        matchedTerms.push(term);
      }
    }

    // Boost for title matches
    if (item.manualTitle.toLowerCase().includes(query.toLowerCase())) score += 5;

    if (score > 0) {
      // Find the actual manual and section objects
      const manual = MANUALS_CACHE.find(m => m.id === item.manualId);
      const section = manual?.content.find(s => s.id === item.sectionId) || 
                     (() => {
                       function find(s) {
                         for (const sec of s) {
                           if (sec.id === item.sectionId) return sec;
                           if (sec.subsections) {
                             const found = find(sec.subsections);
                             if (found) return found;
                           }
                         }
                         return undefined;
                       }
                       return find(MANUALS_CACHE.find(m => m.id === item.manualId)?.content || []);
                     })();

      if (manual && section) {
        results.push({ manual, section, score, matchedTerms: [] });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function getKnowledgeBaseStats(): KnowledgeBaseStats {
  const manufacturers = new Set<string>();
  const deviceTypes = new Set<string>();
  const categories = new Set<string>();
  let totalPages = 0;

  for (const manual of MANUALS_CACHE) {
    manufacturers.add(manual.manufacturer);
    deviceTypes.add(manual.deviceType);
    categories.add(manual.category);
    totalPages += manual.pages;
  }

  return {
    totalManuals: MANUALS_CACHE.length,
    totalDevices: 0,
    totalPages,
    manufacturers: Array.from(manufacturers),
    deviceTypes: Array.from(deviceTypes),
    categories: Array.from(categories),
  };
}

export function getRelevantContext(query: string, maxTokens = 4000): string {
  const results = searchManualsInternal(query, 8);
  let context = '';
  let tokenCount = 0;

  for (const result of results) {
    const sectionText = `--- Source: ${result.manual.title} > ${result.section.title} ---\n${result.section.content}\n\n`;
    const estimatedTokens = sectionText.length / 4;
    if (tokenCount + estimatedTokens > maxTokens) break;
    context += sectionText;
    tokenCount += estimatedTokens;
  }
  return context;
}

function searchManualsInternal(query: string, limit = 10): SearchResult[] {
  const results: SearchResult[] = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const item of SEARCH_INDEX) {
    const sectionText = `${item.sectionTitle} ${item.sectionContent}`.toLowerCase();
    let score = 0;
    const matchedTerms: string[] = [];

    for (const term of query.toLowerCase().split(/\s+/).filter(t => t.length > 1)) {
      const count = (item.sectionTitle.toLowerCase().match(new RegExp(term, 'g')) || []).length +
                     (item.sectionContent.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      if (count > 0) {
        score += count;
        matchedTerms.push(term);
      }
    }

    if (item.manualTitle.toLowerCase().includes(query.toLowerCase())) score += 5;

    if (score > 0) {
      const manual = MANUALS_CACHE.find(m => m.id === item.manualId);
      const section = MANUALS_CACHE.find(m => m.id === item.manualId)?.content.find(s => s.id === item.sectionId) ||
                     (() => {
                       function find(s) {
                         for (const sec of s) {
                           if (sec.id === item.sectionId) return sec;
                           if (sec.subsections) {
                             const found = find(sec.subsections);
                             if (found) return found;
                           }
                         }
                         return undefined;
                       }
                       return find(MANUALS_CACHE.find(m => m.id === item.manualId)?.content || []);
                     })();

      if (manual && section) {
        results.push({ manual, section, score, matchedTerms: [] });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function getKnowledgeBaseStats() {
  const manufacturers = new Set<string>();
  const deviceTypes = new Set<string>();
  const categories = new Set<string>();
  let totalPages = 0;

  for (const manual of MANUALS_CACHE) {
    manufacturers.add(manual.manufacturer);
    deviceTypes.add(manual.deviceType);
    categories.add(manual.category);
    totalPages += manual.pages;
  }

  return {
    totalManuals: MANUALS_CACHE.length,
    totalDevices: 0,
    totalPages,
    manufacturers: Array.from(manufacturers),
    deviceTypes: Array.from(deviceTypes),
    categories: Array.from(categories),
  };
}

export function getRelevantContext(query: string, maxTokens = 4000): string {
  const results = searchManualsInternal(query, 8);
  let context = '';
  let tokenCount = 0;

  for (const result of results) {
    const sectionText = `--- Source: ${result.manual.title} > ${result.section.title} ---\n${result.section.content}\n\n`;
    const estimatedTokens = sectionText.length / 4;
    if (tokenCount + estimatedTokens > maxTokens) break;
    context += sectionText;
    tokenCount += estimatedTokens;
  }
  return context;
}

export function getManualSection(manualId: string, sectionId: string) {
  const manual = MANUALS_CACHE.find(m => m.id === manualId);
  if (!manual) return undefined;

  function findSection(sections) {
    for (const section of sections) {
      if (section.id === sectionId) return section;
      if (section.subsections) {
        const found = findSection(section.subsections);
        if (found) return found;
      }
    }
    return undefined;
  }
  return findSection(manual.content);
}

export function getAllSections(manual) {
  const sections = [];
  function collect(arr) {
    for (const s of arr) {
      sections.push(s);
      if (s.subsections) collect(s.subsections);
    }
  }
  collect(manual.content);
  return sections;
}

export function getAllManuals() {
  return MANUALS_CACHE;
}

export function getManualById(id: string) {
  return MANUALS_CACHE.find(m => m.id === id);
}

export function getManualsByType(type) {
  return MANUALS_CACHE.filter(m => m.deviceType === type);
}

export function getManualsByManufacturer(manufacturer) {
  return MANUALS_CACHE.filter(m =>
    m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

export function searchManuals(query, limit = 10) {
  return searchManualsInternal(query, limit);
}