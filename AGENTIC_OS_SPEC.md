# الشيهانة (Shihana) — Agentic OS Build Specification (for Claude Code & Codex)

You are building a personal "Agentic OS" named **الشيهانة** (Latin: *Shihana*): a **custom
dashboard UI built on top of Claude Code, Codex, Gemini, and Hermes (with local Ollama models)**,
with natural Saudi Arabic voice, a standardized MCP tool registry, and a Markdown vault linked to Obsidian.
This document is the full, authoritative specification.

**Naming:** the product name shown everywhere in the UI (sidebar, hero title, window title,
tray, installer, Start-menu entry) is `الشيهانة`. Use `shihana` for anything that must be
ASCII (package names, app id `com.shihana.os`, folder names, file names). The name is read
from config, never hard-coded in components.

**Target machine:** Windows 11, Node.js and Python 3.11 installed, NVIDIA GPU, Ollama installed.
Everything runs locally on `127.0.0.1`. This build must work natively and reliably on Windows.

---

## 0. How to work (read this first)

A previous attempt at this system failed and was deleted. To avoid a repeat:

1. **Build the whole system in one run, phase by phase** (section 10), in order, Phase 0
   through Phase 8 (Phase 9 only if everything before it is green). Do not start a phase
   until the previous phase's acceptance checks pass. **Do not stop to ask for confirmation
   between phases** — continue until the last phase is done or you are genuinely blocked.
   - Before starting, read `PROGRESS.md` if it exists and **resume from the first unfinished
     phase**; never redo or rewrite finished phases. This makes the same command safe to re-run.
   - After each phase: run its acceptance checks, record the result (commands run + real
     output) in `PROGRESS.md`, and `git commit` (run `git init` first if needed).
   - If a check fails, fix it before moving on. If you cannot fix it after three real
     attempts, record exactly what fails and why in `PROGRESS.md`, then continue only with
     phases that do not depend on it.
   - Checks that need a human (speaking into the microphone, hearing audio, signing in to
     Google, looking at the animation) cannot be passed by you. Implement the feature, cover
     what you can with automated tests, and list each such check with exact steps in
     `HUMAN_CHECKS.md`. Never mark them as passed.
   - Things only the user can supply (`GEMINI_API_KEY`, Google OAuth client id/secret) are read from
     `os.config.json` / environment; when missing, the feature shows "Not connected". Do not
     invent credentials and do not block the build on them.
   - Finish with a final report: what was built, what passed, what is in `HUMAN_CHECKS.md`,
     and the one command to launch the app.
2. **Every phase must end runnable.** No phase may leave the app broken.
3. **Never fake state.** If something is not connected or not implemented, the UI says
   "Not connected" / "Not set up". No mock numbers, no hard-coded "connected" badges, no
   placeholder data presented as real. `FakeEngine` is strictly for automated tests or explicit test mode, never counted as a real connection.
4. **Verify CLI flags before relying on them.** Run `claude --help`, `codex --help`, `gemini --help`, and `hermes --help`
   and adapt the engine adapters to the installed versions.
5. **Keep it small.** No database server, no Docker, no auth provider, no cloud backend. Files + JSON.
6. Write a short `README.md` (how to install, start, stop) and keep it current.
7. Write tests for the bridge (router, vault API, tool registry, engine adapters with a fake engine).

---

## 1. Concept

"Two front doors. One shared brain. One shared memory. Four interchangeable engines. One unified tool registry."

```
INTERACT                COORDINATE                 ROUTE            EXECUTE
                        ┌──────────────┐
                        │SPEECH SERVICE│                      ┌─ 01 RULES + SAVED DATA
┌──────────────┐        │Whisper+Gemini│                      │   (no model call)
│OBSIDIAN PLUGIN│──┐    └──────┬───────┘                      │
└──────────────┘  │           │                 ┌─────┐      ├─ 02 QUICK ANSWER
 YOU (Multi-Engine)├──▶ ┌────┴─────┐ ────────▶ │ JEV │ ────▶│   (Gemini Flash / Ollama / Haiku)
┌──────────────┐  │     │THE BRIDGE│           │router│      │
│  SHIHANA HUD │──┘     └────┬─────┘           └─────┘      └─ 03 REAL WORK
└──────────────┘             │                                   (Claude / Codex / Gemini / Hermes)
  desktop app                │ reads + records + runs MCP tools   + Skill Package v2 + Verification
                        ┌────┴──────────────────────────────────────────┐
                        │ THE VAULT — Markdown files, [[WikiLinks]],    │
                        │ reports, conversations, request logs, skills  │
                        └───────────────────────────────────────────────┘
```

