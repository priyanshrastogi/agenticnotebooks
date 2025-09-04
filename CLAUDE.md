# AgenticNotebooks & IntelliCharts - Claude Code Instructions

This document provides comprehensive instructions for Claude Code when working on the multi-tenant AgenticNotebooks project.

## Project Overview

This is a **multi-tenant application** hosting two distinct AI-powered platforms:

**AgenticNotebooks** is an AI agent for notebook analysis that allows users to chat with their Jupyter notebooks, Excel and CSV files while keeping data completely private in their browser.

**IntelliCharts** is an AI-powered data visualization platform that transforms any data into beautiful, customizable charts instantly. Users can feed various data sources (JSON, CSV, APIs, XML, HTML) and watch the AI agent automatically parse, analyze, and create stunning charts in seconds.

### Key Value Propositions

#### AgenticNotebooks
- **Privacy-First**: Data never leaves your browser - complete local processing
- **Notebook Analysis**: Specialized for Jupyter notebooks and spreadsheet analysis
- **Conversational**: Natural language interface for data exploration
- **Fast Processing**: Browser-based analysis for instant results
- **Secure**: No data uploaded to external servers

#### IntelliCharts
- **AI-Powered**: Intelligent data parsing and chart generation
- **Any Data Source**: Supports JSON, CSV, APIs, XML, HTML
- **Instant Results**: Automatic parsing, analysis, and visualization
- **Beautiful Charts**: Customizable, professional-grade visualizations
- **User-Friendly**: No coding required, simple interface

## Repository Structure

This is a monorepo with two main components:

```
/intellicharts
├── web/          # Frontend Next.js application
├── api/          # Backend NestJS API
└── CLAUDE.md     # This file
```

### Frontend (`/web`)

- **Next.js 14** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **D3.js** for chart rendering
- **Yarn** as package manager

### Backend (`/api`)

- **NestJS** framework
- **TypeScript** for type safety
- **PostgreSQL** with TypeORM
- **LangChain** for AI agent functionality
- **Yarn** as package manager

## Multi-Tenant Architecture

This application uses a sophisticated multi-tenant architecture to serve both IntelliCharts and AgenticNotebooks from the same codebase:

### Tenant Configuration
- **Tenant Types**: `'agenticnotebooks' | 'intellicharts'`
- **Domain Mapping**: 
  - `agenticnotebooks.localhost:3000` → AgenticNotebooks experience
  - `intellicharts.localhost:3000` → IntelliCharts experience
- **Production Domains**:
  - `agenticnotebooks.com` → AgenticNotebooks
  - `intellicharts.com` → IntelliCharts

### Key Implementation Details
- **Dynamic Routing**: Uses `[tenant]` dynamic routes for all pages
- **Middleware**: Detects subdomain and rewrites URLs to tenant-specific routes
- **Tenant-Aware Components**: Logo, branding, and content adapt based on tenant
- **Separate Landing Pages**: Each tenant has its own landing page components
- **Blog Separation**: Tenant-specific blog content in separate folders
- **Asset URLs**: Different asset domains for each tenant

### Important Files
- `src/lib/tenant.ts` - Tenant configuration and utilities
- `src/middleware.ts` - Subdomain detection and URL rewriting
- `src/app/[tenant]/` - All tenant-scoped routes
- `content/blog/agenticnotebooks/` - AgenticNotebooks blog posts
- `content/blog/intellicharts/` - IntelliCharts blog posts

## Development Guidelines

### Package Management

- **ALWAYS use Yarn** for both frontend and backend, never npm
- Install dependencies: `yarn install`
- Add packages: `yarn add <package-name>`
- Add dev dependencies: `yarn add -D <package-name>`

### Development Commands

- **DO NOT run build commands** (`yarn build`, `next build`, `nest build`, etc.)
- **DO NOT start dev servers** (`yarn dev`, `next dev`, `yarn start:dev`, etc.)
- **ONLY use these commands for validation:**
  - `npx tsc --noEmit` - Check TypeScript errors
  - `npx eslint <file-path>` - Check ESLint errors
  - `npx eslint <file-path> --fix` - Auto-fix ESLint errors

### Code Quality

- Always check TypeScript and ESLint before completing tasks
- Fix all TypeScript compilation errors
- Fix all ESLint errors (use `--fix` when appropriate)
- Follow existing code patterns and conventions

## Frontend (`/web`) Architecture

### Key Technologies

- **Next.js 14**: App Router with React Server Components
- **React 19**: Latest React features
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first CSS
- **D3.js**: Advanced data visualization
- **TanStack Query**: Data fetching and caching
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Radix UI**: Accessible UI components

### Directory Structure

