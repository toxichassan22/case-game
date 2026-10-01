# plan_case01_01.md — القضية الأولى (الوجه المكشوف — آمن للاعتماد)

> بوابة التخطيط — workflow.md المرحلة ١.٠.
> هذا الملف **هيكلي فقط**: شكل القضية وأحجامها وقواعدها — بلا حبكة ولا جاني ولا حل.
> الحمولة السردية كاملة في `truth_case01_01.md` — ⚠️ خلف حيطة السبويلر (المؤلف + المراجع المحايد فقط).
> **اعتماد المالك هنا = اعتماد هيكلي. الاعتماد السردي الحقيقي = اللعب.**

---

## 1. الترويسة

- **case_id:** `case01` — **العنوان:** «التوقيع المرتّب»
- **المحور الكبير المستهدف:** `net_calibration` (slot: معايرة — أول قياس لبصمة اللاعب)
- **نوع الجريمة:** وفاة في ظروف غامضة — المشهد الظاهر يقول شيئًا واحدًا بسيطًا
- **النغمة:** §8 في `case rules.md` — تبدأ سطحية، تنقلب تدريجيًا، تترك اللاعب شاككًا بعد الإغلاق

## 2. الشكل العام (لوحة التوزيع)

| العنصر | العدد | ملاحظة |
|---|---|---|
| مشتبهون | 4 | واحد جاني + مشتتات مشروعة دراميًا |
| شهود | 1 | مصدر معلومة حرجة زمنية |
| أدلة | 11 | `critical: 5` · `supporting: 4` · `flavor: 2` |
| أدلة حرجة ببديل | 5/5 | كل دليل حرج له trigger أساسي + بديل |
| دليل تعاوني (cross-route) | 1 | timeline + forensics |
| سلسلة سلوكية (behavioral chain) | 1 | من دليلين مترابطين |
| أنوماليز واجهة | 1 | subtle — مربوط بـ flag، `max_triggers=1` |
| بذرة شبكية | 1 | ميتاداتا فقط — `REQUEST_DEEP_METADATA_RECOVERY` |

## 3. توزيع المحاور على الأدلة

| المحور | عدد الأدلة الغالبة | الهدف |
|---|---|---|
| timeline | 3 | جدول منهار — فجوات وتوقيتات متناقضة |
| forensics | 4 | تحليل معمل + وضعية مادية |
| behavioral | 3 | مطابقة أسلوب نصي + انهيار تحت ضغط |
| سياقي/متوازن | 1 | محضر معاينة |

`route_weight` لكل دليل مجموعها ~1.0؛ وزن القضية الكلي يُشتق آليًا (لا يدوي).

## 4. المشتبهون — الظل النفسي (بلا أسماء أدوار)

| character_id | collapse / lawyer / aggro | rapport / rigidity | pressure_response | deception_style | register |
|---|---|---|---|---|---|---|
| `char_marwan` | 7 / 6 / 2 | -1 / 3 | ramble | gaslighting | bureaucratic |
| `char_samy` | 5 / 4 / 1 | 0 / 1 | silence | protective | street |
| `char_lama` | 6 / 5 / 1 | 1 / 0 | collapse | protective | formal |
| `char_rafat` | 5 / 7 / 2 | -1 / 2 | attack | passive | academic |
| `char_awad` (شاهد) | 8 / 9 / 3 | 0 / 0 | ramble | direct | street |

> **`pressure_response` قيمة مفردة** من `silence | ramble | attack | collapse | lawyer_up` — مرحلة الجلسة (`collapse`/`lawyer_up`) يحسمها المحرك من العتبات، مش من الحقل.
> تحمّل مروان 2 هو الأضيق في القضية **بقرار مقصود**: طريق الانهيار يكافئ الدقة وتقديم أدلة موثقة، مش النبرة العدوانية. رأفت `aggro=2` كحد أدنى لأنه البوابة الوحيدة لفك الدفاتر — صفر كان سيقتله من اختيار نبرة واحد. عوض عنده profile حقيقي (مش قيم افتراضية) لأنه الحامل الوحيد للتوقيت الحرج.

## 5. قواعد الإغلاق (الهيكل)

- `requires_culprit + requires_motive + requires_method_or_opportunity` = كلها إجبارية
- `minimum_evidence_count: 5` · `minimum_behavioral_chain_verified: 1` · `minimum_cross_route_verified: 1`
- `accepted_true_culprit_ids: [char_marwan]` — `true_success` يتطلب الشخص الصح **و** الدافع الصح معًا
- `false_success_flags_by_suspect: { char_samy: [c01_accused_wrong] }` — إدانة سامي بأي دافع مقبول تُسجّل الظلم صراحةً
- `closureCatalog.suspect_ids: [char_marwan, char_samy]` — لمى/رأفت خارج الكتالوج → اتهامهم يُرفض `missing_culprit`
- مسارات النتيجة: `true_success` (1) + `false_success` (أي اتهام مقبول بوابة لا يحقق true_success) + `rejected`
- المحاولة الغلط ليها ثمن (penalty_rules حسب القالب)

## 6. Flags والتوجيه

- `outcome_flags`: `success → [c01_clean_close, c01_true_culprit]` · `partial → [c01_partial]` · `failure → []` (حقل احتياطي — لا مسار في المحرك يمنحه)
- flags شرطية: `c01_saw_anomaly` (البذرة اتلقطت) · `c01_accused_wrong` (تُمنح عبر `false_success_flags_by_suspect[char_samy]` — إدانة سامي بأي دافع) · `case01_false_close` (`false_success_flag`)
- `next_case_rules`: 3 مسارات — `[100] anomaly+clean → slot بصمة-تصميم` · `[60] accused_wrong → slot مستقلة تنفيس` · `[10] default → case02`
- أول قياس بصمة يتسجل آليًا من الإغلاق (`first_case_closure_route`)

## 7. معيار الجودة (ما نعد به كلاعبين)

- الحل السطحي مقنع — اللاعب المستعجل يقع في `false_success` ويتعلم: **المشهد المرتّب هو الدليل**
- الحل الحقيقي يحتاج ≥5 verified وربط محورين (سلوكي + cross-route إجباريان)
- مفيش info-block: كل حقيقة ليها مصدران على الأقل (قاعدة منع الاختناق)
- بعد الإغلاق: سؤال معلّق واحد بلا إجابة — «ليه الملف كان جاهز كده؟»

## 8. خطوات البناء بعد الاعتماد

1. `case01.json` كامل + `blueprints.json` (mapping فقط)
2. `runtime/test/case01.spec.ts` → `npx vitest run`
3. `npm run test:smoke:validators`
4. تسجيل في `runtime/src/cases/registry.ts`
5. التأكد أن `REQUEST_DEEP_METADATA_RECOVERY` له مسار قابل للاكتشاف في الواجهة (أو يُكشف عبر trigger مرئي) — البذرة الشبكية تعتمد عليه، والدليل لازم يحمل `tags: ["grand_truth_seed"]`
6. مراجعة المراجع المحايد (subagent) على `truth_*.md` + JSON
7. commit مستقل `feat(case01): ...`