- **You** speak (in Saudi Arabic or English) or click. Replies come on screen and (optionally) spoken in natural Saudi dialect.
- **The HUD** — custom control surface delivered as a frameless Electron desktop app (§9.0).
- **Obsidian plugin** — the same dashboard inside Obsidian. Second front door.
- **Multi-Engine (`claude` ⇄ `codex` ⇄ `gemini` ⇄ `hermes`)** — the active engine can be switched at any time from the top bar. When switching mid-session, the Bridge injects a shared **Handoff Summary** so the new engine continues seamlessly.
- **The Bridge** — one shared backend. Receives requests from both front doors, manages the **Unified MCP Tool Registry**, enforces step limits and permissions, and verifies output artifacts.
- **Speech service** — speech→text (`faster-whisper`) and text→speech (`Gemini Audio API` for natural Saudi Arabic + `piper` local fallback + `kokoro` for English).
- **JEV** — request router. Picks the cheapest/fastest tier and respects `"localOnlyMode"`.
- **The Vault** — a folder of Markdown files. It is the single source of truth for long-term memory across all engines.

---

## 2. Repository layout

```
shihana-os/
  package.json                # npm workspaces
  os.config.json              # user config (see §3) — gitignored, created from os.config.example.json
  apps/
    bridge/                   # Node 20+, TypeScript, Fastify + ws + MCP Tool Registry
    hud/                      # React 18 + Vite + TypeScript + three.js (the UI)
    desktop/                  # Electron shell: frameless window, tray, starts/stops bridge + speech
    speech/                   # Python 3.11, FastAPI + uvicorn + google-genai + faster-whisper + markitdown
    obsidian-plugin/          # TypeScript, esbuild
  packages/
    shared/                   # TS types shared by bridge + hud + plugin (API + WS + Tool types)
  vault-template/             # starter vault copied on first run (§4)
  scripts/
    dev.ps1                   # dev mode: speech + bridge + Vite + Electron with hot reload
  README.md
```

Ports (all bound to `127.0.0.1` only): bridge `4317`, speech `4318`, HUD dev server `5173` (dev only).

---

## 3. Configuration — `os.config.json`

```jsonc
{
  "osName": "الشيهانة",
  "assistantName": "الشيهانة",
  "ownerName": "خالد",
  "uiLanguage": "ar",                 // "ar" | "en" — supports full RTL Arabic UI
  "avatarPath": "",
  "vaultPath": "C:/Users/<user>/Documents/shihana-vault",
  "workspaces": [                     // External project folders agents may work on when selected
    { "name": "Shihana Vault", "path": "C:/Users/<user>/Documents/shihana-vault" }
  ],
  "defaultEngine": "codex",           // "codex" | "claude" | "gemini" | "hermes"
  "localOnlyMode": false,             // when true, strictly blocks cloud engines and uses Hermes/Ollama + Piper
  "agentLimits": {
    "maxSteps": 15,                   // AutoGPT/Dify pattern: prevents infinite tool loops
    "commandTimeoutMs": 60000         // Cline pattern: kills hung shell commands cleanly
  },
  "permissions": {
    "mode": "tiered",                 // "tiered" | "prompt-all" | "read-only"
    "writableFolders": [".os", "sessions", "daily", "_inbox", "core", "output", "skills"]
  },
  "engines": {
    "claude": { "command": "claude", "models": [] },
    "codex":  { "command": "codex",  "models": [] },
    "gemini": { "provider": "sdk-or-cli", "command": "gemini", "models": ["gemini-2.5-pro", "gemini-2.5-flash"] },
    "hermes": { "protocol": "acp", "command": "hermes", "ollamaUrl": "http://127.0.0.1:11434", "models": ["qwen2.5:14b", "qwen2.5-coder:14b"] }
  },
  "jev": {
    "enabled": true,
    "quickModel": { "provider": "gemini", "model": "gemini-2.5-flash" } // "gemini" | "ollama" | "claude-cli"
  },
  "speech": {
    "stt": { "model": "large-v3-turbo", "device": "cuda", "computeType": "int8_float16", "language": "auto" },
    "tts": {
      "en": "kokoro",
      "ar": "gemini",                 // uses Gemini 2.5 Flash Native Audio with Saudi persona
      "arFallback": "piper",          // offline fallback
      "geminiVoice": "Aoede",         // female voice ("Aoede" or "Kore")
      "saudiDialectRewrite": true
    }
  },
  "audience": [
    { "platform": "snapchat", "handle": "", "count": null, "savedAt": null },
    { "platform": "instagram", "handle": "", "count": null, "savedAt": null }
  ]
}
```

