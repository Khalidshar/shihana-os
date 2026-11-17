# سجل تنفيذ الشيهانة

النطاق المطلوب: المراحل 0–3 فقط. البداية 2026-11-17 (الرياض). قرئت المواصفة كاملة من `code_artifact(1).md` وحُفظت دون تغيير في `AGENTIC_OS_SPEC.md`. لم يكن هناك مستودع Git أو سجل تقدم.

## المرحلة 0 — قابلة للتشغيل، مع اختلافات تقنية موثقة

- أُنشئت workspaces والأنواع المشتركة والإعدادات وقالب الخزنة والهوية السعودية. التهيئة تضيف الملفات المفقودة فقط وتحافظ على المحتوى والتوكن.
- البيئة: Node v24.21.0، npm 11.19.0، Git 2.55.0. `python` غير موجود في PATH. `npm.ps1` محجوب بسياسة PowerShell؛ نستخدم `npm.cmd`.
- تثبيت الشبكة: `npm.cmd install` لم يكتمل؛ إعادة المحاولة بمهلة محدودة أظهرت `EACCES` على registry.npmjs.org. المحاولة offline أظهرت `ENOTCACHED` لـ Fastify. لا نعتبر هذه الفحوص ناجحة.
- أُعيد استخدام حزم npm الرسمية المتوفرة في ذاكرة الجهاز بعد نسخ الذاكرة إلى `.tmp/npm-cache`. تثبيت `npm.cmd install --offline --ignore-scripts --no-audit --no-fund --cache .tmp/npm-cache` أعاد: `added 30 packages in 3s`، exit 0. تم تثبيت عناوين tarball وإصداراتها في lockfile.
- **اختلاف عن البنية المحددة:** React 19 وesbuild بدلاً من React 18 وVite؛ HTTP الأصلي في Node بدلاً من Fastify، وWebGL محلي بدلاً من three.js؛ الخط العربي Readex Pro متاح محليًا بدلاً من الخطوط الثلاثة المطلوبة. السبب غياب الحزم المطلوبة عن cache وحظر الشبكة. لا تُعد المطابقة التقنية التامة ناجحة؛ العمل التالي يعتمد على نواة قابلة للتشغيل بالحزم المتاحة.
- `npm.cmd run build`: `Bridge + HUD build succeeded`، exit 0.
- `npm.cmd test`: tests 1, pass 1, fail 0, skipped 0. فحص إنشاء الخزنة وكل ملفاتها الأساسية، UTF-8، وحفظ ملفات المستخدم والتوكن عند تكرار التهيئة.
- `node dist/bridge.mjs`: `الشيهانة: vault ready at C:\shihana-os\vault`، exit 0.

## المرحلة 1 — نواة منفذة؛ تكامل المحركات الحي محدود بالبيئة

- تنفيذ HTTP/WS، مصادقة 401، الخزنة والروابط والروابط العكسية والفهرس، الذاكرة والجلسات، سياق handoff، 5 أدوات بحالات إتاحة صادقة، sandbox، حدود الخطوات والمهلة، أذونات الكتابة وshell، التحقق من artifacts، adapters للمحركات مع FakeEngine محصور في الاختبارات.
- محوّل CLI يستعمل stdin UTF-8 ويحل shims `.cmd` إلى JS أو EXE دون shell. تم تصحيح اختيار Unix shim بدل Windows، ثم تجاهل node.exe الشرطي غير الموجود في npm shim. CLI help المحلي هو أساس خيارات Claude/Codex.
- `npm.cmd test`: tests 9, pass 9, fail 0, cancelled 0, skipped 0. يشمل WS round-trip للعربية، handoff، إذن كتابة خارج المجلدات، 401، traversal، JSON، artifacts، timeout، وإلغاء ابن وحفيد فعليين. المحركات في اختبارات WS **FakeEngine** وليست اتصالًا حقيقيًا.
- أثناء أول فحص مهلة رفضت البيئة `taskkill /T` بـ Access denied وتعطل الفحص. أضيف fallback لإنهاء العملية المباشرة؛ إعادة الفحص اجتازت اختبار عدم وجود الابن والحفيد. يبقى فحص خروج التطبيق وإلغاء محرك حي خارج sandbox في HUMAN_CHECKS.md.
- `npm.cmd run typecheck`: exit 0. `npm.cmd run build`: Bridge + HUD build succeeded، exit 0.
- `npm.cmd run doctor`: Claude 2.1.323 مثبت، Codex 0.162.1 مثبت؛ Gemini وHermes غير مثبتين.
- `node scripts/live-check.mjs`: WS حقيقي → route ثم chat.error: `Error finding codex home: Could not find home directory`، exit 1. لا يُعد streaming رد محرك حي مجتازًا. يلزم تشغيل التطبيق خارج قيود حساب هذه الجلسة أو ضبط إعداد حساب CLI.
- Hermes معرّف بواجهة adapter لكنه **غير مفعّل** حتى يمكن فحص بروتوكوله ونسخته محليًا؛ لا توجد خيارات متخيلة. Gemini يعتمد فحص help عند التثبيت. doc_converter وweb_reader معلّمان Not set up لأنهما مرحلتان 5 و8.
- لم ننتقل باعتبار جميع القبول ناجحًا؛ نكمل الأجزاء المستقلة من HUD والمهارات فوق النواة المختبرة. المطابقة الكاملة للبنية وللمحركات الأربعة غير مجتازة.
- Git العادي فشل: `.git/index.lock: Permission denied` بسبب كون `.git` للقراءة فقط. الالتزامات الفعلية في `.history`، استعرضها بـ `git --git-dir=.history --work-tree=. log --oneline`. التزام المرحلة 0: `f970cab`.

