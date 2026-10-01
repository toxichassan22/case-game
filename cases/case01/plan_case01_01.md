# plan_case01_01.md — القضية الأولى (الوجه المكشوف — آمن للاعتماد)

> بوابة التخطيط — workflow.md المرحلة ١.٠.
> هذا الملف **هيكلي فقط**: شكل القضية وأحجامها وقواعدها — بلا حبكة ولا جاني ولا حل.
> الحمولة السردية كاملة في `truth_case01_01.md` — ⚠️ خلف حيطة السبويلر (المؤلف + المراجع المحايد فقط).
> **اعتماد المالك هنا = اعتماد هيكلي. الاعتماد السردي الحقيقي = اللعب.**

---

## 1. الترويسة

- **case_id:** `case01` — **العنوان:** «التوقيع المرتّب»
- **المحور الكبير المستهدف:** `net_calibration` (slot: معايرة — أول قياس لبصمة اللاعب)
- **نوع الجريمة:** وفاة مُدبّرة متنكّرة في انتحار (مطابق `roster.md:30`) — المشهد الظاهر يقول شيئًا واحدًا بسيطًا
- **النغمة:** §8 في `case rules.md` — تبدأ سطحية، تنقلب تدريجيًا، تترك اللاعب شاككًا بعد الإغلاق

## 2. الشكل العام (لوحة التوزيع)

| العنصر | العدد | ملاحظة |
|---|---|---|
| مشتبهون | 4 | واحد جاني + مشتتات مشروعة دراميًا |
| شهود | 1 | مصدر معلومة حرجة زمنية |
| أدلة | 13 | `critical: 5` · `supporting: 5` · `flavor: 3` — الجرد الكامل في §5 |
| أدلة حرجة ببديل | 5/5 | كل دليل حرج له trigger أساسي + بديل |
| دليل تعاوني (cross-route) | 1 | timeline + forensics |
| سلسلة سلوكية (behavioral chain) | 1 | من دليلين مترابطين |
| أنوماليز واجهة | 1 | subtle — مربوط بـ flag، `max_triggers=1` |
| بذرة شبكية | 1 | ميتاداتا فقط — `REQUEST_DEEP_METADATA_RECOVERY` |

## 3. توزيع المحاور على الأدلة

| المحور | عدد الأدلة الغالبة | الهدف |
|---|---|---|
| timeline | 4 | جدول منهار — فجوات وتوقيتات متناقضة |
| forensics | 5 | تحليل معمل متدرّج + وضعية مادية مستحيلة |
| behavioral | 3 | مطابقة أسلوب نصي + شهادة مشوّهة زمنيًا + انهيار تحت ضغط |
| سياقي/بذرة | 1 | استمارة الملف البارد |

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

### 4.1 السجل التعريفي (الحقول الإلزامية من workflow §1.3)

| character_id | الوظيفة | علاقة بالضحية | ادعاء المكان ليلة الواقعة |
|---|---|---|---|
| `char_marwan` | شريك — مدير حسابات المطبعة | شريك عمل | «خرج من المطبعة ~18:00 وراح البيت» — بلا شاهد |
| `char_samy` | تاجر حر — سوابق سرقة قديمة | أخ الضحية | صمت — رفض التصريح عن مكانه |
| `char_lama` | ربة بيت | أرملة الضحية | «في البيت طول الليل» — حوالة بنكية لأخيها قبل الواقعة بيومين |
| `char_rafat` | محاسب مستقل — مستقيل قبل شهر | محاسب سابق | «في مكتبه» |
| `char_awad` | حارس مخازن | — | في الخدمة — هو مَن وجد الجثة |

### 4.2 مسارات الانهيار الموثّقة (قبل كتابة dialogue_options)

- **مروان** (collapse 7 / lawyer 6 / aggro 2): مسار موثّق = دليلان verified (pressure 6) + خيار `precision` أو `empathetic` واحد على الأقل (profile_match ≥2) ⇒ `resolution ≥ 7` يسبق حد الـ lawyer_up. عدوانية واحدة مسموحة (`aggro ≤ 2`) لكنها تستهلك موازنة النقاط؛ **عدوانيتان = إنهاء فوري**. اللاعب السريع-لكن-الدقيق ينجح، ومن يعتمد على الضغط وحده يُقفَل عليه.
- **سامي** (`pressure_response: silence`): لا يستجيب للتعاطف — انكساره عبر `precision` + تقديم كاميرا البنزين verified (يثبت أنه كان هناك «ليحذّر» لا «ليتربّص»).
- **لمى**: انكسارها بالتعاطف فقط (ذِكر ابنها/حماية البيت — `ramble`/`collapse`-receptive). العدوانية تقفلها.
- **رأفت**: البوابة الوحيدة لفك الدفاتر — `attack` يعني صراع نبرة، لكن `aggro=2` تمنح اللاعب هامش خطأ واحدًا.

