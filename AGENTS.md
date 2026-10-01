# AGENTS.md — دستور المشروع

> هذا الملف هو **القانون الأساسي** لأي مطوّر أو AI agent يشتغل على هذا الريبو.
> - بناء قضية جديدة؟ اتبع `.agents/workflows/workflow.md` **حرفيًا** — هو المرجع الكامل والوحيد لخط الأنابيب.
> - القواعد السردية والمعمارية التفصيلية موجودة في `story/` و `engine_runtime_spec.md` — لا تخترع قواعد من عندك.

---

## 1. المشروع في سطر

لعبة تحقيقات بوليسية **multiplayer** ("نظام التحقيق الموحد"): اللاعبون يجمعون أدلة، يستجوبون مشتبهين، يبنون Timeline، ويقدّمون اتهامات في مرحلة Tribunal. المحتوى كله **JSON data-driven** — 22 قضية منفذة (`case01`–`case22`) من 59 مخططة. الواجهة عربية RTL.

## 2. خريطة الريبو

| المسار | الوظيفة | الستاك |
|---|---|---|
| `frontend/` | الواجهة — port **5173** | React 19 + TypeScript + Vite + Zustand |
| `server/` | الباك إند — port **3001** | Fastify 5 + ws + better-sqlite3 + JWT + zod |
| `runtime/` | محرك اللعبة الحتمي (tick-based) | TypeScript + vitest — حزمة محلية يستهلكها السيرفر عبر `"runtime": "file:../runtime"` |
| `cases/caseXX/` | محتوى القضايا | `caseXX.json` + `blueprints.json` + ملفات تخطيط `.md` |
| `scripts/` | اختبارات smoke و validators | `.mjs` / `.ts` — تُشغَّل من الجذر |
| `story/` | وثائق التصميم السردي (عربي) | schema.md · rule.md (187 قاعدة) · behavior.md · case rules.md · grand_truth.md |
| `docs/` | وثائق المطورين | API.md · DEVELOPER_GUIDE.md · CONTRIBUTING.md |
| `engine_runtime_spec.md` | العقد التنفيذي الحتمي للمحرك | مرجع معماري |
| `.agents/workflows/` | الـ workflows المعتمدة | `workflow.md` = قانون بناء القضايا |

## 3. التثبيت والتشغيل

```bash
# التثبيت — 4 باكدجات (root + 3 workspaces يدويًا)
npm install
cd server && npm install && cd ..
cd frontend && npm install && cd ..
cd runtime && npm install && cd ..

# البيئة — إلزامي قبل أول تشغيل
cp .env.example .env
# عدّل .env: JWT_SECRET و ENCRYPTION_KEY بقيم حقيقية

# التشغيل — server + frontend مع بعض
npm start
# أو كل واحد لوحده:
npm run dev --prefix server      # tsx watch → :3001
npm run dev --prefix frontend    # vite → :5173

# Playwright (مطلوب لاختبارات smoke — أول مرة فقط)
npx playwright install chromium

# Docker
docker-compose up -d
```

## 4. الاختبار والتحقق

| الأمر | ماذا يفعل |
|---|---|
| `npm run test:smoke` | كل الـ validators + كل اختبارات الـ smoke (Case01→22 transitions, multiplayer, refresh) |
| `npm run test:smoke:validators` | الـ validators الخمسة فقط (schema, integrity, reason codes, blueprints, coverage) |
| `cd runtime && npm test` | اختبارات vitest للمحرك (26 ملف spec) |
| `cd runtime && npx vitest run test/caseXX.spec.ts` | اختبار قضية واحدة |
| `cd frontend && npm test` | اختبارات vitest للواجهة |
| `cd frontend && npm run lint` | ESLint على `src/` |
| `cd server && npm run build` | `tsc` — يكشف كسر الأنواع بعد تعديل `runtime/` |
| `cd frontend && npm run build` | `tsc -b && vite build` |

**ملاحظات عن smoke tests:**
- بتشغّل الـ stack تلقائيًا على 3001/5173 (وتعيد استخدامه لو شغال). `SMOKE_FORCE_RESTART=1` لإجبار إعادة التشغيل.
- على Windows: الـ helper بيقتل العمليات على المنافذ عبر `taskkill` — لا تتفاجأ.
- Playwright يحاول Chromium ثم يسقط على قناة `msedge` لو مش متثبت.

**التحقق من صياغة JSON قبل أي اختبار (Windows):**
```powershell
Get-Content D:\game\cases\caseXX\caseXX.json | ConvertFrom-Json | Out-Null
Get-Content D:\game\cases\caseXX\blueprints.json | ConvertFrom-Json | Out-Null
```

### مصفوفة التحقق — شغّل حسب ما عدّلت

| لو عدّلت في | شغّل على الأقل |
|---|---|
| `cases/**` | فحص صياغة JSON + `npm run test:smoke:validators` + `cd runtime && npx vitest run test/caseXX.spec.ts` |
| `runtime/**` | `cd runtime && npm test` + `cd server && npm run build` |
| `server/**` | `cd server && npm run build` + smoke ذو صلة (مثل `npm run test:solo-refresh`) |
| `frontend/**` | `cd frontend && npm run lint && npm run build` |
| تغيير يمس اللعب end-to-end | `npm run test:smoke` |

## 5. قواعد حتمية لبناء القضايا (ملخص — التفاصيل الكاملة في `workflow.md`)

