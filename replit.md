# ArtTransform - AI Photo to Art Transformation Platform

## Overview

ArtTransform is a web application that transforms photos into artistic styles using AI. Users can upload images and apply various art transformations including oil paintings, acrylic art, pencil sketches, watercolors, charcoal, and pastel styles. The platform operates on a credit-based system with users receiving 3 free credits upon signup.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library built on Radix UI with "new-york" style preset
- Tailwind CSS for utility-first styling with custom design tokens
- Custom design system featuring Space Grotesk (headings) and Inter (body) fonts
- HSL-based color system with CSS variables for theming support

**State Management Strategy**
- React Context API for global transformation state (image data, selected style)
- TanStack Query for API data fetching and caching
- Local component state for UI interactions (file uploads, form inputs)
- Session storage avoided in favor of React Context to prevent hydration issues

**File Upload & Preview**
- Client-side image preview using FileReader API and object URLs
- Drag-and-drop support for image uploads
- Base64 encoding for transmission to backend (suitable for MVP, would need cloud storage for production)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe API development
- Custom middleware for request logging and JSON body parsing with raw body preservation
- Vite integration in development mode for HMR and SSR capabilities

**API Design Pattern**
- RESTful endpoints under `/api` namespace
- POST `/api/transform` endpoint for image transformation requests
- Async transformation processing with immediate response pattern
- Status polling architecture (transformation initiated, processed asynchronously)

**Data Validation**
- Zod schemas for runtime type validation
- Shared schema definitions between client and server via `@shared/schema.ts`
- Type inference from Drizzle ORM schemas using `drizzle-zod`

**Development vs Production Build Strategy**
- Development: Vite middleware serves client, Express handles API
- Production: Vite builds static assets, Express serves both static files and API
- esbuild bundles server code for production deployment

### Data Storage Solutions

**Database Architecture**
- Drizzle ORM as the database toolkit with PostgreSQL dialect
- Neon serverless PostgreSQL as the database provider (via `@neondatabase/serverless`)
- Schema-first approach with TypeScript types generated from Drizzle schemas

**Schema Design**
- `users` table: id, username, password, credits (integer)
- `transformations` table: id, originalImageUrl, transformedImageUrl, style, status, createdAt
- UUID primary keys using PostgreSQL's `gen_random_uuid()`
- Status tracking for transformation lifecycle (pending → processing → completed/failed)

**In-Memory Fallback**
- `MemStorage` class implements same interface as database storage
- Used for development/testing when database is unavailable
- Allows development without database dependency

**Migration Strategy**
- Drizzle Kit for schema migrations in `./migrations` directory
- `npm run db:push` script for applying schema changes
- Schema definition in `shared/schema.ts` for client-server sharing

### Authentication and Authorization

**Current Implementation (MVP)**
- Simple username/password authentication schema defined
- No session management implemented yet
- Credit system tracked per user (3 free credits on signup)
- Frontend uses dialog-based login/signup UI components

**Planned Implementation**
- Session management would use `connect-pg-simple` (already in dependencies)
- Express session middleware for cookie-based authentication
- Password hashing would be required (bcrypt/argon2 not yet added)

### External Dependencies

**UI & Design Libraries**
- @radix-ui/* family: 20+ accessible component primitives
- Tailwind CSS with custom configuration extending base theme
- Lucide React for icon system
- class-variance-authority for type-safe variant styling
- next-themes for dark mode support (configured but not implemented)

**Development Tools**
- @replit/vite-plugin-* suite: cartographer, dev-banner, runtime-error-modal
- TypeScript with strict mode disabled for rapid development
- ESLint with React-specific plugins

**Database & ORM**
- drizzle-orm: Type-safe ORM with zero-runtime overhead
- drizzle-kit: Migration management and schema introspection
- @neondatabase/serverless: PostgreSQL client optimized for serverless/edge

**API & Data Management**
- @tanstack/react-query: Async state management with intelligent caching
- zod: Runtime schema validation and type inference
- @hookform/resolvers: Form validation integration

**Image Processing (Future)**
- Currently simulates transformations with delays
- No actual AI/ML integration yet (Replicate, Stability AI, or custom model would be needed)
- Base64 images stored temporarily (would need cloud storage like S3/Cloudflare R2)

**Asset Management**
- Static images in `attached_assets` directory (sample transformations)
- Vite alias `@assets` for importing generated example images
- Public assets served from Vite's public directory

**Styling System**
- PostCSS with Tailwind and Autoprefixer
- Custom CSS variables in index.css for design tokens
- Gradient utilities and shadow system defined in CSS variables
- Border radius system: lg (9px), md (6px), sm (3px)

**Key Technical Decisions**

1. **Monorepo Structure**: Single repository with `client/`, `server/`, and `shared/` directories for code sharing
2. **Type Safety**: End-to-end TypeScript with shared types from database schema to frontend components
3. **Progressive Enhancement**: Works without JavaScript for basic navigation (header links)
4. **Component Composition**: Radix primitives wrapped in custom components for consistent styling
5. **Build Optimization**: Separate build processes for client (Vite) and server (esbuild)
6. **Path Aliases**: `@/` for client, `@shared/` for shared code, `@assets/` for static files
7. **CSS Architecture**: Utility-first with Tailwind, custom properties for theming, minimal custom CSS