The bridge generates a random `authToken` on first run and stores it in `<vault>/.os/token`.

---

## 4. The Vault & Obsidian Graph Memory

A plain folder of Markdown, compatible with Obsidian. Created from `vault-template/` on first
run if `vaultPath` does not exist. **Never delete user files**; agents may only write inside the configured `writableFolders` (`.os/`, `sessions/`, `daily/`, `_inbox/`, `core/`, `output/`, `skills/`) unless the user explicitly approves a `permission.request` prompt via the HUD.

```
<vault>/
  AGENTS.md            # shared instructions for coding agents (Codex / Hermes read this)
  CLAUDE.md            # one line: @AGENTS.md   (Claude Code reads this)
  GEMINI.md            # one line: @AGENTS.md   (Gemini reads this)
  _inbox/              # raw captures, pastes, transcripts, auto-converted Office/PDF docs
  core/                # foundation files (below)
  daily/               # YYYY-MM-DD.md daily notes
  sessions/            # saved conversations, one .md per chat
  business/  content/  growth/  sources/  wiki/  projects/
  output/              # things agents produce: designs, images, videos, reports
  skills/              # one folder per skill package (§6)
  .os/                 # machine state — not for humans
    token
    state.json         # pinned skills, last engine, UI prefs
    facts.json         # saved facts (§4.2)
    logs/requests.jsonl
```

### 4.1 Foundation files (shown on the Memory page as 8 cards)

| Card | File | Purpose |
|---|---|---|
| Personal profile | `core/profile.md` | identity, background, recorded preferences |
| Goals & direction | `core/goals.md` | goals and direction |
| Patterns & lessons | `core/lessons.md` | observations and lessons kept over time |
| Writing preferences | `core/writing.md` | Saudi female persona («الشيهانة»), Saudi white dialect rules |
| OS guide | `core/os-guide.md` | where the assistant should look for context & skill rules |
| Shared instructions | `AGENTS.md` | how coding assistants should work in this OS |
| Knowledge index | `core/index.md` | compressed Repo-Map style index of files, headings, and 1-line summaries |
| Skill registry | `core/skills.md` | generated list of skills (regenerated by the bridge) |

Defaults: `writing.md` and `os-guide.md` are `Used in chat`.
**`vault-template/core/writing.md` must come pre-populated** with instructions for the assistant to speak as «الشيهانة» (female persona) using natural, concise Saudi white dialect (لهجة سعودية بيضاء مهنية) while keeping technical terms (`Git`, `Server`, `API`, `Commit`) in natural English.

### 4.2 Saved facts

`facts.json`: `[{ id, text, enabled, createdAt, source }]`. Explicit memories the user can add, correct, pause or remove. Even when using Hermes, **Shihana's `facts.json` and `core/` remain the primary memory source**.

### 4.3 Compressed Index, `[[WikiLinks]]` Resolution & Cross-Engine Handoff

Inspired by **Aider Repo-Map** and **Obsidian Smart Connections**:
1. **Compressed Vault Map (`core/index.md`):** Instead of dumping full files into context, the Bridge maintains a fast in-memory index (updated via file watcher) that records each file's path, frontmatter tags, H1/H2 headings, and outgoing `[[WikiLinks]]`.
2. **Automatic `[[WikiLinks]]` Expansion:** When a user or skill references a vault file, the Bridge automatically parses any `[[Linked Note]]` inside it (1 hop deep) and attaches a brief snippet of those linked notes to the context.
3. **Cross-Engine Session Handoff:** Because a Claude `sessionId` cannot resume a Codex, Gemini, or Hermes session, switching engines inside an active chat triggers the Bridge to pass a structured Handoff Summary of `sessions/<id>.md` + touched files + active tool outputs to the newly selected engine.

