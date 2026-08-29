import manualsData from './manuals-data.json';
import { Manual, ManualSection, SearchResult, KnowledgeBaseStats } from '@/types';

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
  return typedData.manuals;
}

export function getManualById(id: string): Manual | undefined {
  return typedData.manuals.find(m => m.id === id);
}

export function getManualsByType(type: string): Manual[] {
  return typedData.manuals.filter(m => m.deviceType === type);
}

export function getManualsByManufacturer(manufacturer: string): Manual[] {
  return typedData.manuals.filter(m =>
    m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

function searchManualsInternal(query: string, limit = 10): SearchResult[] {
  const results: SearchResult[] = [];
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const item of typedData.searchIndex) {
    let score = 0;

    for (const term of query.toLowerCase().split(/\s+/).filter(t => t.length > 1)) {
      const titleMatches = (item.sectionTitle.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      const contentMatches = (item.sectionContent.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      score += titleMatches + contentMatches;
    }

    if (item.manualTitle.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }

    if (score > 0) {
      const manual = typedData.manuals.find(m => m.id === item.manualId);
      const section = manual?.content.find(s => s.id === item.sectionId);

      if (manual && section) {
        results.push({ manual, section, score, matchedTerms: [] });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 10);
}

export function searchManuals(query: string, limit = 10): SearchResult[] {
  return searchManualsInternal(query, limit);
}

export function getKnowledgeBaseStats(): KnowledgeBaseStats {
  const manufacturers = new Set<string>();
  const deviceTypes = new Set<string>();
  const categories = new Set<string>();

  for (const manual of typedData.manuals) {
    manufacturers.add(manual.manufacturer);
    deviceTypes.add(manual.deviceType);
    categories.add(manual.category);
  }

  return {
    totalManuals: typedData.manuals.length,
    totalDevices: 0,
    totalPages: typedData.manuals.reduce((sum, m) => sum + m.pages, 0),
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

function findManualSection(manualId: string, sectionId: string): ManualSection | undefined {
  const manual = typedData.manuals.find(m => m.id === manualId);
  if (!manual) return undefined;

  function findSection(sections: ManualSection[]): ManualSection | undefined {
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

export function getManualSection(manualId: string, sectionId: string): ManualSection | undefined {
  return findManualSection(manualId, sectionId);
}

export function getAllSections(manual: Manual): ManualSection[] {
  const sections: ManualSection[] = [];
  function collect(arr: ManualSection[]) {
    for (const s of arr) {
      sections.push(s);
      if (s.subsections) collect(s.subsections);
    }
  }
  collect(manual.content);
  return sections;
}

export function getAllManuals(): Manual[] {
  return typedData.manuals;
}

export function getManualById(id: string): Manual | undefined {
  return typedData.manuals.find(m => m.id === id);
}

export function getManualsByType(type: string): Manual[] {
  return typedData.manuals.filter(m => m.deviceType === type);
}

export function getManualsByManufacturer(manufacturer: string): Manual[] {
  return typedData.manuals.filter(m =>
    m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

export function searchManuals(query: string, limit = 10): SearchResult[] {
  return searchManualsInternal(query, limit);
}