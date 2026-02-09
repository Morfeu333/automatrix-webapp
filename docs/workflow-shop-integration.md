# Workflow Shop Integration

## Overview

The Workflow Shop is a fully integrated n8n workflow marketplace that allows users to browse, search, and download over 2,000 professional automation workflows. It combines a Python FastAPI backend with a React frontend seamlessly integrated into the Automatrix application.

## Features

### ✨ Core Features
- **2,000+ Workflows**: Complete collection from the n8n-workflows repository
- **Smart Search**: Full-text search across workflow names, descriptions, and integrations
- **Advanced Filtering**: Filter by category, trigger type, complexity, and integrations
- **Multiple View Modes**: Grid and list views for different browsing preferences
- **One-Click Download**: Direct download of workflow JSON files
- **Responsive Design**: Fully adapted to Automatrix's green/white design system

### 🎨 Design Integration
- Matches Automatrix's green color scheme (`--automatrix-green`)
- Uses existing UI components (shadcn/ui)
- Consistent with the rest of the application
- Mobile-responsive layout

### 📊 Workflow Metadata
Each workflow includes:
- **Name**: Descriptive workflow title
- **Category**: Auto-categorized (Social Media, E-commerce, CRM, etc.)
- **Node Count**: Number of nodes in the workflow
- **Integrations**: List of services/APIs used
- **Trigger Type**: Webhook, Schedule, Manual, etc.
- **Complexity**: Beginner, Intermediate, or Advanced
- **Tags**: Searchable tags for better discovery

## Architecture

### Backend (Python FastAPI)
- **Location**: `backend/`
- **Database**: SQLite with FTS5 (Full-Text Search)
- **API Server**: FastAPI with CORS enabled
- **Port**: 8000

### Frontend (React + TypeScript)
- **Location**: `src/pages/WorkflowShopPage.tsx`
- **API Client**: `src/services/n8nWorkflowAPI.ts`
- **Port**: 3002

### Data Flow
```
User → React UI → API Service → Python Backend → SQLite FTS5 → Workflow JSON Files
```

## File Structure

```
backend/
├── api_server.py                  # FastAPI server
├── workflow_db.py                 # SQLite database with FTS5
├── run.py                         # Server startup script
├── requirements.txt               # Python dependencies
└── database/
    └── workflows.db               # SQLite database (auto-generated)

src/
├── pages/
│   └── WorkflowShopPage.tsx       # Main workflow shop page
├── services/
│   ├── n8nWorkflowAPI.ts          # API client for Python backend
│   └── workflowService.ts         # (Legacy - can be removed)
└── utils/
    └── workflowParser.ts          # (Legacy - can be removed)

public/
└── n8n-workflows/
    ├── index.json                 # Index of all workflow files
    └── workflows/                 # 2,061 workflow JSON files
        ├── Activecampaign/
        ├── Aggregate/
        ├── Airtable/
        └── ... (188 categories)
```

## Quick Start

### Running the Application

**Option 1: Run both servers together (Recommended)**
```bash
npm run dev:all
```

This will start:
- React frontend on http://localhost:3002
- Python backend on http://127.0.0.1:8000

**Option 2: Run servers separately**

Terminal 1 - React Frontend:
```bash
npm run dev
```

Terminal 2 - Python Backend:
```bash
npm run dev:backend
# or
cd backend && python3 run.py
```

### Accessing the Workflow Shop

1. Open http://localhost:3002/workflow-shop in your browser
2. Or click "Workflow Shop" in the header navigation

### Using the Workflow Shop

**Searching Workflows:**
1. Use the search bar to find workflows by name, integration, or tag
2. Apply filters for category, trigger type, or complexity
3. Sort results by popularity, name, node count, or complexity
4. Switch between grid and list views

**Downloading Workflows:**
Click the "Download" button on any workflow card to download the JSON file. The file can then be imported directly into n8n.

## Performance Optimizations

### Initial Load
- Loads first 200 workflows on page load for fast initial render
- Batch loading in groups of 20 to prevent browser overload
- Progress logging in console

### Future Improvements
- Implement lazy loading/infinite scroll for all 2,000+ workflows
- Add workflow preview modal
- Implement favorites/bookmarks
- Add workflow ratings and reviews
- Create workflow collections/bundles

## Technical Details

### Workflow Parser
The `workflowParser.ts` utility extracts metadata from n8n workflow JSON files:
- Identifies integrations from node types
- Determines trigger type from workflow structure
- Calculates complexity based on node count
- Auto-categorizes based on integrations and name

### Service Layer
The `workflowService.ts` provides:
- Singleton service for workflow management
- Efficient batch loading
- Client-side search and filtering
- Statistics calculation

### Categories
Workflows are automatically categorized into:
- Social Media
- E-commerce
- CRM & Sales
- Communication
- Data & Analytics
- Automation (default)

## Integration with Existing Features

The Workflow Shop integrates seamlessly with:
- **Header Navigation**: Added "Workflow Shop" link
- **Routing**: New `/workflow-shop` route in App.tsx
- **Design System**: Uses existing Tailwind classes and color scheme
- **UI Components**: Leverages shadcn/ui components

## Source Attribution

Workflows sourced from: https://github.com/Zie619/n8n-workflows
- 2,061 production-ready workflows
- 365+ unique integrations
- Organized by service/integration
- MIT Licensed

## Next Steps

1. **Test the integration**: Visit http://localhost:3002/workflow-shop
2. **Customize categories**: Adjust categorization logic in `workflowParser.ts`
3. **Add more features**: Implement preview, favorites, ratings
4. **Optimize loading**: Implement full lazy loading for all workflows
5. **Backend integration**: Connect to Supabase for user favorites and analytics

## Support

For issues or questions about the Workflow Shop integration, please refer to:
- Original repository: https://github.com/Zie619/n8n-workflows
- n8n documentation: https://docs.n8n.io/