### 4.4 Memory Growth & Self-Improving Skill Learning (`/learn`)

- **Post-Chat Facts:** After each finished chat, a cheap follow-up call (tier-2 model) extracts at most 3 candidate memories. They appear in the HUD as **suggested facts**; nothing is saved silently.
- **"Turn into a skill" (`/learn` button — Hermes pattern):** In any successful chat session, the user can click `حوّل هذه المهمة إلى مهارة` (Turn task into skill). The active agent analyzes the conversation and tool calls, drafts a complete **Skill Package v2** (§6) including `SKILL.md` and any helper script, and displays a preview in the HUD for user approval before saving.

---

## 5. The Bridge (`apps/bridge`)

Node + TypeScript, Fastify for HTTP, `ws` for streaming. Single process.

### 5.1 HTTP API (all under `/api`, JSON)

```
GET  /health                     -> { ok, version, engines: {claude:{...}, codex:{...}, gemini:{...}, hermes:{...}}, speech:{up, ttsProvider}, vault:{path, fileCount} }
GET  /config                     -> safe subset of config (no token)
PUT  /config                     -> update config settings

GET  /vault/tree                 -> folders with file counts
GET  /vault/files?folder=&q=     -> [{ path, title, folder, tags, links, updatedAt }]
GET  /vault/file?path=           -> { path, content, backlinks: string[] } (strict path check inside vault)
POST /vault/ingest               -> multipart file upload (PDF/Docx/Xlsx) -> converts via MarkItDown and saves to _inbox/
GET  /vault/recent?limit=        -> recently updated files
GET  /memory/foundations         -> the 8 cards with status
PUT  /memory/foundations/:id     -> { mode: "chat" | "demand" }
GET/POST/PATCH/DELETE /memory/facts

GET  /skills                     -> [{ slug, name, displayName, description, category, kind, requiredTools, missingTools, pinned }]
PUT  /skills/:slug/pin           -> { pinned }
POST /skills/:slug/run           -> { sessionId }
POST /skills/learn               -> { sessionId, draftSkill } (generates a Skill Package v2 from session history)

GET  /tools                      -> list of registered Core MCP Tools and their availability status
POST /system/free-vram           -> unloads idle Ollama models and resets Whisper to free GPU VRAM

GET  /sessions                   -> chat list
GET  /sessions/:id               -> messages
GET  /usage                      -> per-engine usage or { available:false, reason }
GET  /logs/requests?limit=       -> recent router decisions
```

### 5.2 WebSocket `/ws`

Client → server:
```ts
type EngineId = "claude" | "codex" | "gemini" | "hermes";

{ type: "chat.send", sessionId?: string, text: string, engine: EngineId, model?: string, workspacePath?: string, source: "hud"|"obsidian", viaVoice?: boolean }
{ type: "chat.cancel", sessionId: string }
{ type: "permission.reply", requestId: string, approved: boolean }
```
Server → client:
```ts
{ type: "route",              sessionId, tier: 1|2|3, reason }
{ type: "chat.delta",         sessionId, text }
{ type: "chat.tool",          sessionId, name, step: number, maxSteps: number, summary }
{ type: "permission.request", sessionId, requestId, tier: "write"|"shell"|"external", tool, pathOrCommand, reason }
{ type: "chat.verify",        sessionId, passed: boolean, details: string, artifacts: string[] }
{ type: "chat.done",          sessionId, fullText, tier, engine, ms, artifacts?: string[] }
{ type: "chat.error",         sessionId, message }
{ type: "status",             activity: "standing-by"|"listening"|"thinking"|"working"|"verifying"|"speaking" }
{ type: "ui.command",         action: string, target: string }
```

### 5.3 Engine adapters & JSON Tool-Call Healer

One unified interface, four implementations (`ClaudeEngine`, `CodexEngine`, `GeminiEngine`, `HermesEngine`) plus `FakeEngine` (for testing only):

