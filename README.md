# Industrial Automation Knowledge Base

An AI-powered knowledge base for industrial automation professionals. Chat with an AI assistant that has deep knowledge of PLCs, SCADA systems, HMIs, VFDs, sensors, and DCS controllers from major manufacturers.

## Features

- 🤖 **AI Chat Assistant** - Powered by NVIDIA Nemotron 3 Ultra (via NVIDIA Build API) or OpenAI GPT-4
- 📚 **Comprehensive Manual Library** - 15+ manufacturer manuals with 4,200+ pages of technical content
- 🔍 **Intelligent Search** - Find relevant sections across all manuals instantly
- 🏭 **Multi-Vendor Support** - Allen-Bradley, Siemens, Schneider Electric, Emerson, Honeywell, Yokogawa, and more
- 🎯 **Device-Specific Knowledge** - PLCs, HMIs, SCADA, VFDs, Sensors, DCS Controllers
- 🌙 **Dark Theme** - Industrial-focused UI optimized for long engineering sessions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Supported Manufacturers & Devices

| Manufacturer | PLC | HMI | SCADA | VFD | Sensor | DCS |
|-------------|-----|-----|-------|-----|--------|-----|
| Allen-Bradley/Rockwell | ControlLogix 5000 | PanelView 5000 | - | PowerFlex 755 | - | - |
| Siemens | S7-1500 | TP1500 Comfort | - | SINAMICS G120 | - | - |
| Schneider Electric | Modicon M580 | Magelis GT | - | Altivar Process | - | - |
| Emerson | - | - | - | - | - | DeltaV |
| Honeywell | - | - | - | - | - | Experion PKS |
| Yokogawa | - | - | - | - | - | CENTUM VP |
| Inductive Automation | - | - | Ignition | - | - | - |
| AVEVA | - | - | System Platform | - | - | - |
| Trihedral | - | - | VTScada | - | - | - |
| ifm electronic | - | - | - | - | IO-Link Masters | - |
| SICK | - | - | - | - | Vision, LiDAR, Safety | - |
| Banner Engineering | - | - | - | - | Photoelectric, Radar | - |

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- NVIDIA API key (recommended) or OpenAI API key

### Installation

```bash
# Clone the repository
cd automation-kb

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your API key
# NVIDIA_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to `/dashboard`.

### Getting a NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Create an account or sign in
3. Navigate to "Get API Key"
4. Copy the key to your `.env.local` file

## Project Structure

```
automation-kb/
├── data/
│   └── manuals/           # JSON manual files
├── src/
│   ├── app/
│   │   ├── api/chat/      # AI chat API endpoint
│   │   ├── dashboard/     # Main dashboard page
│   │   ├── manuals/       # Manual library page
│   │   ├── settings/      # Settings page
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home (redirects to dashboard)
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ManualBrowser.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── ai.ts          # AI integration (OpenAI/NVIDIA)
│   │   ├── knowledge-base.ts  # Manual search & retrieval
│   │   └── utils.ts       # Utility functions
│   └── types/
│       └── index.ts       # TypeScript types
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Adding New Manuals

1. Create a new JSON file in `data/manuals/` following the existing schema
2. The manual will be automatically indexed on next startup

### Manual Schema

```typescript
interface Manual {
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
}

interface ManualSection {
  id: string;
  title: string;
  level: number;
  content: string;
  subsections?: ManualSection[];
  pageStart?: number;
  pageEnd?: number;
}
```

## API Endpoints

### POST /api/chat

Chat with the AI assistant.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I configure EtherNet/IP on ControlLogix 5580?" }
  ],
  "stream": true
}
```

**Response (streaming):** Text chunks
**Response (non-streaming):**
```json
{
  "content": "Full response text...",
  "sources": [
    {
      "manualTitle": "ControlLogix 5000 Reference Manual",
      "sectionTitle": "Communication Protocols",
      "relevanceScore": 0.95,
      "excerpt": "Native EtherNet/IP (CIP) on controller..."
    }
  ]
}
```

## Customization

### Themes

Modify `tailwind.config.js` to customize the industrial color palette:

```javascript
colors: {
  industrial: {
    dark: '#1a1a2e',
    darker: '#16213e',
    darkest: '#0f0f1a',
    accent: '#e94560',
    gold: '#ffd700',
  }
}
```

### AI Model

Change the model in `src/lib/ai.ts` or via settings page:
- NVIDIA: `nvidia/nvidia/nemotron-3-ultra-550b-a55b`
- OpenAI: `gpt-4-turbo-preview`, `gpt-4o`
- Anthropic: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NVIDIA_API_KEY=your_production_key
NEXT_PUBLIC_APP_NAME=Industrial Automation Knowledge Base
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add manuals or improve the AI/chat interface
4. Submit a pull request

### Adding Manual Content

- Use the existing JSON structure
- Break content into logical sections with proper hierarchy
- Include page numbers for reference
- Add relevant tags for searchability

## License

MIT License - feel free to use for personal or commercial projects.

## Acknowledgments

- NVIDIA Nemotron 3 Ultra for AI capabilities
- All manufacturer documentation teams for technical content
- Next.js, Tailwind CSS, and the open-source community

## Support

For issues or feature requests, please open a GitHub issue.

---

**Built for automation engineers, by automation engineers.** 🏭