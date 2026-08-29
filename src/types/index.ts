export interface Manual {
  id: string;
  title: string;
  manufacturer: string;
  deviceType: 'PLC' | 'HMI' | 'SCADA' | 'VFD' | 'Sensor' | 'Controller' | 'Other';
  model: string;
  series: string;
  version: string;
  language: string;
  pages: number;
  category: string;
  tags: string[];
  content: ManualSection[];
  lastUpdated: string;
  downloadUrl?: string;
}

export interface ManualSection {
  id: string;
  title: string;
  level: number;
  content: string;
  subsections?: ManualSection[];
  pageStart?: number;
  pageEnd?: number;
}

export interface Device {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  series: string;
  type: 'PLC' | 'HMI' | 'SCADA' | 'VFD' | 'Sensor' | 'Controller' | 'Other';
  description: string;
  specifications: Specification[];
  manuals: string[]; // Manual IDs
  applications: string[];
  certifications: string[];
}

export interface Specification {
  name: string;
  value: string;
  unit?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: SourceReference[];
  isStreaming?: boolean;
}

export interface SourceReference {
  manualId: string;
  manualTitle: string;
  sectionId: string;
  sectionTitle: string;
  relevanceScore: number;
  excerpt: string;
}

export interface SearchResult {
  manual: Manual;
  section: ManualSection;
  score: number;
  matchedTerms: string[];
}

export interface KnowledgeBaseStats {
  totalManuals: number;
  totalDevices: number;
  totalPages: number;
  manufacturers: string[];
  deviceTypes: string[];
  categories: string[];
}