```ts
interface Engine {
  id: "claude" | "codex" | "gemini" | "hermes";
  detect(): Promise<{ installed: boolean; version?: string; models?: string[] }>;
  run(opts: {
    prompt: string;
    cwd: string;
    model?: string;
    resumeId?: string;
    handoffContext?: string;
    maxSteps: number;
    signal: AbortSignal;
  }): AsyncIterable<EngineEvent>;
}
```

- **Claude Code:** headless print mode with streaming JSON (`claude -p --output-format stream-json --verbose`).
- **Codex:** non-interactive exec with JSON events (`codex exec --json`).
- **Gemini:** supports `@google/genai` SDK tool-calling loop or Gemini CLI, native multimodal input (video, images, audio, large vault context), and Google Search grounding.
- **Hermes (Local Agent):** connects via **ACP (Agent Client Protocol)** or CLI wrapper backed by local **Ollama** models (`qwen2.5`, etc.).
- **JSON Tool-Call Healer (Qwen-Agent pattern):** When routing tool calls from local models (`hermes` / `ollama`), the Bridge runs a lightweight JSON sanitizer/healer (fixes trailing commas, unescaped quotes, or markdown code fences around JSON arguments) before executing the tool, preventing fragile local model failures.

**Windows & Security Rules for Spawning:**
- Resolve `.cmd` shims properly on Windows.
- **Pass prompts on `stdin` with explicit UTF-8 encoding**, never as CLI arguments (preserves Arabic text and long context).
- Kill the entire process tree on cancel or timeout (`taskkill /T /F /PID`).

---

## 6. Skills (`Skill Package v2`) & Unified MCP Tool Registry

Learned from **Anthropic MCP, NousResearch Hermes, OpenHands, Microsoft MarkItDown, Playwright MCP, and Cline**: skills are not passive text snippets; they are structured, verifiable packages backed by a unified tool registry.

### 6.1 Skill Package v2 Structure (`skills/<slug>/`)

Each skill folder in `skills/<slug>/` can contain:
```
skills/<slug>/
  SKILL.md             # Contract, instructions, verification rules, and self-learned pitfalls
  scripts/             # Optional deterministic helper scripts (Python / Node / PowerShell)
  templates/           # Optional output templates (Markdown / HTML / JSON)
```

**`SKILL.md` Frontmatter Specification:**
- `name` **must** match the kebab-case folder `<slug>` (e.g. `ai-radar`) for standard Agent Skills & Hermes compatibility.
- `displayName` holds the human-readable Arabic/English title.
- `required_tools` lists tools from the Core MCP Registry needed to run the skill. If any tool is unavailable, the HUD shows a warning badge before running.
- `verify` defines the **OpenHands-style Verification Rule** that the Bridge checks before marking the run as complete.

```markdown
---
name: deep-researcher
displayName: الباحث الموثق (Deep Researcher)
description: يبحث في المصادر الحية ويقارن النتائج ويحفظ تقريراً موثقاً في الخزنة مع تحديث الفهرس.
category: research        # research | create | video | business | tools
kind: Live research       # Live research | Draft in dashboard | Diagram studio | Desktop workflow
required_tools: [web_reader, vault_graph]
inputs: [topic]
outputs: [sources/<slug>-report.md]
verify:
  type: file_exists_and_non_empty
  target: sources/
---
## Instructions
1. Step-by-step instructions the agent follows…

## Known Pitfalls (Updated by /learn)
- On Windows, always use UTF-8 encoding when running local scripts in `scripts/`.
```

### 6.2 The 5 Core MCP Tools (`apps/bridge/src/tools/`)

The Bridge exposes these 5 standardized tools (with flat JSON schemas) to all engines via MCP / tool adapters:

1. **`vault_graph` (Auto-Approved — Safe):**
   - Reads, searches, and lists files inside the Vault, automatically returning outgoing `[[WikiLinks]]` and incoming backlinks.
   - Writes inside `writableFolders` (`_inbox/`, `daily/`, `output/`, `sources/`, `sessions/`). Writing outside `writableFolders` triggers a `permission.request` over WebSocket.
