const fs = require('fs');
const path = require('path');

// Build script: reads all manual JSON files and generates a single static JSON file
// Run with: node scripts/build-manuals.js

const DATA_DIR = path.join(__dirname, '..', 'data', 'manuals');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'lib', 'manuals-data.json');

function loadManuals() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('Data directory not found:', DATA_DIR);
    return [];
  }
  
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const allManuals = [];
  
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      allManuals.push(...data.manuals);
      console.log(`Loaded ${data.manuals.length} manuals from ${file}`);
    } catch (err) {
      console.error(`Error loading ${file}:`, err.message);
    }
  }
  
  return allManuals;
}

function getAllSections(manual) {
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

function searchManuals(query, manuals, limit = 10) {
  const results = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const manual of manuals) {
    for (const section of manual.content) {
      const sectionText = `${section.title} ${section.content}`.toLowerCase();
      let score = 0;
      const matchedTerms = [];

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

function getRelevantContext(query, manuals, maxTokens = 4000) {
  const results = searchManuals(query, manuals, 8);
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

// Main build process
console.log('Building manuals data...');
const manuals = loadManuals();

if (manuals.length === 0) {
  console.error('No manuals loaded! Check data/manuals/ directory.');
  process.exit(1);
}

// Pre-compute search index for faster runtime
const searchIndex = manuals.flatMap(manual => 
  getAllSections(manual).map(section => ({
    manualId: manual.id,
    manualTitle: manual.title,
    manufacturer: manual.manufacturer,
    deviceType: manual.deviceType,
    model: manual.model,
    series: manual.series,
    version: manual.version,
    sectionId: section.id,
    sectionTitle: section.title,
    sectionContent: section.content,
    sectionLevel: section.level,
  }))
);

const output = {
  manuals,
  searchIndex,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`Generated ${OUTPUT_FILE} with ${manuals.length} manuals and ${searchIndex.length} searchable sections`);