## 5. جرد الأدلة (القائمة المُعتمدة — قبل JSON)

| evidence_id | العنوان | tier | المحور الغالب | evidence_role | ملاحظة وظيفية |
|---|---|---|---|---|---|
| `C01-EVID-01` | محضر معاينة المسرح والمسدس المزروع | flavor | forensics | context | الصورة الرسمية «انتحار» — الترتيب المفرط أول ما يلفت النظر |
| `C01-EVID-02` | هندسة المقعد والمرايا (سايق أطول من الضحية) | critical | forensics | prove | **العنوان الرئيسي** — استحالة فيزيائية: الضحية لم يقد سيارته |
| `C01-EVID-03` | تقرير آثار الإطلاق (GSR): يد الضحية نظيفة | critical | forensics | prove | اليد التي «أطلقت» لم تُطلق — الإثبات الثاني للتسريح |
| `C01-EVID-04` | سجل بطارية/شحن الموبايل | supporting | timeline | unlock | مرحلة معمل أولى: الرسالة لم تُكتب من الهاتف (لا يشاور على أحد — صياغة صادقة) |
| `C01-EVID-05` | سجل جلسات الحساب — بصمة جهاز مُرسل | critical | forensics | prove | مرحلة معمل ثانية بعد EVID-04: جلسة من جهاز لم يُستخدم مع الحساب قبلًا — تشاور على الطرف الفاعل |
| `C01-EVID-06` | «نافذة تجهيز المشهد» (GPS 19:40 + فاتورة بنزين كاش 19:52) | critical | timeline+forensics | prove | **cross-route**: يحوّل فجوة الوصول إلى نافذة ترتيب — يغيّر المعنى لا يفتح شكليًا |
| `C01-EVID-07` | رسالة الوداع (النص) | supporting | behavioral | prove | فصحى مثالية — عضو 1 في السلسلة السلوكية |
| `C01-EVID-08` | أرشيف محادثات الضحية (نسخة احتياطية سحابية لحسابه) | supporting | behavioral | unlock | corpus المطابقة — عضو 2 في السلسلة. **مصدر مستقل ماديًا عن EVID-05** حتى لا يصطدم `no_shared_evidence_between_roles` |
| `C01-EVID-09` | استمارة ملف **بارد مقفول** مُلحق بالملف — ختم وصول `م.ر` 20:47 | flavor | سياقي | context | البذرة الشبكية — `tags: [grand_truth_seed]` |
| `C01-EVID-10` | أثر المهدئ في فنجان القهوة (معمل) | critical | forensics | prove | الأسلوب — يصل متأخرًا في صف المعامل (قاعدة 84) |
| `C01-EVID-11` | الدفاتر المزدوجة وفواتير الموردين الوهمية | supporting | timeline | prove | الدافع — يُفكّ عبر رأفت + يكشف نصب الضحية الصغير (الفجوة الأخلاقية) |
| `C01-EVID-12` | إفادة عوض — شهادة مشوّهة التوقيت | supporting | behavioral | prove | رأى حركة ~19:40 قبل البلاغ بكثير — مرساة زمنية بشرية غير دقيقة (قاعدة 80) |
| `C01-EVID-13` | كاميرا محطة البنزين 18:10 | supporting | timeline | mislead + prove | تظهر سامي قرب المكان (المشتت) **و** يد قيادة غير الضحية — نصفها الآخر يظهر عند الترقية |

> كل دليل `critical` يحتاج trigger أساسيًا + بديلًا عادلًا عند JSON (قاعدة 177). `behavioral_chain_evidence_ids = [C01-EVID-07, C01-EVID-08]` و`cross_route_evidence_ids = [C01-EVID-06]` — قوائم متمايزة صراحةً.

## 6. النص الافتتاحي (ما يراه اللاعب أولًا)

- **`overview.public_summary`:** «رجل أعمال صغير يُوجد ميتًا في سيارته أمام مخازن المدينة. الرصاصة من مسدسه، ورسالة الوداع على حسابه — انتحار واضح على الورق. لكن كل شيء في المكان الصحيح أكثر من اللازم.»
- **`overview.main_question`:** «انتحار حقيقي ولا مشهد مصنوع؟ ولو مصنوع — مين اللي رتّبه، وليه كان مستعجل؟»
- **`overview.stakes`:** «أول ملف في إيدك. الاتهام الغلط هنا مش رقم في سجل — ده بيت بيتهدّ.»
- **`inbox_brief` (Chief Desk):** «ملف جديد على مكتبك: أشرف النجار، 48 سنة، مالك مطبعة. جثته اتلاقت في عربيته قدام مخازن المدينة. المعاينة الأولية بتقول انتحار — الرسالة والمسدس واضحين. عايزك تقفل الملف صح، مش بسرعة.»

## 7. قواعد الإغلاق (الهيكل)