2. **`doc_converter` (Auto-Approved — Safe, powered by `MarkItDown`):**
   - Converts PDF, Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`), HTML, or audio files into clean structured Markdown inside `_inbox/` so any engine can read them effortlessly.
3. **`web_reader` (Auto-Approved — Safe, powered by `Playwright` Accessibility Tree):**
   - Fetches web pages and extracts the clean **DOM / Accessibility Tree** and readable Markdown text without requiring heavy screenshots or vision models, enabling fast research even on local Ollama models.
4. **`safe_shell` (Tiered Permission — Cline Pattern):**
   - Runs deterministic helper scripts from `skills/<slug>/scripts/` or workspace commands (`git status`, `npm test`).
   - Enforces `commandTimeoutMs` (default 60s), captures `stdout` + `stderr` in UTF-8, and returns structured error output so the agent can self-correct. Any destructive or outside-workspace command pauses and emits `permission.request` to the HUD.
5. **`artifact_verifier` (Mandatory Post-Run Check — OpenHands Pattern):**
   - Automatically invoked before `chat.done` on skill and Design runs. Verifies that any promised output file (in `output/`, `sources/`, or `daily/`) actually exists on disk, has size $> 0$ bytes, and is valid Markdown/HTML/Media. If verification fails, the Bridge feeds the failure back to the engine for one automatic self-correction step.

### 6.3 Starter Skills Library (Seeded in `vault-template/skills/`)

Seed `vault-template/skills/` with these 8 practical starter skills:

| Domain | Slug (`name`) | `displayName` | Required Tools & Output |
|---|---|---|---|
| Meta / Learning | `skill-builder` | صانع المهارات (`/learn`) | Analyzes session history → writes & verifies a new `skills/<slug>/SKILL.md` |
| Engineering | `repo-inspector` | فاحص المشاريع البرمجية | `safe_shell`, `vault_graph` → architecture audit & bug report |
| Research | `morning-intel` | موجز الصباح التقني | `web_reader`, `vault_graph` → daily brief in `daily/` |
| Research | `deep-researcher` | الباحث الموثق | `web_reader`, `doc_converter` → cited report in `sources/` |
| Content | `content-cascade` | تحويل الفيديو إلى محتوى | Speech `/stt` or Gemini Video + `core/writing.md` → 3 Saudi-dialect posts |
| Productivity | `plan-today` | تخطيط اليوم | `vault_graph` (reads goals + yesterday's note) → today's plan in `daily/` |
| Memory | `vault-cleanup` | تنظيف وفهرسة الخزنة | `vault_graph`, `doc_converter` → organizes `_inbox/` and updates `core/index.md` |
| Design | `visual-studio` | استوديو التصميم والمخططات | `artifact_verifier` → generates interactive HTML/Mermaid/SVG/Media in `output/` |

---

## 7. JEV Router & Local-Only Privacy Mode

`route(request) -> { tier, reason }`.
- When `jev.enabled` is false, everything goes to Tier 3 on the selected engine.
- When `localOnlyMode` is true, Tier 2 and Tier 3 strictly route to local providers (`ollama` / `hermes`) and local TTS (`piper`), blocking any outbound cloud API calls.

| Tier | Name | What it does | Example |
|---|---|---|---|
| 1 | Rules + saved data | Instant lookup, **no model call**. Handles time/date, daily note, goals, facts, file counts, quick voice note capture to `_inbox/`, and voice UI navigation commands. | "افتح المهارات", "سجلي فكرة سريعة...", "What are my priorities today?" |
| 2 | Quick answer | Fast lightweight model (`gemini-2.5-flash` or local `ollama`), no heavy agent loop. | "لخص ملاحظة أخبار الذكاء الاصطناعي اليوم" |
| 3 | Real work | Full agent run in Claude Code, Codex, Gemini, or Hermes with MCP Tools, step limits, and output verification. | "ابحث عن أحدث تطورات MCP واكتب تقرير في الخزنة" |

Append every decision to `.os/logs/requests.jsonl`: `{ ts, source, text, tier, reason, engine, ms, ok }`.

---

## 8. Speech Service (`apps/speech`) — Saudi Dialect Voice & Document Ingestion

Python FastAPI in its own venv on port `4318`.

```
GET  /health          -> { ok, stt:{model,device}, tts:{arProvider, enProvider, voices} }
POST /stt             multipart audio (webm/opus) -> { text, language }
POST /tts             { text, lang?: "ar"|"en", voice? } -> audio/wav
POST /convert         multipart file (pdf/docx/xlsx/pptx) -> { markdown, title } (powered by MarkItDown)
POST /unload          -> frees Whisper CUDA memory on demand
```

- **STT:** `faster-whisper`, model `large-v3-turbo` on CUDA (`int8_float16` compute type to conserve VRAM alongside Ollama); fall back to `small` on CPU if CUDA fails. Auto-detects Arabic and English.
- **TTS (Arabic — Primary):** **Gemini Audio API (`google-genai` SDK, model `gemini-2.5-flash`, `response_modalities=["AUDIO"]`, voice `Aoede` or `Kore`)**.
  - Uses a built-in system instruction commanding it to speak as «الشيهانة» in warm, natural **Saudi white dialect (لهجة سعودية بيضاء)**, converting any formal Arabic phrasing into natural spoken Saudi dialect on the fly while pronouncing technical terms (`Git`, `Server`, `API`, `Docker`) naturally in English.
  - Converts the returned `24kHz PCM` stream into standard `audio/wav` bytes.
- **TTS (Arabic — Offline Fallback):** `piper` with an Arabic voice when `GEMINI_API_KEY` is missing, offline, or `localOnlyMode` is enabled. If neither is available, return HTTP `501` and the HUD displays the text reply with a notice.
- **TTS (English):** `kokoro` (`kokoro-onnx`).
- **Voice UI Commands (Tier 1):** Arabic and English voice commands ("افتح المهارات", "شغل مهارة تخطيط اليوم", "حول على جيمناي", "حول على هيرميس", "open memory", "switch to codex") execute instantly via WS `ui.command` without calling a model.

---

## 9. Shihana HUD (`apps/hud` + `apps/desktop`)

### 9.0 Desktop shell (`apps/desktop`, Electron)

- **Window:** frameless (`frame: false`), dark background (`#060A12`), opens maximized; `F11` toggles fullscreen.
- **Non-blocking Startup (Crucial Fix):** On launch, the main process starts the bridge and speech service. **As soon as the Bridge `/health` is ready, show the main HUD window immediately** so text chat and vault browsing work right away. If the speech service is still loading models or fails to start, show "Speech loading / offline" in the status pill rather than blocking the app launch.
- **Global Hotkeys:**
  - `Ctrl+Alt+Space`: Bring window forward and start voice conversation.
  - `Ctrl+Alt+N`: Quick voice/text capture directly into `_inbox/` (Tier 1).
