# DevVault

**Your private second brain for developers.**

🔗 **Live Demo:** [dev-vault-ashen.vercel.app](https://dev-vault-ashen.vercel.app)

DevVault is a self-contained, full-stack productivity portal built for personal use — combining project management, interview preparation, bug tracking, and technical note-taking into a single private workspace. No external APIs, no third-party data sharing. Everything you log stays yours.

---

## ✨ Features

### 🚀 SprintBoard — Kanban Project Manager
- Drag-and-drop Kanban board (Todo / In Progress / Done)
- Project and task CRUD with priorities, due dates, descriptions, and tags
- Color-coded overdue/due-today/on-track highlighting
- Per-project progress bars and task completion stats
- Tag and priority filtering, due-date and priority sorting
- Pin, edit, duplicate-safe bulk actions, and confirm-before-delete dialogs
- Confetti celebration when a project hits 100% completion
- Due-today banner visible on the Dashboard so you never miss a deadline without opening SprintBoard

### 🧠 MockMate — LeetCode Spaced Repetition Tracker
- Log problems with auto-filled title/number from a pasted LeetCode URL
- Track difficulty, category, confidence (1–5⭐), notes, and your own solution code per language
- Custom spaced-repetition intervals (Failed / Got it / Easy) — fully user-configurable
- Daily goals (Easy/Medium/Hard targets) with goal-based streak tracking
- Full-screen flashcard review mode with inline note/solution editing
- Category progress breakdown, pin/reset/bulk status actions, multi-filter library view
- All-time best-streak tracking — your record is preserved and displayed even after the current streak resets

### 🐛 BugVault — Personal Bug Diary
- Log bugs with error message, cause, fix, and a language-tagged code snippet
- Automatic language detection from pasted error messages
- "Saw this again" hit-count tracking to surface your most recurring issues
- Collapsible cards, one-click fix copying, and full-text search across title/error/tags
- Related bugs linking — tag any bug as related to one or more other bugs; links render as clickable chips on the card for fast cross-referencing

### 📝 TechNotes — Markdown Knowledge Base
- Category-organized notes with text/code note types
- Live markdown preview with GitHub-flavored markdown and syntax-highlighted code blocks
- Debounced auto-save, recently-viewed tracking, and one-click `.md` export
- Pinning, tagging, and full-text search across all notes
- Wiki-style note linking — type `[[Note Title]]` anywhere in a note; it renders as a styled internal link in preview mode and navigates directly to that note on click; unresolved titles are highlighted so you can spot broken links

### 🔎 Global Search
- Instant cross-tool search accessible from the sidebar or with **⌘/Ctrl + K** from anywhere in the app
- Searches SprintBoard tasks, MockMate problems, BugVault bugs, and TechNotes notes simultaneously
- Results are grouped by tool and deep-link directly to the matching item

### 🏠 Dashboard
- Live mini-stats per tool: active task count and due-today count for SprintBoard; due count and current + all-time best streak for MockMate; total bugs logged; total notes
- Due-today banner surfaces upcoming SprintBoard deadlines without leaving the Dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Plain CSS (per-page stylesheets, no framework) |
| Backend / Auth | Supabase (PostgreSQL, Row-Level Security, GitHub OAuth) |
| Drag & Drop | `@hello-pangea/dnd` |
| Markdown | `react-markdown`, `remark-gfm`, `react-syntax-highlighter` |
| Effects | `canvas-confetti` |

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── common/         → Layout, Sidebar, ConfirmModal (shared across all tools)
│   ├── sprintBoard/     → Kanban-specific components + types
│   ├── mockMate/        → Review/flashcard components + types
│   ├── bugVault/        → Bug card/modal components + types
│   └── techNotes/        → Notes list/editor components + types
├── pages/               → One page per route, barrel-exported
├── styles/              → One CSS file per page/feature
├── lib/                 → Supabase client
└── App.tsx              → Routing + auth state
```

**Design principles:**
- Feature-based component organization with colocated `types.ts`
- One CSS file per page — no global utility framework, no Tailwind
- Auth-gated routing with session persistence via Supabase
- Row-Level Security on every table — each user only ever sees their own data

---

## 🔐 Authentication & Data Privacy

DevVault uses **GitHub OAuth via Supabase Auth** exclusively. There is no custom `users` table — Supabase's built-in `auth.users` is the single source of truth, and every feature table references it directly via `user_id` with Row-Level Security policies enforcing per-user data isolation.

No external LeetCode, GitHub, or third-party APIs are called for data fetching. All problem, bug, task, and note data is entered manually and stored exclusively in your own Supabase project.

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- A free [Supabase](https://supabase.com) project
- A GitHub OAuth App (for authentication)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd devvault
   npm install
   ```

2. **Configure environment variables** — create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_URL=http://localhost:5173
   ```

3. **Set up Supabase**
   - Enable GitHub as an Auth provider in **Authentication → Providers**
   - Run the SQL migrations for each feature table (`projects`, `tasks`, `problems`, `daily_goals`, `mockmate_settings`, `bugs`, `notes`) with Row-Level Security enabled

4. **Run the dev server**
   ```bash
   npm run dev
   ```

---

## 📌 Status

All four core tools — SprintBoard, MockMate, BugVault, and TechNotes — are fully implemented and actively used as a personal daily-driver productivity suite. Recent additions include a cross-tool global search, live Dashboard stats, a due-today banner, MockMate best-streak tracking, BugVault related-bug linking, and TechNotes wiki-style `[[Note Title]]` linking.

---

## 📄 License

Personal project — not currently licensed for redistribution.