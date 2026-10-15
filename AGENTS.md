# FlashXStudy — Agent Reference Document

## Project Overview
Local-first desktop flashcard study app (Quizlet Pro replacement) for macOS and Windows.
Phase 1: Core study loop — dashboard, deck editor, and interactive flashcard study mode.

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React + TypeScript | 18 / 5 |
| Build Tool | Vite | 5+ |
| Styling | Tailwind CSS | 3+ |
| Animations | Framer Motion | 11+ |
| Icons | Lucide React | latest |
| State | Zustand | 5+ |
| Browser Storage | Dexie.js (IndexedDB) | 4+ |
| Desktop | Electron | 30+ |
| Router | React Router DOM | 6+ |

## Color Palette (CSS Variables in `src/index.css`)
| Variable | Hex | Usage |
|----------|-----|-------|
| `--bg` | `#09090b` | Page background (dark mode) |
| `--surface` | `#121215` | Cards, panels, modals |
| `--surface-2` | `#1c1c1f` | Elevated surfaces |
| `--border` | `#27272a` | Subtle borders/dividers |
| `--text` | `#fafafa` | Primary text |
| `--text-muted` | `#71717a` | Secondary/placeholder text |
| `--accent` | `#e11d48` | Primary CTA, progress bars, active states |
| `--accent-hover` | `#be123c` | Button hover |
| `--success` | `#10b981` | "Know"/Check actions, success feedback |
| `--danger` | `#f43f5e` | "Don't Know"/X actions |
| `--amber` | `#f59e0b` | Warnings, in-progress |

## File Structure
```
src/
├── main.tsx             # React entry
├── App.tsx              # Router + providers
├── index.css            # Global styles + CSS vars + animations
├── lib/
│   ├── db.ts            # Dexie.js schema
│   └── seed.ts          # Sample deck seeder
├── store/
│   └── useAppStore.ts   # Zustand store
├── types/
│   └── index.ts         # Deck, Card, StudySession types
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useStudySession.ts
├── components/
│   ├── ui/              # Reusable primitives
│   ├── dashboard/       # Dashboard-specific components
│   ├── editor/          # Deck/card editor components
│   └── study/           # Flashcard study components
└── views/
    ├── DashboardView.tsx
    ├── DeckEditorView.tsx
    └── StudyView.tsx
```

## Component Conventions
- All components use Tailwind utility classes, NOT inline styles (except Framer Motion transforms).
- Color tokens reference CSS variables via `bg-[var(--surface)]` syntax.
- Use `cn()` utility from `src/lib/utils.ts` for conditional class merging (clsx-style).
- All interactive elements have unique `id` attributes for browser testing.
- Keyboard shortcuts are managed in `useKeyboardShortcuts.ts` and registered in `StudyView`.

## Data Models (from `src/types/index.ts`)
```typescript
Deck { id, title, description, createdAt, lastStudied, cardCount }
Card { id, deckId, term, definition, order, masteryScore }
StudySession { deckId, round, trackProgress, currentIndex, cards, knownIds, missedIds }
```

## Storage Layer (`src/lib/db.ts`)
- Uses **Dexie.js** for IndexedDB in browser context.
- `window.electronAPI` IPC bridge used when running inside Electron (future enhancement).
- Always import storage helpers from `src/lib/db.ts`, not directly from Dexie.

## Keyboard Shortcuts (Study Mode)
| Key | Action |
|-----|--------|
| `Space` | Flip card |
| `Left Arrow` / `1` | Mark as "Still Learning" (Track Progress ON) / Previous card |
| `Right Arrow` / `2` | Mark as "Know" (Track Progress ON) / Next card |

## Phase Roadmap
- **Phase 1 (Current):** Dashboard + Deck Editor + Interactive Study Mode
- **Phase 2:** Spaced repetition algorithm (SM-2), streak tracking, charts
- **Phase 3:** Electron native storage (SQLite), auto-sync, export to Anki `.apkg`