```
/web/src
├── app/                    # Next.js App Router
│   ├── [tenant]/          # Tenant-scoped routes (dynamic routing)
│   │   ├── (app)/         # Authenticated app routes
│   │   │   ├── chat/      # Main chat interface
│   │   │   ├── demo/      # Chart library demo
│   │   │   └── new/       # New chart creation
│   │   ├── (auth)/       # Authentication routes
│   │   ├── (blog)/       # Blog section
│   │   ├── (marketing)/  # Marketing pages
│   │   └── page.tsx      # Tenant-specific landing page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── pages/           # Page-specific components
│   │   ├── AgenticNotebooks/  # AgenticNotebooks-specific components
│   │   ├── IntelliCharts/  # IntelliCharts-specific components
│   │   ├── Landing/       # Shared landing components
│   │   └── Blog/          # Blog components
│   ├── blocks/          # Reusable UI blocks
│   ├── ui/              # Radix UI components
│   └── magicui/         # Magic UI effects
├── lib/                 # Utilities and services
│   ├── tenant.ts        # Tenant configuration and utilities
│   ├── blog.ts          # Tenant-aware blog functionality
│   ├── charts/          # D3.js chart library
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   ├── fetch/           # API client functions
│   └── contexts/        # React contexts
├── middleware.ts        # Multi-tenant middleware
└── content/             # Blog content (outside src)
    └── blog/
        ├── agenticnotebooks/  # AgenticNotebooks blog posts
        └── intellicharts/     # IntelliCharts blog posts
```

### Core Features

#### Multi-Tenant Landing Pages (`/[tenant]`)

**AgenticNotebooks Landing:**
- Hero section with notebook analysis messaging
- Features showcase for notebook and spreadsheet analysis
- Privacy-first data processing emphasis
- Notebook-focused use cases and FAQs
- Call-to-action to try notebook analysis

**IntelliCharts Landing:**
- Hero section with AI-powered data visualization messaging
- Features showcase for chart generation
- How it works section for data visualization
- Chart-focused use cases and FAQs
- Call-to-action to try chart creation

#### Main App (`/chat`)

- AI-powered chat interface for chart generation
- File upload support (CSV, JSON, Excel)
- Real-time chart generation
- Interactive data exploration
- Chart customization options

#### Chart Library (`/demo`)

- Showcase of available chart types
- Interactive demos with real data
- Chart/Data view toggle showing JSON data
- Customization options panel
- Examples: Line charts, area charts, stacked charts

#### Chart Library Implementation

- **LineChart**: Multi-dataset line charts with points, tooltips, crosshairs
- **AreaChart**: Area charts with gradients, stacking support, tooltips
- **Features**: Interactive tooltips, crosshairs, legends, animations, responsive design
- **Data Format**: Supports timestamps, categorical data, multi-dataset visualization

### Important Frontend Patterns

#### Chart Integration

```typescript
// Chart creation pattern
const chart = createAreaChart('#container', datasets, options);
chart.render();

// React integration
useEffect(() => {
  if (containerRef.current) {
    chartRef.current = createChart(...);
    chartRef.current.render();
  }
  return () => chartRef.current?.destroy();
}, [data, options]);
```

#### Authentication Flow

- JWT-based authentication
- Google OAuth integration
- Session management with cookies
- Protected routes with middleware

#### File Handling

- Support for CSV, JSON, Excel files
- Client-side file parsing
- Metadata extraction
- Error handling for invalid formats

## Backend (`/api`) Architecture

### Key Technologies

- **NestJS**: Progressive Node.js framework
- **TypeORM**: Database ORM with PostgreSQL
- **LangChain**: AI agent framework
- **JWT**: Authentication
- **Fastify**: High-performance server

### Directory Structure

```
/api/src
├── modules/              # Feature modules
│   ├── auth/            # Authentication & authorization
│   ├── users/           # User management
│   ├── conversations/   # Chat conversations
│   ├── agent/           # AI agent functionality
│   ├── agentv2/         # Next-gen agent system
│   └── credits/         # Usage tracking
├── common/              # Shared resources
│   ├── entities/        # Database entities
│   ├── types/           # TypeScript types
│   └── constants/       # Application constants
├── config/              # Configuration files
├── migrations/          # Database migrations
└── main.ts              # Application entry point
```

### Core Modules

#### Authentication (`/modules/auth`)

- **JWT-based authentication** with refresh tokens
- **Google OAuth** integration
- **Password reset** functionality
- **User registration** and login
- **Token management** and validation

#### Users (`/modules/users`)

- User profile management
- Password updates
- User preferences
- Subscription management

#### Agent (`/modules/agent`)

- **AI chart generation** using LangChain
- **Data parsing** for various formats
- **Chart type detection** and recommendations
- **Code generation** for visualizations
- **OpenAI and Anthropic** model integration

#### Conversations (`/modules/conversations`)

- Chat session management
- Message history storage
- Real-time communication
- Context preservation

#### Credits (`/modules/credits`)

- Usage tracking and limits
- Subscription-based credits
- Rate limiting
- Analytics

### Database Schema

```typescript
// Key entities
- User: User accounts and profiles
- Conversation: Chat sessions
- ConversationMessage: Individual messages
- UserSubscription: Subscription management
- DailyCreditsUsage: Usage tracking
- AuthorizationToken: JWT token management
```

### AI Agent System

#### Current Agent (`/modules/agent`)

- Basic chart generation from data
- Support for various data formats
- Chart type recommendations
- Code generation capabilities

