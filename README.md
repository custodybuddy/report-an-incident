# Report an Incident

Guided multi-step React wizard for documenting co-parenting incidents and generating polished AI summaries. Built with Vite + TypeScript and hardened for purely client-side operation.

## Features

- **Six-step wizard** covering consent, timeline, narrative, parties, evidence, and review. Every step exposes validation hints so users only advance with complete data.
- **AI report generation** powered by OpenAI chat completions with JSON schema enforcement. The review step renders the AI output inside clearly separated cards and keeps the primary actions sticky for long reports.
- **Evidence sandbox** that simulates uploads, tagging, and quick descriptions without persisting files to a backend.
- **Accessibility-friendly UI** using semantic headings, keyboard-focusable controls, and high contrast dark theme tokens.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

### Environment Variables

Create `.env.local` (ignored by git) with the following keys:

```
VITE_OPENAI_API_KEY=sk-YOUR-KEY
# Optional: support alternate env naming
OPENAI_API_KEY=sk-YOUR-KEY
```

The UI currently calls the OpenAI REST APIs directly from the browser. Use a proxy service if you need to hide keys in production.

### Available Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `npm run dev`  | Start Vite dev server with fast refresh       |
| `npm run build`| Production build (used by CI)                 |
| `npm run preview` | Preview the production build locally      |

## Project Structure

```
src/
 ├─ App.tsx                  # Wizard orchestration
 ├─ components/
 │   ├─ Header/Footer/Nav    # Layout chrome
 │   ├─ ProgressBar          # Step indicator
 │   └─ steps/               # Per-step UI modules
 ├─ services/
 │   ├─ reportGenerator.ts   # Orchestrates OpenAI requests
 │   └─ openAiInsights.ts    # Prompt builders and schema helpers
 └─ types.ts                 # Shared domain types
```

## UI Notes

- Step 5 (Review) now uses dedicated card sections for “Incident Overview” and “AI Report Output” so AI-generated content doesn’t blend with raw data. The action bar stays sticky near the viewport bottom so users can regenerate without scrolling back.
- Progress bar buttons clamp to the furthest validated step, preventing users from skipping required information.

## Accessibility & Responsiveness

- All major buttons and nav controls expose focus styles and ARIA labels for the embedded SVG icons.
- Layouts rely on CSS grid/flex with responsive breakpoints (sm/md/lg) to keep content centered on both phones and desktops.

## Contributing

1. Fork / branch.
2. `npm run dev` and make changes.
3. `npm run build` before submitting PRs.

Please open an issue if you encounter step validation bugs, accessibility gaps, or new jurisdictions to include.
