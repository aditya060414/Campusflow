# CampusFlow — Vite React 19 Frontend Client

The frontend client of **CampusFlow** is a premium, high-fidelity AI-powered student dashboard built on React 19, Vite, and Tailwind CSS. It integrates hardware-accelerated Framer Motion transitions, custom Google Fonts (`Space Grotesk` and `Inter`), and a default dark glassmorphic theme to deliver an immersive, distraction-free learning center.

---

## ✨ Features Implemented

### 1. AI Command Center (Dashboard)
* **Visual SaaS Hero Section:** An executive command banner with direct shortcuts to upload lecture notes and launch study sessions.
* **Live Telemetry & Diagnostics:** Monitors RAG service connection status, database indexing count, and cumulative academic assets generated in real-time.
* **Today's Focus & AI Tip of the Day:** Provides personalized coaching recommendations (e.g. OS deadlock prevention and DBMS normal forms checklists) pulling from local cache.

### 2. Multi-Format Knowledge Upload
* **Drag-and-Drop Uploader:** Supports uploading binary files (PDFs, TXT, and PNG/JPG images) directly into the study buddy vector index.
* **OCR & Ingestion telemetry:** Connects to the backend file parser (OCR and PDF chunking) and displays a detailed **Knowledge Indexed Success Card** summarizing extracted chunks and AI-detected topics.

### 3. Perplexity-Style Chat Workspace
* **Unified AI Search Panel:** Features a clean search bar titled "Ask anything from your notes..." alongside prompt shortcut chips (Explain Topic, Summarize, etc.).
* **Distraction-Free Workspace:** Clicking the `Maximize2` expand icon triggers an immersive, fullscreen canvas at `/dashboard/study-buddy/fullscreen`.
* **Rich Markdown Formatting:** Utilizes `react-markdown` with customized elements to render headers, bullet points, blockquotes, code blocks, and tabular datasets.
* **Persistent Session History:** Stores conversation threads in `localStorage` under the active subject namespace, with collapsible sidebar controls.
* **Source Citations:** Attaches glowing badges indicating context relevance (`📚 Notes Based`, `🧠 General Knowledge`, or `🔄 Hybrid Answer`).

### 4. Interactive Study Tools
* **3D Flashcards:** Interactive grids of flip cards featuring double-sided 3D rotations, hover tilts, and AI-generated difficulty tags (`🟢 Easy`, `🟡 Medium`, `🔴 Hard`).
* **Mock Exam Quizzes:** A Duolingo-style exam interface displaying progress bars, score counters, and conditional review dashboards upon completion.
* **Notice Analyzer circulars:** Extracts key administrative summaries, deadlines, action steps, priority levels, estimated reading times, and direct recommended actions.

---

## 📁 Key Components Directory

```text
src/
├── components/
│   ├── common/
│   │   ├── AiActionsFab.jsx      # Global bottom-right actions FAB menu
│   │   ├── ThemeToggle.jsx       # Header sun/moon animation widget
│   │   ├── ProtectedRoute.jsx    # Guards private dashboard routes
│   │   └── EmptyState.jsx        # Generic empty placeholder
│   │
│   ├── layout/
│   │   ├── DashboardLayout.jsx   # Shell hosting drifting blobs and the FAB
│   │   ├── Navbar.jsx            # Header showing student session keys
│   │   └── Sidebar.jsx           # Collapsible sidebar with navigation routes
│   │
│   └── studybuddy/
│       ├── NotesUpload.jsx       # File drag-and-drop & success cards uploader
│       ├── AskQuestion.jsx       # Standard Perplexity conversational search card
│       ├── QuickActionChips.jsx  # AI query shortcut buttons
│       ├── ChatMessage.jsx       # Rich text markdown dialog bubble
│       ├── ChatHistory.jsx       # Collapsible session history sidebar
│       ├── FullscreenChat.jsx    # Immersive study workspace container
│       ├── Flashcards.jsx        # Dynamic flashcard vector catalog grid
│       ├── FlashcardItem.jsx     # 3D double-sided flipping cards
│       └── QuizGenerator.jsx     # Duolingo-style MCQ exam sessions
│
├── context/
│   ├── AuthContext.jsx           # Decoupled mock-login and student session context
│   └── ThemeContext.jsx          # Default dark mode settings provider
│
├── hooks/
│   ├── useAuth.js                # Access student session context
│   ├── useTheme.js               # Toggle light/dark settings
│   └── useApi.js                 # Orchestrate async loads and error toasts
│
└── pages/
    ├── Login.jsx                 # Validation form card
    ├── Dashboard.jsx             # SaaS operations command homepage
    ├── StudyBuddy.jsx            # Tabbed study panel deep-linked with URLs
    ├── StudyBuddyFullscreen.jsx  # Stands alone protected full viewport route
    └── NoticeAnalyzer.jsx        # Circular analyzer with reading-time metrics
```

---

## 🚀 Running locally

To start the Vite React client, execute the following commands in your terminal:

```bash
# 1. Install frontend packages
npm install

# 2. Start the Vite server
npm run dev
```
*The client will start at **http://localhost:5173** and automatically hook up to the Express server at **http://localhost:5000**.*

---

## 📦 Build & Compilation

To compile a highly optimized production bundle:

```bash
npm run build
```
*The output bundles will be written to the `dist/` directory.*
