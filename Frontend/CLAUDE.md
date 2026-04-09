# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

- `npm run dev` - Start Vite development server (default: http://localhost:5173)
- `npm run build` - Build production application with Vite
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Backend Dependency

The frontend communicates with a backend API at `http://localhost:8080`. The backend must be running for full functionality.

## Architecture Overview

### Core Technology Stack

- **Framework**: React 19 with Vite 8
- **Routing**: React Router v7 (BrowserRouter)
- **HTTP Client**: Axios with custom interceptors (token refresh, auth headers)
- **Icons**: react-icons (Feather Icons via `FiXxx`)
- **Styling**: Pure CSS with CSS custom properties (design tokens in `index.css`)
- **State Management**: React Context API (AuthContext) + local useState
- **Authentication**: JWT tokens stored in localStorage with refresh token flow
- **Build Tool**: Vite with @vitejs/plugin-react

### App Structure

```
src/
├── api/                    # Axios API clients
│   ├── axios.js           # Base instance with interceptors
│   ├── authApi.js         # Authentication endpoints
│   ├── quotationApi.js    # Quotation calculation & management
│   ├── healthPlanApi.js   # Health plan CRUD
│   ├── userApi.js         # User profile & account
│   ├── adminApi.js        # Admin user management
│   └── networkApi.js      # Healthcare network management
├── contexts/              # React Context providers
│   └── AuthContext.jsx    # Auth state, token management, user profile
├── hooks/                 # Custom React hooks
│   └── useSharePdf.js    # Web Share API for PDF sharing
├── components/            # Reusable components
│   ├── Layout.jsx         # Main app layout with sidebar
│   ├── ProtectedRoute.jsx # Route protection (auth & admin)
│   └── ConfirmModal.jsx   # Generic confirm dialog
├── pages/                 # Page components (route-based)
│   ├── landing/           # Landing page
│   ├── auth/              # Login, register, verify, password reset
│   ├── dashboard/         # Health plans listing/discovery
│   ├── quotations/        # Calculator, history, detail view
│   ├── profile/           # User settings & account
│   └── admin/             # Admin panels (users, plans, networks)
├── assets/                # Images, fonts
├── App.jsx                # Main router setup
├── main.jsx               # React entry point
└── index.css              # Global design system (CSS variables)
```

### Authentication Flow

- JWT token + refresh token stored in `localStorage`
- `AuthContext` provides `login()`, `register()`, `logout()`, `loadProfile()`
- Axios interceptor auto-attaches `Authorization: Bearer` header
- 401 responses trigger automatic token refresh via refresh token
- User roles: `ADMIN` vs regular `USER` (from JWT payload)
- `ProtectedRoute` component handles route protection with `adminOnly` flag

### API Layer

All API communication uses Axios clients in `/src/api/`. The base instance (`axios.js`) handles:

- Base URL configuration (`http://localhost:8080`)
- Automatic token attachment via request interceptor
- 401 response interception with token refresh logic

### Key API Endpoints

```
Auth:       /auth/login, /auth/register, /auth/verify, /auth/forgot-password, /auth/reset-password
Users:      /users/profile, /users/profile/update, /users/profile/change-email
Plans:      /health-plans/all, /health-plans/:publicId, /health-plans/newHealthPlan
Quotations: /quotations/calculate, /quotations/save, /quotations/my-quotations
Admin:      /admin/all, /admin/block/:publicId, /admin/unblock/:publicId
Networks:   /network/all-networks, /network/new-network, /network/update/:publicId
```

### Routing Structure

- **Public**: Landing page, login, register, verify email, forgot/reset password
- **Protected**: Dashboard (health plans), quotations (calculator, history, detail), profile
- **Admin-only**: Users management, plans CRUD, networks CRUD

### Design System

- **Theme**: "Obsidian & Cyan" - dark sidebar (#0b1222), light body
- **Fonts**: Syne (display), Figtree (body) via Google Fonts
- **Colors**: Accent blue (#3b82f6), success green (#1a7f37), error red (#cf222e)
- **Styling**: CSS custom properties defined in `index.css`, no CSS framework

### Key Features

- Health plan browsing with search and filtering
- Dynamic quotation calculator (age ranges, modalities)
- PDF export and browser share (Web Share API)
- Save and review quotation history
- User profile management
- Admin CRUD for plans, users, and networks
- Role-based access control

## Key Patterns

### API Calls

All data fetching uses Axios clients from `/src/api/`:

- Each domain has its own API file (authApi, quotationApi, etc.)
- Functions return Axios promises
- Error handling done at the component level with try/catch

### Route Protection

- `ProtectedRoute` component wraps protected routes in `App.jsx`
- Checks `AuthContext` for authentication state
- `adminOnly` prop restricts to admin users
- Redirects to login if unauthenticated

### Form Handling

- Inline validation in components (no form library)
- Local state with `useState` for form fields
- Manual error state management

### Error Handling

Standard pattern: try/catch around API calls with local error state displayed to the user.

## Visual Development & Testing

### Design System

The project follows S-Tier SaaS design standards inspired by Stripe, Airbnb, and Linear. All UI development must adhere to:

- **Design Principles**: `/context/design-principles.md` - Comprehensive checklist for world-class UI

### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__plugin_playwright_playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__plugin_playwright_playwright__browser_console_messages`

### Comprehensive Design Review

For significant UI changes or before merging PRs, use the design review agent:

```bash
/design-review
```

The design review agent will:

- Test all interactive states and user flows
- Verify responsiveness (desktop/tablet/mobile)
- Check accessibility (WCAG 2.1 AA compliance)
- Validate visual polish and consistency
- Test edge cases and error states
- Provide categorized feedback (Blockers/High/Medium/Nitpicks)

### Playwright MCP Integration

#### Essential Commands for UI Testing

```javascript
// Navigation & Screenshots
mcp__plugin_playwright_playwright__browser_navigate(url);
mcp__plugin_playwright_playwright__browser_take_screenshot();
mcp__plugin_playwright_playwright__browser_resize(width, height);

// Interaction Testing
mcp__plugin_playwright_playwright__browser_click(element);
mcp__plugin_playwright_playwright__browser_type(element, text);
mcp__plugin_playwright_playwright__browser_hover(element);

// Validation
mcp__plugin_playwright_playwright__browser_console_messages();
mcp__plugin_playwright_playwright__browser_snapshot();
mcp__plugin_playwright_playwright__browser_wait_for(text / element);
```

### Design Compliance Checklist

When implementing UI features, verify:

- [ ] **Visual Hierarchy**: Clear focus flow, appropriate spacing
- [ ] **Consistency**: Uses CSS design tokens, follows existing patterns
- [ ] **Responsiveness**: Works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] **Accessibility**: Keyboard navigable, proper contrast, semantic HTML
- [ ] **Performance**: Fast load times, smooth animations (150-300ms)
- [ ] **Error Handling**: Clear error states, helpful messages
- [ ] **Polish**: Micro-interactions, loading states, empty states

## When to Use Automated Visual Testing

### Use Quick Visual Check for:

- Every front-end change, no matter how small
- After implementing new components or features
- When modifying existing UI elements
- After fixing visual bugs
- Before committing UI changes

### Use Comprehensive Design Review for:

- Major feature implementations
- Before creating pull requests with UI changes
- When refactoring component architecture
- After significant design system updates
- When accessibility compliance is critical

### Skip Visual Testing for:

- Backend-only changes (API, database)
- Configuration file updates
- Documentation changes
- Non-visual utility functions

## Additional Context

- Design review agent configuration: `/.claude/agents/design-review-agent.md`
- Design principles checklist: `/context/design-principles.md`
