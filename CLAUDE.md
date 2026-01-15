# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotionNext is a Next.js-based blog platform that transforms a Notion database into a fully-featured static/dynamic blog website. It uses a pluggable theme architecture with 18+ themes and supports multi-language, multi-site deployments.

**Stack:** Next.js 14, React 18, Tailwind CSS, Notion API via `react-notion-x`

**Node Requirement:** >= 20

## Common Commands

### Development
```bash
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run export           # Static export (BUILD_MODE=true EXPORT=true)
npm run build-all-in-dev # Build with VERCEL_ENV=production
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking
npm run pre-commit       # Run all checks (lint:fix + format + type-check)
npm run quality          # Quality check script
```

### Testing
```bash
npm test                 # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:ci          # CI mode (no watch, with coverage)
```

### Development Tools
```bash
npm run init-dev         # Initialize dev environment
npm run clean            # Clean project files
npm run dev-tools        # View all dev tool commands
npm run check-updates    # Check dependency updates
npm run bundle-report    # Analyze bundle size (ANALYZE=true)
npm run health-check     # Run health checks
```

### Git Hooks
```bash
npm run setup-hooks      # Install git hooks
npm run check-hooks      # Check hook status
npm run remove-hooks     # Remove git hooks
```

## Architecture

### Theme System

NotionNext uses a **pluggable theme architecture** where each theme is a self-contained directory under `/themes/`. Themes are loaded dynamically based on priority:

**Theme Selection Priority:**
1. URL query parameter (`?theme=hexo`)
2. localStorage
3. Notion config
4. `blog.config.js` default

**Theme Structure:**
```
themes/[themeName]/
  ├── index.js          # Exports layout components
  ├── config.js         # Theme-specific settings
  ├── style.js          # CSS-in-JS styles
  └── components/       # Theme UI components
```

**Standard Layout Components** (exported by each theme):
- `LayoutBase` - Base wrapper with header/footer
- `LayoutIndex` - Homepage layout
- `LayoutSlug` - Individual post layout
- `LayoutSearch` - Search results
- `LayoutArchive` - Archive page
- `LayoutCategoryIndex` - Category listing
- `LayoutTagIndex` - Tag listing

**Theme Loading:**
- Default theme components aliased via `@theme-components` in `next.config.js`
- Non-default themes loaded via `dynamic(() => import(\`@/themes/${themeName}\`), { ssr: true })`
- Each theme has its own React Context (e.g., `useHexoGlobal`, `useNextGlobal`)

### Notion Integration

**Data Pipeline:**
```
Notion Database (NOTION_PAGE_ID)
  ↓
getPage() → fetch blocks + collections
  ↓
convertNotionToSiteData()
  ├─ Extract schema (property definitions)
  ├─ Get all page IDs from collection
  ├─ Fetch properties via getPageProperties()
  ├─ Extract tags, categories, notices
  └─ Filter + sort posts
  ↓
handleDataBeforeReturn()
  ├─ Remove sensitive data
  ├─ Minify IDs
  └─ Filter invalid items
  ↓
SSR props to frontend
```

**Key Files:**
- `lib/notion/getNotionAPI.js` - Notion client with rate limiting and deduplication
- `lib/notion/getPageProperties.js` - Property extraction (handles 15+ property types)
- `lib/db/getSiteData.js` - Main data aggregation pipeline
- `lib/notion/getNotionConfig.js` - Runtime config from Notion

**Rate Limiting:** Build-time lock file-based rate limiter (200ms/request) prevents Notion API throttling.

**Multi-Site Support:** `NOTION_PAGE_ID` can be comma-separated with language prefixes: `id1,zh:id2,en:id3`

### Configuration System

**3-Tier Configuration Override (highest to lowest priority):**
1. **Notion Config Table** - Runtime config from special Notion database
2. **Environment Variables** - `process.env.NEXT_PUBLIC_*`
3. **blog.config.js** - Default configuration

**Key Config Files:**
- `blog.config.js` - Master config, imports from `/conf/` modules
- `/conf/*` - Modular configs: comments, analytics, fonts, plugins, etc.
- `lib/config.js` - `siteConfig()` function with smart type coercion

**Config Access:**
```javascript
import { siteConfig } from '@/lib/config'
const theme = siteConfig('THEME') // Auto-converts types
```

### Caching Strategy

**Multi-Backend Cache System** (`lib/cache/`):
- **Redis** - Production (requires `REDIS_URL`)
- **File** - Development (`.cache/` directory)
- **Memory** - Default fallback