1. **Planning Gate:** لا `caseXX.json` قبل إنشاء `plan_caseXX_01.md` واعتماده.
2. **لا حقل ناقص:** كل حقول `CaseEvidence`/`suspects` إلزامية. الفارغ = `[]` أو `null` أو `""`. حذف `completion_triggers` = crash.
3. **`blueprints.json` = Interaction Mapping فقط** (`prefixSourceTypes` + `closureCatalog`). ممنوع triggers أو قواعد لعب فيه.
4. **العتبات:** `base_collapse_threshold` و `base_lawyer_up_threshold` — ممنوع `collapse_threshold`.
5. **إعادة التفسير:** `set_evidence_summary` + `set_evidence_tags` + `set_evidence_role` — ممنوع `set_interpretation_key` (مفهوم قديم).
6. **`next_case_rules`:** غير فارغة + مسار Default بأقل priority + لا Ruleين بنفس الأولوية إلا لو Mutually Exclusive.
7. **الأدلة الحرجة:** لازم Trigger أساسي + بديل واحد على الأقل.
8. **Context Cleansing:** ممنوع إعادة استخدام `character_id`/`evidence_id` من قضية سابقة إلا لو `carryover` أو Global Flag مصرّح به.
9. **اكتب من الحل إلى الأدلة** — مش العكس.
10. **كل أثر احتكاكي = `visible_notice`** للاعب — لا عقوبات صامتة.

## 6. ثوابت المحرك — لا تكسرها

- **حتمي بالكامل (deterministic):** ممنوع `Date.now()` / `Math.random()` في `runtime/`. أي تباين يُشتق من `playthrough_seed`.
- `1 accepted player action = 1 tick` — الأفعال المرفوضة لا تُحدث tick.
- دورة الـ Tick: `Intent Intake → Validation → Tick Open → Dispatch → Queue Drain → Derived Systems → Commit → Broadcast`.
- اختبارات القضايا تقرأ `cases/` بمسارات نسبية (`join(__dirname, "../../cases/...")`) — حافظ على هذا النمط.
- الواجهة عربية — اختبارات smoke تعتمد على labels مثل `اسم المحقق` و `ابدأ Solo`؛ تغيير النصوص = كسر اختبارات.

## 7. أسلوب الكود

- TypeScript في كل مكان، أنواع صريحة (`interface` للـ props والـ payloads) — `any` معامَل كـ warning في ESLint.
- التحقق من المدخلات عند الحدود بـ **zod** (سيرفر) — لا validation يدوي مكرر.
- اتبع ESLint flat config (`eslint.config.mjs` في الجذر + `frontend/eslint.config.js`).
- طابق الستايل الموجود: خفيف التعليقات، أسماء واضحة، React function components بـ typed props.

## 8. Git — قواعد الشحن (Shipping Rules)

**Remote:** `github` → `https://github.com/toxichassan22/case-game`

- **Shipping = commit + push.** بعد أي تغيير مطلوب ومُتحقق منه: commit ثم `git push github main` في نفس الجلسة — لا تنتظر طلبًا جديدًا. Commit محلي فقط = شغل غير مكتمل.
- **لا تدفع `main` إلا ضمن هذا التدفق** — لا push تلقائي خارج سياق تغيير مطلوب ومُتحقق منه.
- **Commit فقط ملفات التغيير المطلوب.** لا تضمّن ملفات محلية عابرة (`sandbox/`، `الطلوبات لليوم.md`، إلخ).
- **`task.html` ملف تتبع محلي للمالك:** ممنوع commit أو push لأي فرع — نهائيًا، ولا حتى ضمن تغيير آخر.
- **ممنوع AI attribution:** لا `Co-Authored-By` ولا `Generated with ...` ولا أي توقيعات bot/agent في رسائل الـ commit أو author metadata أو PR descriptions — رسائل نظيفة كمؤلف عادي.
- **Conventional Commits** إلزامية: `feat|fix|docs|style|refactor|test|chore(scope): description` — التفاصيل في `docs/CONTRIBUTING.md`.
- CI (`ci.yml`) يعمل على Node 18 و 20 — لا تستخدم syntax أحدث من ذلك.
- Commit بعد كل قضية مكتملة وقبل بدء التالية (حسب `workflow.md`).

## 9. لا تلمس

| المسار | لماذا |
|---|---|
| `.env` | أسرار — لا commit، لا طباعة. القالب هو `.env.example` فقط |
| `server/database.sqlite*` | قاعدة بيانات حية (+ `-shm`/`-wal`) — لا حذف ولا تعديل يدوي |
| `*/dist/`, `*/node_modules/` | مخرجات بناء |
| `output/`, `*.log`, `playwright-console-*.txt`, `game-eval-*.png` | artifacts مولّدة |
| مفاتيح `caseXX.json` الموجودة | لا تعيد تسميتها بدون تحديث validators + `adapterBuilder.ts` |

## 10. مصادر الحقيقة

| عندما تحتاج | اقرأ |
|---|---|
| بناء قضية جديدة من الصفر | `.agents/workflows/workflow.md` |
| شكل بيانات القضية التعاقدي | `story/schema.md` + `runtime/src/types.ts` |
| قواعد السرد الـ 187 | `story/rule.md` |
| سلوك الاستجواب والمعادلات | `story/behavior.md` + `engine_runtime_spec.md` §المرحلة ٦ في workflow |
| الثالوث والحقيقة الكبرى | `story/grand_truth.md` |
| API السيرفر | `docs/API.md` |
| Setup تفصيلي | `docs/DEVELOPER_GUIDE.md` |

---

> **القاعدة الذهبية:** لو في تعارض بين هذا الملف و `workflow.md` في شأن بناء القضايا — **`workflow.md` يكسب**. هذا الملف للأوامر والحدود العامة.
