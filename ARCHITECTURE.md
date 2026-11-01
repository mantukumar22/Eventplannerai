# EventCraft AI — Architecture & System Design Document

## 1. System Overview
EventCraft AI is a production-grade full-stack Next.js (App Router) web application designed with strict separation of concerns, high resiliency, and zero client-side secret exposure.

```
├── app/
│   ├── api/
│   │   ├── plan/
│   │   │   ├── generate/route.ts            # Thin route handler for full plan creation
│   │   │   ├── regenerate-section/route.ts  # Thin route handler for section revisions
│   │   │   ├── trim-budget/route.ts         # Thin route handler for budget rebalancing
│   │   │   └── chat/route.ts                # Streaming contextual planner chat handler
│   ├── accessibility/page.tsx               # WCAG 2.2 AA methodology documentation
│   ├── layout.tsx                           # App shell, fonts, metadata
│   └── page.tsx                             # Main page (Hero, IntakeForm, PlanView)
├── components/
│   ├── intake/
│   │   ├── ErrorSummary.tsx                 # Accessible WCAG 2.2 AA error summary alert
│   │   ├── EventTypeSelector.tsx            # Radio button format selector
│   │   ├── EventBasicsFields.tsx            # Core event inputs (title, date, guests, budget)
│   │   ├── EventSpecificFields.tsx          # Dynamic intelligence (weddings/birthdays/community)
│   │   └── ConstraintsFields.tsx            # Traditions, must-haves, dietary, accessibility
│   ├── tabs/
│   │   ├── budget/
│   │   │   ├── BudgetSeverityBanner.tsx     # Over/under budget severity banner & trim action
│   │   │   ├── BudgetWhatIfSlider.tsx       # Live attendee what-if slider
│   │   │   ├── BudgetDonutChart.tsx         # Accessible SVG donut chart & active callout
│   │   │   └── BudgetAllocationTable.tsx    # Interactive allocation table
│   │   ├── timeline/
│   │   │   ├── TimelineProgressHeader.tsx   # Progress bar, view switch, .ics export
│   │   │   ├── TimelineFilters.tsx          # Phase, priority, and status filters
│   │   │   ├── TimelineMilestoneList.tsx    # Accessible milestone tasks & completion toggle
│   │   │   └── DayOfScheduleAgenda.tsx      # Hour-by-hour run-of-show agenda
│   │   ├── vendors/
│   │   │   ├── VendorCard.tsx               # Vendor card with booking toggle & interview questions
│   │   │   └── VendorTipsBanner.tsx         # Sourcing roadmap strategy tips
│   │   └── ideas/
│   │       ├── ThemePaletteCard.tsx         # Concept & dynamic hex swatches
│   │       ├── CustomMenuCard.tsx           # Cocktail/mocktail, courses & allergy notes
│   │       ├── ActivitiesCard.tsx           # Targeted audience engagement icebreakers
│   │       └── MoneySavingHacksCard.tsx     # High-impact budget savings tips
│   ├── chat/
│   │   ├── ChatMessageBubble.tsx            # User and AI assistant speech bubbles
│   │   └── SuggestedPrompts.tsx             # Interactive suggested question chips
│   ├── IntakeForm.tsx                       # Orchestrator form delegating to intake/*
│   ├── PlanView.tsx                         # Master plan container with assumptions
│   ├── ExportModal.tsx                      # .ICS, CSV, JSON export dialog
│   ├── ChatPlanner.tsx                      # Floating interactive planner assistant
│   └── CrownIcon.tsx                        # Brand icon motif
├── hooks/
│   └── use-section-rating.ts                # useSyncExternalStore hook for local feedback ratings
├── lib/
│   ├── api/
│   │   └── handler.ts                       # createApiHandler HOF (rate limit, zod, error translation)
│   ├── api-client/
│   │   └── client.ts                        # Typed client with timeout & structured errors
│   ├── errors/
│   │   └── app-error.ts                     # AppError class hierarchy (ValidationError, UpstreamError, etc.)
│   ├── services/
│   │   ├── plan-service.ts                  # Domain service for plan generation, trim, & section regen
│   │   └── chat-service.ts                  # Streaming chat domain service
│   ├── schemas.ts                           # Zod source of truth for inputs & outputs
│   ├── guardrails.ts                        # Sanitization, HTML strip, control char clean
│   ├── budget-math.ts                       # What-if rescaling & severity calculation
│   ├── ics-export.ts                        # Pure RFC 5545 iCalendar generation
│   ├── gemini-fallback.ts                   # Model fallback chain & timeout handler
│   ├── template-plans.ts                    # Deterministic offline rule-based plans
│   └── rate-limiter.ts                      # Sliding-window IP rate limiter
└── middleware.ts                            # Nonce-based CSP & security headers
```

---

## 2. Server / Client Boundary
- **Zero Client Keys:** `GEMINI_API_KEY` is strictly accessed within server Route Handlers and services. It is never exposed to browser bundles.
- **Thin Route Handlers:** All Route Handlers (`app/api/plan/*`) do not contain business logic or prompt engineering. They delegate validation, rate-limiting, and error mapping to `createApiHandler` and domain orchestration to `lib/services/plan-service.ts` and `lib/services/chat-service.ts`.
- **Standardized API Envelope:** Every API route returns `{ ok: true, data: T }` on success or `{ ok: false, error: { message, code, status } }` on failure with appropriate HTTP status codes (400, 429, 502, 500).

---

## 3. Resilience & Degradation Strategy
1. **Primary Model:** `gemini-3.8-flash` with a 25-second AbortController timeout.
2. **Fallback Model:** If primary fails or times out, immediately retries with `gemini-2.5-flash`.
3. **Offline Rule-Based Templates:** If both model attempts fail, network is down, or `MOCK_AI=true`, the system falls back to `lib/template-plans.ts`. The UI displays an &quot;Offline Template Blueprint&quot; badge so the user is aware of the deterministic fallback.

---

## 4. State Management & Persistence
- **Client State:** React state manages active tabs, task toggles, and slider inputs.
- **SSR Safe External Stores:** Section feedback ratings use `useSyncExternalStore` in `hooks/use-section-rating.ts`, eliminating `useEffect` setState cascading renders and SSR hydration mismatches.
- **Persistence:** Edits and plan states are auto-saved to `localStorage['eventcraft_saved_plan']` wrapped in `try/catch` with runtime Zod re-validation upon reload.
- **Local Privacy:** Feedback thumbs ratings are stored strictly in local browser storage (`localStorage['rating_*']`) without external telemetry.