**Cache Features:**
- In-flight deduplication prevents N+1 API calls
- Build-time rate limiting via lock files
- ISR (Incremental Static Regeneration) via `NEXT_REVALIDATE_SECOND` (default 60s)

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `lib/notion/` | Notion API layer (13 modules for fetching/transforming data) |
| `lib/db/` | Global data aggregation & SSG pipeline |
| `lib/cache/` | Multi-backend caching (Memory, File, Redis) |
| `lib/plugins/` | Third-party integrations (Algolia, Analytics, AI summary) |
| `themes/` | 18+ theme implementations with standard layout components |
| `components/` | Shared UI components (Comment, SEO, Analytics) |
| `pages/` | Next.js routes (index, posts, tags, categories, search, auth) |
| `hooks/` | Custom React hooks for global state management |
| `conf/` | Modular configuration files |

### Global State Management

**GlobalContext** (`lib/global.js`):
- Manages app-wide state: language, theme, dark mode, auth (Clerk), loading
- Accessible via `useGlobal()` hook
- Populated by `getGlobalData()` during SSG

**Dark Mode:**
- Priority: system preference → localStorage → Notion config → `blog.config.js`
- Auto dark mode based on `APPEARANCE_DARK_TIME` time ranges
- Theme class manipulation on `<html>` element

### Rendering Flow

**SSG Build (`npm run build`):**
```
getStaticProps() → getGlobalData() → getSiteDataByPageId()
  → getPage() (rate-limited Notion API)
  → convertNotionToSiteData()
  → getStaticPaths() for dynamic routes
  → Output HTML + JSON
```

**Runtime:**
```
Route navigation → getStaticProps() from cache
  → React hydration
  → Theme LayoutSlug renders NotionPage
  → Comments/Analytics initialize
```

**Theme Switching:**
```
Theme button click → ?theme=next query param
  → useLayoutByTheme() dynamic import
  → fixThemeDOM() cleanup
  → New theme LayoutBase mounts
```

### Image Handling

- `mapImgUrl()` - Transforms Notion image URLs
- `compressImage()` - Resizes for different screen sizes
- Custom image proxy via `IMAGE_URL_PREFIX` config

### Dynamic Routes

- `[prefix]/[...slug]` pattern for posts, categories, tags
- `LAYOUT_MAPPINGS` allows per-route layout overrides
- Pseudo-static mode: converts URLs to `.html` for compatibility

### Scheduled Publishing

- `POST_SCHEDULE_PUBLISH` checks date ranges during SSG
- Timezone-aware (supports IANA timezones)
- Articles can be time-gated or scheduled for future release

## Environment Variables

### Required
- `NOTION_PAGE_ID` - Notion database ID (can be comma-separated for multi-site)

### Optional Server-Side
- `NOTION_TOKEN_V2` - Notion auth token for private databases
- `REDIS_URL` - Redis connection string for caching
- `API_BASE_URL` - Custom Notion API proxy URL

### Optional Client-Side (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_THEME` - Default theme name
- `NEXT_PUBLIC_TITLE` - Site title
- `NEXT_PUBLIC_DESCRIPTION` - Site description
- `NEXT_PUBLIC_AUTHOR` - Author name
- `NEXT_PUBLIC_LINK` - Site URL

See `.env.example` for complete list.

## Code Style

- **Prettier** for formatting
- **ESLint** for linting (extends `next`, `prettier`)
- **TypeScript** for type checking (but mainly JS codebase)

**Naming Conventions:**
- Components: `PascalCase`
- Files: `kebab-case.js`
- Variables/Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

**Commit Convention:**
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
```

## Important Patterns

### Layout Component Composition
```jsx
_app.js (GlobalContextProvider)
  → GLayout (theme's LayoutBase)
    ├─ Header/Navigation
    ├─ Main content (Component)
    ├─ Sidebar/Footer
    └─ Floating elements
```

### Config Getter with Type Coercion
```javascript
// Automatically converts: "true" → boolean, "123" → number, "[...]" → array
const value = siteConfig('CONFIG_KEY')
```

### Theme Component Import
```javascript
import { useLayoutByTheme } from '@/hooks/useLayout'
const Layout = useLayoutByTheme(theme) // Dynamic theme loading
```

### Notion Property Mapping
Custom Notion field names mapped via `NOTION_PROPERTY_NAME` config to system fields like `title`, `status`, `type`, `date`, `tags`, etc.

## Troubleshooting

### Build Failures
```bash
npm run clean          # Clear caches
npm run quality        # Run quality checks
npm run type-check     # Check TypeScript errors
```

### Notion API Rate Limiting
- Check `.lock` files in cache directory
- Verify `NEXT_PUBLIC_DISABLE_REQUEST_LOCK` is not set to true
- Review `lib/notion/getNotionAPI.js` rate limiter

### Theme Not Loading
- Check `blog.config.js` THEME setting
- Verify theme directory exists in `/themes/`
- Check browser console for dynamic import errors
- Clear localStorage if theme override is cached

### Missing Environment Variables
```bash
npm run quality        # Validates env var configuration
```

## Additional Resources

- **Project Docs:** https://docs.tangly1024.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Notion API:** https://developers.notion.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **react-notion-x:** https://github.com/NotionX/react-notion-x
