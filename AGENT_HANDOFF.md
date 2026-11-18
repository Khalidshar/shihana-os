# Agent Handoff: Shihana OS

## Purpose
This document is an implementation handoff for Claude, Codex, and future coding agents working in this repository. It describes what was built, what remains external, and which checks are real versus environment-dependent.

## Source reviewed
A 3-minute-7-second Arabic/English screen recording was transcribed and frame-reviewed locally. It shows an Agentic OS-style desktop assistant with:
- A customizable dashboard and chat.
- Claude/Codex-style coding agents.
- Local and cloud model routing.
- A shared Markdown/Obsidian memory.
- Skills and scheduled automations.
- Inbox, calendar, voice mode, and design tools.
- Shared local memory growing with use.
- A Skill Package / workflow / automation chain.

The repository does not copy that recording or another project's proprietary UI/code. It uses public open-source architectural patterns and its own implementation.

## Implemented
- Node HTTP/WebSocket bridge with bearer authentication.
- RTL/Arabic HUD and desktop Electron shell.
- Codex, Claude, Gemini, and Ollama adapters.
- Local Ollama `/api/tags` discovery and streamed `/api/chat`.
- Local-only mode blocks cloud engines.
- Markdown vault, WikiLinks, backlinks, foundation cards, facts, and sessions.
- Skill Package v2 registry, approval, verification, and learning drafts.
- Inbox Markdown captures and local calendar JSON.
- Workbench with workspaces, vault state, git status, diff stat, and log.
- Command palette on Ctrl/Cmd+K.
- Read-only web reader with private-network and redirect protections.
- External-web-content prompt isolation and force-approved writes.
- Browser voice recognition control with explicit permission/error states.
- FastAPI speech shell with health, faster-whisper, MarkItDown endpoints, Piper/Gemini/TTS capability reporting.
- Google OAuth start/callback/disconnect foundation with encrypted-at-rest local token file.
- Gmail and Google Calendar read endpoints behind OAuth token.
- MCP server registry with explicit enable-review state.
- Obsidian `ItemView` package.

## Google integration
Google OAuth uses environment variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

OAuth state and callback:
- `POST /api/connectors/google/start`
- `GET /oauth/google/callback`
- `POST /oauth/google/disconnect`

The callback stores a refresh/access token payload in `<vault>/.os/google-token.json` encrypted with a local 256-bit key in `<vault>/.os/google.key`, mode `0600`.

Implemented read-only Google API calls:
- `GET /api/gmail/messages`
- `GET /api/google/calendar/events`

Not installed or not usable until credentials are provided:
- Gmail sending.
- Google Calendar writes.
- YouTube API operations.
- Gmail/Calendar account sign-in.
- Real account data.

## Speech integration
The Python service uses optional dependencies:
- `faster-whisper`
- `markitdown`
- Piper if present on PATH.
- Gemini only if `GEMINI_API_KEY` exists.

Endpoints:
- `/status`
- `/v1/audio/transcribe`
- `/v1/audio/speak`
- `/v1/convert`

The service reports text-only or not-connected states instead of returning synthetic success.

## MCP and skills
MCP servers are stored at `<vault>/.os/mcp/servers.json`.
At this stage registration and explicit enable state exist. A registered server is not executed until transport and tool protocol validation are implemented.

Skill packages remain in `vault-template/skills`. They require real required tools and verify output files before reporting success.

## Security fixes
### SSRF: fixed
`web_reader` now:
- Allows only HTTP/HTTPS.
- Resolves DNS with `dns.lookup(...,{all:true})`.
- Rejects loopback, private, link-local, 0.0.0.0, IPv4-mapped, and IPv6 private ranges.
- Uses manual redirects.
- Revalidates each redirect destination.
- Rejects URL credentials.
- Limits the response to 2 MB and extracted text to 30,000 characters.

DNS pinning for the final socket remains a follow-up hardening item if the application is exposed outside the loopback interface.

### External prompt injection: fixed
Tool continuation text now includes an explicit untrusted-data policy.
Writes caused after `web_reader` set a force-approval flag.
The permission message includes the exact `WRITE <path>` side effect.

### Remaining hardening
- Move OAuth secret handling to OS key storage on Windows where Electron `safeStorage` is available.
- Add per-server MCP identity checks and command allowlisting.
- Pin DNS answers to the socket connection rather than validating then relying on a separate resolver.
- Add Content-Disposition and MIME allowlisting for uploaded documents.
- Add explicit size and decompression limits to document conversion.
- Add origin and CSRF validation to the Google callback/disconnect flow.
- Rotate OAuth state and reject replay.

## Public repository patterns reviewed
- OpenAgentd: live tool transcripts, plan-first review, worktrees, diffs.
- Turno: scheduled routines, live chat, permission cards, Ollama, terminal workspace.
- Luna: private memory, skills, local-first model routing, file and meeting workflows.
- nl-veil: persistent project memory and parallel coding agents.
- the-pair: mentor/executor review.
- MCP official SDK/spec.
- Anthropic Claude plugin/skills directory.
- faster-whisper, Piper, Kokoro, MarkItDown.
- Google Workspace MCP implementations.

Sources are recorded in `SOURCES.md`.

## Known errors and environment limitations
- Electron may be blocked by Windows Device Guard/Application Control.
- `npm` is available as `npm`, not `npm.cmd`, in this Linux/Codespaces environment.
- Ollama was not running at validation time.
- Claude/Codex/Gemini were not all authenticated.
- Hermes CLI/ACP was not independently validated.
- Google credentials were not supplied.
- Real Gmail/Calendar data was not tested.
- Speech provider credentials/models were not supplied.
- Electron visual checks require a human on an allowed Windows host.
- No live audio/microphone check was possible.
- The `node-pty` terminal, worktree terminal, and live preview are not yet installed or tested.

## Commands
```bash
npm test
npm run typecheck
npm run build
node scripts/smoke.mjs
npm run preview
```

## Launch
Browser:
```bash
npm run preview
```

Desktop on an environment that permits Electron:
```bash
npm start
```

## Recommended next implementation order
1. Replace OAuth key file with Electron `safeStorage` and a main-process OAuth bridge.
2. Implement Gmail list/detail/draft/send and Calendar list/create/delete with explicit action cards.
3. Implement MCP stdio/HTTP transport with schema and approval.
4. Add worktrees and real terminal sessions with `node-pty`.
5. Add live preview and Monaco/VS Code-style diff/editor.
6. Add faster-whisper service startup, VAD, unload, and audio playback.
7. Add MarkItDown and attachment indexing to `_inbox`.
8. Add scheduled routines using a bounded scheduler and approval mode.
9. Add a final Windows installer and signed release pipeline.
