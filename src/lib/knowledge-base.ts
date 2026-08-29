import fs from 'fs';
import path from 'path';
import { Manual, ManualSection, SearchResult, KnowledgeBaseStats } from '@/types';

// --- Load all manuals at BUILD TIME (runs during `next build`) ---
const DATA_DIR = path.join(process.cwd(), 'data/manuals');

function loadManuals(): Manual[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const allManuals: Manual[] = [];
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    allManuals.push(...data.manuals);
  }
  return allManuals;
}

const MANUALS_CACHE = loadManuals();

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

  for (const manual of MANUALS_CACHE) {
    for (const section of manual.content) {
      const sectionText = `${section.title} ${section.content}`.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];

      for (const term of searchTerms) {
        const count = (sectionText.match(new RegExp(term, 'g')) || []).length;
        if (count > 0) {
          score += count;
          matchedTerms.push(term);
        }
      }

      if (section.title.toLowerCase().includes(query.toLowerCase())) score += 10;
      if (manual.title.toLowerCase().includes(query.toLowerCase())) score += 5;

      if (score > 0) {
        results.push({ manual, section, score, matchedTerms });
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
  const results = searchManuals(query, 8);
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

export function getManualSection(manualId: string, sectionId: string): ManualSection | undefined {
  const manual = getManualById(manualId);
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