# المصادر الرسمية التي روجعت

- Electron security: https://www.electronjs.org/docs/latest/tutorial/security — contextIsolation وsandbox ومنع Node في renderer.
- Electron context isolation: https://www.electronjs.org/docs/latest/tutorial/context-isolation/
- Fastify WebSocket: https://github.com/fastify/fastify-websocket — مصادقة ترقيات WS بنفس hooks. تعذر تثبيت الحزمة محليًا؛ النواة تستخدم Node HTTP مع مصادقة upgrade.
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk — واجهة الأدوات والبروتوكول؛ الحزمة غير متاحة offline.
- Gemini headless: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/headless.md — stdin وstream-json. Gemini غير مثبت محليًا، فلا يُدّعى تحقق تكامل حي.
- Hermes: https://github.com/NousResearch/hermes-agent/blob/main/cli.py — المصدر الرسمي؛ Hermes غير مثبت، ولا نفترض صلاحية flags دون --help.
- Claude: `claude.cmd --help` محليًا: print، stream-json، verbose، input-format، permission-mode، tools.
- Codex: `codex.cmd --help` و`codex.cmd exec --help` محليًا: exec --json، stdin `-`، read-only sandbox، ephemeral.

المراجعة: 2026-11-17. لا تُنسخ رموز وصول أو بيانات حسابات إلى السجلات.