#### Next-Gen Agent (`/modules/agentv2`)

- **Coordinator Agent**: Orchestrates the workflow
- **Database Agent**: Handles database interactions
- **Sheets Agent**: Processes spreadsheet data
- **Execution Plan Builder**: Plans multi-step operations
- **Dependency Resolver**: Manages task dependencies

## Routes and Navigation

### Frontend Routes

- `/` - Landing page
- `/auth` - Authentication page
- `/chat` - Main application interface
- `/new` - New chart creation
- `/demo` - Chart library showcase
- `/blog` - Blog section
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### API Endpoints

- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/conversations/*` - Chat functionality
- `/agent/*` - AI agent services
- `/credits/*` - Usage tracking

## Chart Library Specifications

### Supported Chart Types

- **Line Charts**: Multi-dataset with points, smooth/linear curves
- **Area Charts**: With gradients, stacking support
- **Features**: Tooltips, crosshairs, legends, animations

### Chart Options

```typescript
interface ChartOptionsConfig {
  showGrid: boolean;
  showAxis: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  legendPosition: "bottom" | "top" | "left" | "right";
  showPoints?: boolean;
  animate: boolean;
  curve: "linear" | "smooth";
  yAxisStartsFromZero: boolean;
  showStackedTotal?: boolean; // Area charts only
}
```

### Data Format

```typescript
interface ChartDataset {
  label: string;
  data: ChartData[];
}

interface ChartData {
  x: string | number;
  y: number;
  date?: string; // Optional for display
  y0?: number; // For stacked data
  y1?: number; // For stacked data
}
```

### Styling Standards

- Y-axis width: 40px (reduced from default 60px)
- Crosshair dash pattern: '4,4' (matches grid lines)
- Proper margin calculations to avoid axis overlap
- Area chart gradients stop at axis line
- Responsive design with proper scaling

## Key Implementation Details

### Authentication Flow

1. User signs up/logs in through frontend
2. JWT tokens issued by backend
3. Tokens stored securely in cookies
4. Middleware validates tokens on protected routes
5. Refresh token mechanism for session management

### Chart Generation Process

1. User uploads data or enters query
2. Frontend sends data to AI agent
3. Agent analyzes data structure and requirements
4. Agent generates chart configuration
5. Frontend renders chart using D3.js library
6. User can customize chart options
7. Export functionality available

### File Processing

1. User uploads file (CSV, JSON, Excel)
2. Client-side parsing and validation
3. Metadata extraction
4. Data transformation for chart compatibility
5. Error handling and user feedback

## Common Development Tasks

### Adding New Chart Types

1. Create chart class in `/lib/charts/charts/`
2. Implement Chart interface methods
3. Add to main exports in index files
4. Update demo page with examples
5. Add tests and documentation

### Extending AI Agent

1. Add new prompts in agent service
2. Implement data parsing logic
3. Add validation and error handling
4. Update API endpoints if needed
5. Test with various data formats

### Adding New Features

1. Design database schema changes
2. Create/update entities and migrations
3. Implement backend services and controllers
4. Create frontend components and hooks
5. Update authentication/authorization as needed

## Testing and Quality Assurance

### Frontend Testing

- Component functionality with realistic data
- Chart rendering and interactions
- File upload and processing
- Authentication flows
- Responsive design

### Backend Testing

- API endpoint functionality
- Database operations
- AI agent responses
- Authentication security
- Rate limiting and credits

### Data Testing

- Various file formats (CSV, JSON, Excel)
- Edge cases (empty data, malformed files)
- Large datasets performance
- Chart type appropriateness

## Performance Considerations

### Frontend

- Chart rendering optimization with D3.js
- Lazy loading of components
- Efficient data transformations
- Responsive image handling
- Bundle size optimization

### Backend

- Database query optimization
- AI model response caching
- Rate limiting implementation
- Connection pooling
- Memory management for large files

## Security Considerations

### Authentication

- Secure JWT implementation
- Password hashing with bcrypt
- OAuth integration security
- Session management
- CSRF protection

### Data Handling

- Input validation and sanitization
- File upload security
- API rate limiting
- Error handling without information leakage

## Debugging and Troubleshooting

### Common Issues

1. **Chart not rendering**: Check container existence, data format
2. **Authentication failures**: Verify JWT tokens, check backend logs
3. **File upload issues**: Validate file format, check size limits
4. **AI agent errors**: Review prompt formatting, check API keys

### Debugging Tools

- Browser DevTools for frontend issues
- Network tab for API call inspection
- NestJS built-in logging
- Database query logs
- AI model response inspection

## Environment Setup

### Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL database
- OpenAI/Anthropic API keys

### Development Workflow

1. Check TypeScript: `npx tsc --noEmit`
2. Check ESLint: `npx eslint <path>`
3. Fix issues before committing
4. Follow existing patterns and conventions
5. Test thoroughly with realistic data

Remember: Focus on creating an exceptional AI-powered data visualization experience. The system should make complex data visualization accessible to everyone through intelligent automation and beautiful, customizable charts.
