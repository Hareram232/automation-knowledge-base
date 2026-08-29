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

const typedData = manualsData as {
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
};

const MANUALS_CACHE = typedData.manuals;
const SEARCH_INDEX = typedData.searchIndex;

function findManualSection(manualId: string, sectionId: string): ManualSection | undefined {
  const manual = MANUALS_CACHE.find(m => m.id === manualId);
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

export function getAllManuals() {
  return MANUALS_CACHE;
}

export function getManualById(id: string) {
  return MANUALS_CACHE.find(m => m.id === id);
}

export function getManualsByType(type: string) {
  return MANUALS_CACHE.filter(m => m.deviceType === type);
}

export function getManualsByManufacturer(manufacturer: string) {
  return MANUALS_CACHE.filter(m =>
    m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

function searchManualsInternal(query: string, limit = 10) {
  const results = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const item of typedData.searchIndex) {
    const sectionText = `${item.sectionTitle} ${item.sectionContent}`.toLowerCase();
    let score = 0;

    for (const term of query.toLowerCase().split(/\s+/).filter(t => t.length > 1)) {
      const count = (item.sectionTitle.toLowerCase().match(new RegExp(term, 'g')) || []).length +
                     (item.sectionContent.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      if (count > 0) {
        score += count;
      }
    }

    if (item.manualTitle.toLowerCase().includes(query.toLowerCase())) score += 5;

    if (score > 0) {
      const manual = typedData.manuals.find(m => m.id === item.manualId);
      const section = manual?.content.find(s => s.id === item.sectionId);

      if (manual && section) {
        return [{ manual, section, score, matchedTerms: [] }];
      }
    }
  }

  return [];
}

export function searchManuals(query: string, limit = 10) {
  return searchManualsInternal(query, limit);
}

export function getKnowledgeBaseStats() {
  const manufacturers = new Set<string>();
  const deviceTypes = new Set<string>();
  const categories = new Set<string>();
  let totalPages = 0;

  for (const manual of typedData.manuals) {
    manufacturers.add(manual.manufacturer);
    deviceTypes.add(manual.deviceType);
    categories.add(manual.category);
  }

  return {
    totalManuals: typedData.manuals.length,
    totalDevices: 0,
    totalPages: typedData.manuals.reduce((sum, m) => sum + m.pages, 0),
    manufacturers: Array.from(new Set(typedData.manuals.map(m => m.manufacturer))),
    deviceTypes: Array.from(new Set(typedData.manuals.map(m => m.deviceType))),
    categories: Array.from(new Set(typedData.manuals.map(m => m.category))),
  };
}

function searchManualsInternal(query: string, limit = 10) {
  const results = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const item of typedData.searchIndex) {
    const sectionText = `${item.sectionTitle} ${item.sectionContent}`.toLowerCase();
    let score = 0;

    for (const term of query.toLowerCase().split(/\s+/).filter(t => t.length > 1)) {
      const count = (item.sectionTitle.toLowerCase().match(new RegExp(term, 'g')) || []).length +
                     (item.sectionContent.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      if (count > 0) {
        score += count;
      }
    }

    if (item.manualTitle.toLowerCase().includes(query.toLowerCase())) score += 5;

    if (score > 0) {
      const manual = typedData.manuals.find(m => m.id === item.manualId);
      const section = manual?.content.find(s => s.id === item.sectionId);

      if (manual && section) {
        return [{ manual, section, score, matchedTerms: [] }];
      }
    }
  }

  return [];
}

export function searchManuals(query: string, limit = 10) {
  return searchManualsInternal(query, limit);
}

export function getKnowledgeBaseStats() {
  const manufacturers = new Set<string>();
  const deviceTypes = new Set<string>();
  const categories = new Set<string>();
  let totalPages = 0;

  for (const manual of typedData.manuals) {
    manufacturers.add(manual.manufacturer);
    deviceTypes.add(manual.deviceType);
    categories.add(manual.category);
  }

  return {
    totalManuals: typedData.manuals.length,
    totalDevices: 0,
    totalPages: typedData.manuals.reduce((sum, m) => sum + m.pages, 0),
    manufacturers: Array.from(new Set(typedData.manuals.map(m => m.manufacturer))),
    deviceTypes: Array.from(new Set(typedData.manuals.map(m => m.deviceType))),
    categories: Array.from(new Set(typedData.manuals.map(m => m.category))),
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
  const manual = typedData.manuals.find(m => m.id === manualId);
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
  return typedData.manuals;
}

export function getManualById(id: string) {
  return typedData.manuals.find(m => m.id === id);
}

export function getManualsByType(type) {
  return typedData.manuals.filter(m => m.deviceType === type);
}

export function getManualsByManufacturer(manufacturer) {
  return typedData.manuals.filter(m =>
    m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

export function searchManuals(query, limit = 10) {
  return searchManualsInternal(query, limit);
}

export function getKnowledgeBaseStats() {
  const manufacturers = new Set<string>();
  const deviceTypes = new Set<string>();
  const categories = new Set<string>();
  let totalPages = 0;

  for (const manual of typedData.manuals) {
    manufacturers.add(manual.manufacturer);
    deviceTypes.add(manual.deviceType);
    categories.add(manual.category);
  }

  return {
    totalManuals: typedData.manuals.length,
    totalDevices: 0,
    totalPages: typedData.manuals.reduce((sum, m) => sum + m.pages, 0),
    manufacturers: Array.from(new Set(typedData.manuals.map(m => m.manufacturer))),
    deviceTypes: Array.from(new Set(typedData.manuals.map(m => m.deviceType))),
    categories: Array.from(new Set(typedData.manuals.map(m => m.category))),
  };
}