- `requires_culprit + requires_motive + requires_method_or_opportunity` = كلها إجبارية
- `minimum_evidence_count: 5` · `minimum_behavioral_chain_verified: 1` · `minimum_cross_route_verified: 1`
- **قاموس الاتهام (Vocabulary):**
  - `available_motive_descriptions`: `motive_embezzlement` (إخفاء اختلاس) · `motive_inheritance` (ميراث) · `motive_partnership_dispute` (تصفية خلاف شراكة) · `motive_personal_grudge` (ثأر شخصي)
  - `available_method_descriptions` + `closureCatalog.method_ids`: `method_staged_suicide` (مشهد انتحار مرتّب) · `method_robbery` (سطو انتهى بالقتل) · `method_impulsive` (اندفاع لحظي)
  - `accepted_true_motive_ids: [motive_embezzlement]` · `accepted_true_method_ids: [method_staged_suicide]` · `accepted_true_culprit_ids: [char_marwan]` — `true_success` يتطلب الثلاثة معًا
  - `false_success_motive_ids`: باقي الدوافع المعروضة
- `false_success_flags_by_suspect: { char_samy: [case01_accused_wrong], char_marwan: [case01_right_man_wrong_story] }` — إدانة سامي تسجّل الظلم؛ وإدانة مروان بسرد غلط تترك أثرًا أيضًا (لا إغلاق بارد صامت)
- `closureCatalog.suspect_ids: [char_marwan, char_samy]` — لمى/رأفت خارج الكتالوج → اتهامهم يُرفض `missing_culprit`
- مسارات النتيجة: `true_success` (1) + `false_success` (أي اتهام مقبول بوابة لا يحقق true_success) + `rejected`
- المحاولة الغلط ليها ثمن (penalty_rules حسب القالب)

## 8. Flags والتوجيه

- `outcome_flags`: `success → [case01_clean_close, case01_true_culprit]` · `partial → [case01_partial]` · `failure → []` (حقل احتياطي — لا مسار في المحرك يمنحه)
- flags شرطية: `case01_saw_anomaly` (البذرة اتلقطت) · `case01_accused_wrong` (عبر `false_success_flags_by_suspect[char_samy]`) · `case01_right_man_wrong_story` (عبر `[char_marwan]`) · `case01_false_close` (`false_success_flag`)
- اصطلاح التسمية: عائلة `case01_*` فقط — مطابقًا `flags_registry.md` (يُحدَّث بالقائمة الجديدة قبل التسجيل؛ المحتوى القديم فيه لقضية case01 المحذوفة)
- `next_case_rules`: 3 مسارات — `[100] anomaly+clean → slot بصمة-تصميم` · `[60] accused_wrong → slot مستقلة تنفيس` · `[10] default → case02`
- أول قياس بصمة يتسجل آليًا من الإغلاق (`first_case_closure_route`)

## 9. معيار الجودة (ما نعد به كلاعبين)

- الحل السطحي مقنع — اللاعب المستعجل يقع في `false_success` ويتعلم: **المشهد المرتّب هو الدليل**
- الحل الحقيقي يحتاج ≥5 verified وربط محورين (سلوكي + cross-route إجباريان) — الصعوبة الفعلية **«افتتاحية موجّهة»** لا «متوسطة»: البوابة تحجز 3 من 5 مواضع، وهذا مقصود في أول قضية
- مفيش info-block: كل حقيقة ليها مصدران على الأقل (قاعدة منع الاختناق)
- **معرفة الحقيقة حقّ لا مهارة:** في أي إغلاق زائف على سامي، epilogue الإغلاق يُظهر براءته صراحةً («كان رايح يحذّر أخوه») — سواء كشف اللاعب لمى أم لا. النبرة/التوقيت يتحمّلان العقوبة؛ الحقيقة تصل دائمًا
- بعد الإغلاق: سؤال معلّق واحد بلا إجابة — «ليه ملف بارد اتلمس قبل البلاغ بدقائق؟»

## 10. خطوات البناء بعد الاعتماد

1. `case01.json` كامل + `blueprints.json` (mapping فقط)
2. `runtime/test/case01.spec.ts` → `npx vitest run`
3. `npm run test:smoke:validators`
4. تسجيل في `runtime/src/cases/registry.ts`
5. تحديث `flags_registry.md` بقائمة `case01_*` الجديدة (المحتوى الحالي للقضية المحذوفة)
6. التأكد أن `REQUEST_DEEP_METADATA_RECOVERY` له مسار قابل للاكتشاف في الواجهة (أو يُكشف عبر trigger مرئي) — البذرة الشبكية تعتمد عليه، والدليل لازم يحمل `tags: ["grand_truth_seed"]`
7. مراجعة المراجع المحايد (subagent) على `truth_*.md` + JSON
8. commit مستقل `feat(case01): ...`
