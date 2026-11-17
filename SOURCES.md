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

- npm offline semantics: https://docs.npmjs.com/cli/v11/using-npm/config#offline ، والبلاغ https://github.com/npm/cli/issues/7781 (أقدم؛ ليس تطابق إصدار).
- Windows Codex home: https://github.com/openai/codex/issues/45871 وhttps://github.com/openai/codex/issues/17458 (أعراض مشابهة؛ السبب هنا ما زال فرضية).
- Electron/Playwright launch: https://playwright.dev/docs/api/class-electron ، https://github.com/microsoft/playwright/issues/32027 ، https://github.com/microsoft/playwright-vscode/issues/100 (بلاغات أقدم؛ لم تنسخ حلولها).
- Microsoft App Control: https://learn.microsoft.com/en-us/windows/security/application-security/application-control/windows-defender-application-control/wdac-and-applocker-overview
- Internal WikiLinks: https://obsidian.md/help/links وhttps://github.com/obsidianmd/obsidian-skills/blob/main/plugins/obsidian/skills/obsidian-markdown/SKILL.md ؛ روجعت مناقشات المجتمع المرتبطة، ولم يوجد بلاغ لنفس خطأ السياق المخصص هنا. ليس خطأ في Obsidian.
- آخر كشف Gemini: 0.68.0، `gemini.cmd --help` محليًا يثبت stream-json وapproval-mode plan. لم يكن مكتشفًا في بداية الجلسة؛ لم نزعم أننا ثبّتناه.
