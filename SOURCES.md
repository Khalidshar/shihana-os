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

## مراجعة مستودعات Agentic OS وواجهات سطح المكتب — 2026-11-18

- OpenAgentd: https://github.com/lthoangg/OpenAgentd — مرجع لتدفق المهمة: قراءة، تخطيط، tool calls، مراجعة diff، worktrees، وقرارات المستخدم قبل تعديل الملفات.
- Turno: https://github.com/eurafaeldecarvalho/turno — مرجع للأتمتة المجدولة، أوضاع الصلاحيات، محادثة الشغل الحي، صناديق terminal المرئية، واستخدام Ollama أو Claude CLI.
- Luna: https://github.com/Sehastrajit-S/Luna — مرجع للخصوصية المحلية، تذكر المستخدم، مهارات Markdown، صندوق المرفقات، ونقاط التعديل عبر مهارات وMCP.
- nl-veil: https://github.com/gary23w/nl-veil — مرجع للوكيل البرمجي المتعدد والمحافظة على ذاكرة المشروع.
- the-pair: https://github.com/timwuhaotian/the-pair — مرجع لتقسيم العمل بين Mentor وExecutor ومراجعة الكود قبل حفظه.

المراجع استُخدمت لتوجيه المعمارية وتجربة المستخدم فقط. لم تُنسخ الكود، العلامة التجارية، أو المواد المشروطة من مستودعات خارجية.

## أدوات ومهارات مطلوبة — بحث GitHub 2026-11-18

- Google Workspace/Gmail/Calendar:
  - https://github.com/bakissation/mcp-google-multi
  - https://github.com/ngs/google-mcp-server
  - https://github.com/quinnjr/google-mcp
  - https://github.com/cunicopia-dev/gmail-mcp (حماية قراءة/مسودات فقط)
  - الأولوية للمراجعة هي `gmail-mcp` والنسخ متعددة الحسابات التي تدعم read-before-edit وOAuth.
- MCP والمهارات:
  - https://github.com/modelcontextprotocol
  - https://github.com/anthropics/claude-plugins-official
  - https://github.com/snyk/agent-scan
  - https://github.com/modelcontextprotocol/ext-apps
  - https://github.com/mohitagw15856/pm-claude-skills
- الصوت:
  - https://github.com/SYSTRAN/faster-whisper
  - https://github.com/rhasspy/piper
  - https://github.com/hexgrad/kokoro
- الذاكرة والبحث المحلي:
  - https://github.com/kapillamba4/code-memory
  - https://github.com/MakerViking/mimir
  - https://github.com/bozbuilds/AIngram
- المتصفح:
  - https://github.com/JuliusBrussee/caveman-browse
  - https://github.com/mark-liu/snap
  - https://github.com/ChristofMilius/mcp-agent-playwright
- تحويل الوثائق:
  - https://github.com/Zahid-Abbas-Ali-Baig/document-converter
  - https://github.com/chottokun/docling-markdown-generator
- الطرفية ومحرر سطح المكتب:
  - https://github.com/lthoangg/OpenAgentd
  - https://github.com/clawuv/TMX
  - https://github.com/eurafaeldecarvalho/turno
  - https://github.com/Qingxuan365/oneAI
  - https://github.com/electron/electron
  - https://github.com/xtermjs/xterm.js
- التثبيت:
  - https://github.com/electron-userland/electron-builder

### قرار الدمج
- لا يعتمد Gmail/Calendar على تخزين كلمات المرور أو الأسرار في ملفات JSON؛ يستخدم OAuth داخل credential manager للمنصة.
- الإرسال الخارجي والحذف والتراسل الجماعي تبقى افتراضيًا بمرحلة موافقة بشرية.
- مهارات المتصفح والقراءة تؤخذ عبر snapshots مع sandbox ومحظورات SSRF؛ لا تُعطّل الحماية لإتمام فحص.
- مهارات الغير تُفحص بـ `agent-scan` قبل الإضافة أو التشغيل.
- محرك Ollama يبقى Default؛ MCP يثبت كموصلات اختيارية وليس كاستيراد برمز تلقائي.