- **Secure Credential Bridge:** OAuth tokens and API keys encrypted via Electron `safeStorage` are passed securely to the local Bridge via an authenticated loopback handshake on startup.

### 9.1 Visual Language, Engine Themes & Streamer Privacy Mode

- Supports both Arabic (`dir="rtl"`) and English (`dir="ltr"`) seamlessly using bundled `IBM Plex Sans Arabic`, `Space Grotesk`, and `Inter`.
- **Streamer / Creator Privacy Toggle:** A quick eye icon in the top bar blurs sensitive personal data (email subjects, file paths, exact follower counts) so the user can record or stream the HUD safely.
- **Theme & 3D Particle Scene (`three.js`) follows the active engine:**
  - **Codex:** Cool white / electric blue spiral galaxy.
  - **Claude Code:** Warm dark brown with soft orange (`#D97757`) spherical cloud.
  - **Gemini:** Deep cosmic indigo with dual-tone cyan/violet (`#4E82EE` / `#A855F7`) harmonic wave rings.
  - **Hermes (Local):** Emerald cyber-green (`#10B981`) geometric lattice matrix.

### 9.2 Pages & Interactive Design Studio

- **Dashboard, Skills, Files Modal, Memory, Calendar, Inbox, Settings, Apps & Connections** as specified in layout.
- **Chat Panel Enhancements:**
  - Displays step progress (`Step 3/15 · Running web_reader`), permission approval cards (`Allow` / `Deny`), verification badge (`✔ Verified output`), and the `حوّل إلى مهارة (/learn)` button on completed runs.
