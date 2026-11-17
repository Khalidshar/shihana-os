# Diagnostic evidence and limitations

Use `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, and `node scripts/smoke.mjs` for the supported local core. `scripts/ui-check.mjs` contains Electron end-to-end assertions but they have **not** passed on this machine. `scripts/browser-check.mjs` also has no passing run here. Neither is included as a silently skipped passing test.

When a failure appears: reproduce the same command, preserve its output and exit code, inspect the nearest source boundary, consult official documentation and relevant upstream Windows/version issues, make one hypothesis-driven change, then re-run the original reproduction and the affected tests. Never use `--no-sandbox`, disable Windows policy or remove assertions to make a run pass.

The Skill Package parser accepts the constrained frontmatter form shipped in the template: scalar metadata, inline string arrays, and a nested `verify` mapping. It rejects unsupported YAML rather than guessing. Arbitrary YAML compatibility requires a future reviewed parser dependency.

JSON repair supports Markdown fences and trailing commas. Ambiguous unescaped quotes are rejected; they are not silently rewritten into a different tool command.

Tool integration is an explicit JSON tool adapter, not a full MCP wire-protocol server. `doc_converter` and `web_reader` retain unavailable registry entries for later phases. Hermes has a guarded adapter entry but no enabled transport until its local version is verified. These are material limits, not completed integrations.

The current CLI adapters intentionally disable direct CLI writes and tools where possible. This keeps model-generated writes and shell work behind the Bridge's permission cards, but is more restrictive than unrestricted coding CLIs. Live behavior needs the CLI account checks listed in HUMAN_CHECKS.md.
