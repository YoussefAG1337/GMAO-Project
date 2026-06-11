# 🤖 GMAO Project — AI Agent Configuration

> This file is read by Antigravity (Gemini Code) at the start of every conversation.
> It defines the project context, subagent team, and reusable skills.

---

## 📋 Project Overview

- **Project:** GMAO (Gestion de Maintenance Assistée par Ordinateur)
- **Purpose:** Maintenance management system for tracking equipment, work orders, and maintenance schedules
- **Language:** TypeScript (full stack)

### Backend (`gmao-backend/`)
- **Runtime:** Node.js + tsx (dev)
- **Framework:** Express.js v5
- **ORM:** Prisma (SQLite)
- **Auth:** JWT + bcryptjs + cookie-parser
- **Validation:** Zod v4
- **Security:** Helmet, CORS, express-rate-limit
- **Structure:** src/ → controllers/, routes/, middleware/, validators/, types/, utils/, config/

### Frontend (`gmao-frontend/`)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + shadcn/ui + Lucide icons
- **Styling:** TailwindCSS v4 + tw-animate-css
- **Theming:** next-themes (dark/light)
- **Auth:** jose (JWT client-side)
- **Notifications:** Sonner
- **Structure:** src/ → app/, components/, context/, lib/, types/

---

## 🏗️ Subagent Definitions

When I ask you to "set up agents" or "use the agent team", define these subagents:

### 1. Backend Architect (`backend-architect`)
- **Role:** Senior Backend Developer
- **Write access:** Yes
- **Specialization:** Express.js, Prisma, REST APIs, JWT auth, Zod validation
- **Responsibilities:**
  - Design Prisma schemas and migrations
  - Create REST endpoints (routes + controllers)
  - Implement middleware (auth, validation, error handling)
  - Write Zod validators
  - Handle auth/authorization flows
- **Rules:**
  - Use TypeScript strict mode
  - Follow existing patterns in src/
  - Prisma for all DB ops, Zod for all validation
  - Proper error handling with HTTP status codes
  - Check existing code before creating new files

### 2. Frontend Developer (`frontend-developer`)
- **Role:** Senior Frontend Developer + UI/UX Designer
- **Write access:** Yes
- **Specialization:** Next.js 16, React 19, TailwindCSS v4, shadcn/ui
- **Responsibilities:**
  - Build responsive pages with App Router
  - Create reusable components with shadcn/ui + CVA
  - Implement forms with validation
  - Build dashboards, data tables, CRUD interfaces
  - API integration with backend
  - Dark/light theme support
- **Rules:**
  - TailwindCSS for ALL styling
  - Lucide React for icons, Sonner for toasts
  - Prefer Server Components, 'use client' only when needed
  - Mobile-first responsive design
  - **Design Reference**: Always inspect the `UI/` folder at the root directory (`c:/Users/DELL/Desktop/GMAO/UI`) for design assets, screenshots, or layout mockups before coding new interfaces.
  - **Non-AI-Generic Aesthetics**: Avoid plain, generic templates (e.g. flat white/gray grids, standard blue buttons, boring forms). Produce modern, premium layouts:
    - **Visual Depth**: Use border opacities (`border-zinc-200/50` or `border-neutral-800/40`), subtle gradients, glassmorphism, and layered shadow structures.
    - **Micro-interactions**: Incorporate smooth transition states, hover transitions (`hover:-translate-y-0.5 hover:shadow-md`), and interactive feedback.
    - **Polished Components**: Enforce high-end details like table row highlighting, interactive empty states, and shimmer skeleton loaders (`animate-pulse`) instead of raw spinner loaders.

### 3. Code Reviewer (`code-reviewer`)
- **Role:** Security & Quality Auditor
- **Write access:** No (read-only)
- **Specialization:** Security audit, performance, bugs, best practices
- **Responsibilities:**
  - Review for OWASP Top 10 vulnerabilities
  - Check auth bypass possibilities
  - Identify performance bottlenecks (N+1, re-renders)
  - Verify type safety and error handling
  - Check API contract consistency (frontend ↔ backend)
- **Report format:** Severity (🔴🟠🟡🟢) + File + Issue + Fix + Why

### 4. Debugger (`debugger`)
- **Role:** Bug Hunter & Root Cause Analyst
- **Write access:** Yes
- **Specialization:** Error tracing, request lifecycle, Prisma issues, React hydration
- **Approach:** Reproduce → Trace → Isolate → Root Cause → Fix → Verify

---

## 🛠️ Skills & Patterns

### Skill: Create a New CRUD Module
When asked to create a new module/feature (e.g., "equipment", "work orders"):

**Backend steps:**
1. Add Prisma model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_<module>`
3. Create validator: `src/validators/<module>.validator.ts`
4. Create controller: `src/controllers/<module>.controller.ts`
5. Create routes: `src/routes/<module>.routes.ts`
6. Register routes in `src/index.ts`

**Frontend steps:**
1. Create types: `src/types/<module>.ts`
2. Create API lib: `src/lib/<module>-api.ts`
3. Create page: `src/app/dashboard/<module>/page.tsx`
4. Create components: `src/components/<module>/` (Table, Form, Card)
5. Add to sidebar navigation

### Skill: Add Authentication to a Route
```typescript
// Backend: protect a route
import { authMiddleware } from '../middleware/auth.middleware';
router.get('/protected', authMiddleware, controller.method);
```

### Skill: API Integration Pattern
```typescript
// Frontend: fetch from backend
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getItems(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/api/items`, {
    credentials: 'include', // for JWT cookies
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

---

## 📏 Global Rules

1. **Language:** All code in TypeScript (strict)
2. **Comments:** Preserve existing comments unrelated to changes
3. **No duplication:** Always check existing code before creating new files
4. **Consistent patterns:** Follow what's already in the codebase
5. **Error handling:** Never swallow errors silently
6. **Security:** Never hardcode secrets, always use env vars
7. **Git:** Meaningful commit messages in conventional commit format

---

## 🔑 Environment

- **Gemini API:** Set as `GEMINI_API_KEY` (User env var)
- **Groq API:** Set as `GROQ_API_KEY` (User env var)
- **Ollama:** Running locally at `http://localhost:11434` (qwen3:8b)
- **Backend .env:** `gmao-backend/.env`
- **Frontend .env:** `gmao-frontend/.env.local`