- **Design Page (Interactive Studio):**
  - Brief box + attach vault files + output-type chips (`Interactive HTML` · `Mermaid Diagram` · `Image` · `Video`).
  - Includes a live **Sandboxed Preview Pane** for immediate rendering of generated HTML/Canvas/Diagrams alongside the gallery of verified files in `output/`.

---

## 10. Build phases and acceptance checks

**Phase 0 — Scaffold.** Workspaces, shared types, config loading, `vault-template` (including Saudi persona in `core/writing.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), first-run vault creation, token generation.
✔ `npm install` and `npm run build` succeed; a new vault is created with all §4 files; existing vault is left untouched.

**Phase 1 — Bridge core, Multi-Engine Adapters & Core MCP Tools.** `/health`, config, vault API with `[[WikiLinks]]` parsing, memory API, sessions, `/ws`, `FakeEngine`, real `ClaudeEngine`, `CodexEngine`, `GeminiEngine`, and `HermesEngine` adapters, JSON Tool-Call Healer, path sandboxing, `safe_shell` with timeout, `artifact_verifier`, and Cross-Engine Handoff context.
✔ Tests pass. ✔ CLI test script streams replies through WS. ✔ Arabic prompt round-trips via UTF-8 `stdin`. ✔ Cancel kills process tree. ✔ Unauthorized request → 401. ✔ Write outside `writableFolders` triggers `permission.request`.

**Phase 2 — Desktop app + HUD shell + chat.** Electron shell §9.0 (non-blocking startup even if speech is down), 3-column layout, 4 engine themes + particle morphing, Streamer Privacy toggle, chat panel with step counter, permission prompt UI, and verification badge.
✔ App opens in frameless window immediately when Bridge is up. ✔ Switching between Claude, Codex, Gemini, and Hermes morphs the particles and preserves conversation context via handoff summary. ✔ Quitting leaves no orphan processes.

**Phase 3 — Skill Package v2, `/learn`, Files, Memory pages.**
✔ The 8 starter skills (§6.3) list, filter, search, pin, and check `required_tools`. ✔ Running a skill executes its instructions, helper scripts, and `artifact_verifier`. ✔ Clicking "Turn into skill" (`/learn`) drafts a new Skill Package v2 for approval. ✔ Foundation cards and facts management work.

**Phase 4 — JEV router & Local-Only Privacy Mode.**
✔ Tier 1, Tier 2 (`gemini-2.5-flash` / `ollama`), and Tier 3 routing work and log to `requests.jsonl`. ✔ Enabling `localOnlyMode` blocks cloud calls and routes strictly to local models.

**Phase 5 — Speech Service (Whisper + Gemini Saudi TTS + MarkItDown Ingestion).**
✔ `faster-whisper` transcribes Arabic and English and supports `/unload` to free VRAM. ✔ `/tts` generates natural Saudi dialect audio via `gemini-2.5-flash` (`Aoede` voice) and falls back cleanly to `piper` or `501` text-only mode if offline. ✔ `/convert` converts a sample PDF/Docx into Markdown in `_inbox/`. ✔ Arabic voice commands trigger `ui.command` in Tier 1.

**Phase 6 — Dashboard data, Workspaces & Usage providers.**
✔ Workbench, From your OS, What your OS knows, Audience cards (Snapchat/Instagram), external workspace selector, and real usage stats.

**Phase 7 — Obsidian plugin + Windows Installer.**
✔ Obsidian `ItemView` embeds the HUD. ✔ `electron-builder` produces a working Windows installer.

**Phase 8 — Connectors, Calendar, Inbox, Interactive Design Studio.**
✔ Google OAuth (Gmail, Calendar, YouTube) via Electron `safeStorage` bridge. ✔ `web_reader` (Playwright Accessibility Tree) works in research skills. ✔ Design workspace produces verified files in `output/` with live preview. ✔ Post-chat memory suggestions work.

**Phase 9 (optional) — Automations.** Scheduled skills via `node-cron` with mandatory human review for external actions.

---

## 11. Out of scope

Multi-user, remote public server access, mobile native app, cloud vault sync, external vector database server, custom model fine-tuning, unapproved auto-posting to social platforms.