## المرحلة 2 — HUD وElectron منفذان؛ فحوص النافذة والبصر محجوبة

- واجهة React بثلاثة أعمدة، RTL/LTR، محادثة WS وحالات الخطوات والأذونات والتحقق، أربع سمات ومشهد WebGL ثلاثي الأبعاد يتدرّج بين مجرة وكرة وحلقات وشبكة. الاسم مصدره config. وضع الخصوصية يطمس المسارات وعناوين الجلسات.
- Electron frameless/maximized مع renderer sandbox وcontextIsolation وnodeIntegration=false، IPC محدود، F11، tray، واختصارات. ينتظر bridge فقط؛ speech غير معدّ ولا يحجب النص. يغلق bridge الذي أنشأه عند الخروج.
- `node node_modules/electron/install.js`: exit 0، استخرج النسخة الرسمية 45.3.2 من cache. `node scripts/ui-check.mjs` فشل قبل فتح النافذة؛ أعيد إنتاجه بـ DEBUG=pw:browser، والسجل أكد `electron.exe was blocked by your organization's Device Guard policy`. التشغيل المباشر لـ electron.exe أعاد `An Application Control policy has blocked this file`. لم تُغيّر حماية Windows أو sandbox.
- راجعت https://www.electronjs.org/docs/latest/api/browser-window/ وhttps://playwright.dev/docs/api/class-electron وhttps://github.com/microsoft/playwright/issues/32027 وhttps://github.com/microsoft/playwright-vscode/issues/100. البلاغات لنسخ أقدم وليست دليل تطابق مع Electron 45.3.2 / Playwright 1.62.1.
- مصدر سياسة الحظر: https://learn.microsoft.com/en-us/windows/security/application-security/application-control/windows-defender-application-control/wdac-and-applocker-overview وhttps://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/operations/appcontrol-debugging-and-troubleshooting. لم يُستخدم تعطيل السياسة كإصلاح.
- بدأ فحص Edge sandboxed عبر Playwright ثم تعذّر إتمام التشغيل في البيئة؛ لا تُعد assertions الموجودة في السكربت نتائج ناجحة. محاولة أداة التحكم بالحاسوب: مضيف browser غير متاح؛ قراءة نافذة Chrome أعادت أن النافذة مصغّرة. لا توجد لقطة معاينة موثقة أو مراجعة بصرية ناجحة.
- `node dist/bridge.mjs` مع SHIHANA_PORT=4319: `الشيهانة: http://127.0.0.1:4319 · vault ready`؛ الخادم يعمل. أُضيف تطابق Origin مع منفذ الخادم الفعلي، مع الإبقاء على منع origins الخارجية وCSP.
- فحوص typecheck/build السابقة: exit 0. إعادة فحوص النواة قبل الالتزام مسجلة في خرج الأدوات. قبول النافذة frameless، morphing المرئي، إغلاق شجرة التطبيق **معلّق**؛ نتابع المرحلة 3 المستقلة عن تشغيل Electron.

### تشخيص أخطاء المرحلة 1 ومصادرها

- Codex home: تكرّر عبر WS حقيقي؛ سبب صلاحيات/اكتشاف home داخل sandbox هو **فرضية** وليست مثبتة جذريًا. https://github.com/openai/codex/issues/45871 وhttps://github.com/openai/codex/issues/17458 يصفان أعراضًا قريبة على Windows AppContainer؛ لا يوجد بلاغ متحقق مطابق للإصدار 0.162.1 هنا. لم تُنقل credentials أو تُخفف الحماية. الفحص الحي ما زال فاشلًا.
- npm: الخطأ EACCES مثبت من سجل الشبكة. ENOTCACHED تكرر عند وجود tarball وغياب metadata؛ التثبيت بعناوين tarball وإصدارات ثابتة وcache قابل للكتابة اجتاز فعليًا. المراجع: https://github.com/npm/cli/issues/7781 وhttps://docs.npmjs.com/cli/v11/using-npm/config#offline. البلاغ أقدم من npm 11.19.0، واستُخدم لفهم السلوك لا لنسخ حل.
- Windows shims: reproducer doctor أعاد ENOENT لملف Unix shim ثم لـ node.exe غير الموجود؛ فحص محتوى `.cmd` أثبت مسار EXE في Claude ومسار JS في Codex. التعديل يحل الملفات الموجودة فقط دون shell؛ doctor أكد الإصدارين الصحيحين، وإعادة الاختبارات نجحت.

## المرحلة 3 — لم تبدأ بعد
