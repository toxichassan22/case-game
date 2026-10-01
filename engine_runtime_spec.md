# engine_runtime_spec.md

## الهدف
هذا الملف هو العقد التنفيذي للمحرك قبل كتابة أي Runtime فعلي.
وظيفته إغلاق 4 فجوات قاتلة:
- تعريف الـ Tick
- معادلات السلوك
- معادلة وعي الثالوث
- سياسة الأخطاء والتحقق أثناء التشغيل

## 1. Tick System

### التعريف الحتمي
- الـ Tick لا يعتمد على الزمن الحقيقي.
- القاعدة الثابتة:
  - `1 accepted player action = 1 tick`
- المقصود بـ `accepted player action`:
  - Click معتبر
  - اختيار حواري معتبر
  - سحب/إفلات معتمد
  - تقديم دليل
  - إرسال اتهام
- الأفعال المرفوضة في مرحلة التحقق:
  - لا تخلق Tick
  - ولا تغير الحالة

### نتيجة هذا التعريف
- `cooldown_ticks` تنخفض فقط عندما ينفذ اللاعب فعلًا مقبولًا.
- التأخيرات مثل:
  - تقرير معمل
  - فتح أداة
  - رد فعل الثالوث
- تُقاس بعدد الأفعال المستقبلية، لا بعدد الثواني.
- هذا يجعل السلوك:
  - قابلًا لإعادة التشغيل
  - قابلًا للاختبار
  - غير معتمد على FPS أو latency

### دورة الـ Tick
1. `Intent Intake`
   - تستقبل الواجهة نية اللاعب.
2. `Runtime Validation`
   - يتحقق المحرك من صحة الفعل والحقول والمراجع.
3. `Tick Open`
   - إذا كان الفعل صحيحًا، يفتح Tick جديد.
4. `Dispatch`
   - يحول الفعل إلى Event أو أكثر.
5. `Queue Drain`
   - يعالج المحرك كل الـ Event Queue الناتجة عن هذا الفعل بالكامل.
6. `Derived Systems Pass`
   - يعيد حساب:
     - `derived_route_profile`
     - `trinity_awareness_score`
     - penalties
     - retaliation eligibility
7. `Commit`
   - يكتب `Confirmed State`.
8. `Broadcast`
   - يرسل Snapshot موحدًا إلى الواجهة.

### قاعدة Queue Drain
- لا يبدأ Tick جديد قبل أن ينتهي السابق.
- كل الأحداث المشتقة من الفعل نفسه يجب أن تُستهلك بالكامل داخل نفس الـ Tick.
- أي Event مجدول للمستقبل لا يعالج الآن، بل يحجز عبر:
  - `scheduled_tick = current_tick + delay_ticks`

### Dev Loop Guard
- في بناءات التطوير فقط، يطبق المحرك:
  - `max_events_per_tick_dev_only = 256`
- إذا تجاوزت سلسلة الأحداث هذا الحد داخل Tick واحد:
  - يوقف المحرك Drain الحالي
  - يسجل `RUNTIME_EVENT_LOOP_GUARD`
  - يعيد آخر `Confirmed Snapshot`
  - ويفعل `Safe Mode`
- هذا الحارس:
  - لا يغير منطق الإنتاج
  - لكنه يمنع:
    - infinite loops
    - recursive triggers
    - misconfigured event chains

### معادلة الـ Cooldown
```text
remaining_cooldown_ticks_next =
  max(0, remaining_cooldown_ticks_current - 1)
```

- تطبق هذه المعادلة مرة واحدة فقط عند نهاية كل Tick مقبول.

## 2. Runtime Validation Layer

### الهدف
الـ Compiler Validation وحده غير كاف.
المحرك نفسه يجب أن يرفض الأحداث الفاسدة أو غير المكتملة أثناء التشغيل.

### طبقات التحقق
1. `Event Schema Validation`
   - التحقق من وجود:
     - `event_name`
     - `payload`
     - `source`
     - `timestamp`
     - `priority`
2. `Reference Validation`
   - التحقق من أن:
     - `case_id` موجود
     - `source_ref` موجود داخل تعريف القضية
     - `interaction_id` صالح داخل المصدر
3. `State Transition Validation`
   - التحقق من أن:
     - الانتقال بين الحالات مسموح
     - السؤال غير محروق
     - الدليل ليس `corrupted`
4. `Trigger Validation`
   - التحقق من أن Trigger يملك الحقول المطلوبة
   - وأن الـ Event يطابق `logic_operator` و`conditions`

### قاعدة الرفض
- إذا فشل التحقق:
  - يرفض الحدث
  - يسجل الخطأ
  - لا يحدث أي State Mutation
  - يعاد آخر `Confirmed State` إلى الواجهة

### عقدة التحقق من الإغلاق (Closure Validation Contract)
- إذا احتوى تعريف القضية على:
  - `closure_rules.validate_closure`
- يصبح هذا العقد إلزاميًا أثناء `EVENT_CASE_SUBMISSION_ATTEMPT`.
- لا يجوز للمحرك اعتبار الإغلاق صالحًا اعتمادًا على عدد الأدلة فقط.
- التحقق الأدنى المقفول:
  - `behavioral_chain_verified >= required`
  - `cross_route_verified >= required`
  - `no_shared_evidence_between_roles = true`
- المعادلة التنفيذية المرجعية:

```text
closure_submission_valid =
  culprit_is_present
  and motive_is_present
  and method_is_present
  and verified_evidence_count >= minimum_evidence_count
  and behavioral_chain_verified_count >= minimum_behavioral_chain_verified
  and cross_route_verified_count >= minimum_cross_route_verified
  and shared_evidence_between_roles_count == 0
```

- `culprit_is_present` تعني الوجود في `closureCatalog.suspect_ids` فقط — وليست صحة الاتهام.
- بعد اجتياز البوابة، يُحسم الحكم كالتالي:
  - `true_success`: يتطلب `submitted_motive ∈ accepted_true_motive_ids` **و** `submitted_suspect ∈ accepted_true_culprit_ids` **و** `submitted_method_or_timeline ∈ accepted_true_method_ids` (القائمتان الأخيرتان إن صُرّحتا؛ وإلا يكفي الحضور في الـ catalog — سلوك قديم).
  - `false_success`: أي اتهام مقبول بوابة لكنه لا يحقق `true_success` — يُدين بريئًا أو يخطئ الدافع — ويمنح `outcome_flags.partial + false_success_flag + false_success_flags_by_suspect[submitted_suspect]`.
  - `rejected`: فشل البوابة — بأكواد الأسباب الصريحة.
- إذا فشل هذا التحقق:
  - يرفض الإغلاق
  - يطلق `RUNTIME_CLOSURE_VALIDATION_FAILED`
  - ويعيد سببًا صريحًا مثل:
    - `missing_culprit`
    - `missing_behavioral_chain`
    - `missing_cross_route_evidence`
    - `shared_evidence_used_twice`

### قاعدة منع العد المزدوج
- لا يجوز للمحرك احتساب Evidence واحد داخل أكثر من bucket حرج في نفس محاولة الإغلاق إذا كانت القضية صرحت:
  - `no_shared_evidence_between_roles = true`
- هذا المنع يجب أن يُنفذ Runtime، لا عبر الـ UI فقط.

### أكواد الأخطاء المقترحة
```json
{
  "error_code": "RUNTIME_REF_MISSING",
  "severity": "error",
  "event_name": "EVENT_INTERROGATION_NODE_UNLOCKED",
  "case_id": "case01",
  "message": "source_ref does not exist in runtime case definition",
  "recovery_action": "reject_event"
}
```

## 3. Invalid State Policy

### الحالات غير الصالحة
- Event ناقص
- Trigger مكسور
- مرجع Evidence غير موجود
- انتقال غير قانوني بين مراحل الاستجواب
- Snapshot محمّل من الحفظ لكن به حقول حاسمة ناقصة

### سياسة التعامل
- `Recoverable`
  - يرفض الحدث فقط
  - يسجل Warning أو Error
  - يستمر التشغيل
- `Session-Critical`
  - يرفض الحدث
  - يعيد آخر `Confirmed Snapshot`
  - يعيد تشغيل الـ Tick بدون Mutation
- `Case-Critical`
  - يدخل القضية في `Safe Mode`
  - يمنع:
    - ترقية الأدلة
    - حل الإغلاق
    - تشغيل `next_case_rules`
  - ويظهر الخطأ فقط في أدوات التطوير

### Safe Mode
- لا يظهر للاعب النهائي في النسخة الإنتاجية كنص تقني.
- في التطوير:
  - يظهر داخل `DevDebugPanel`
  - مع سبب الدخول
  - وآخر Snapshot صالح
  - ويطلق `Dev Alert` بصريًا عالي التباين أعلى الواجهة حتى لا يمر الخطأ بصمت

### قاعدة الـ Rollback
```text
if state_validation_failed:
  restore(last_confirmed_snapshot)
  reject(current_event)
  log(runtime_error)
```

### إعادة التفسير المبنية على الحالة (State-Based Reinterpretation)
- لا يجوز بناء إعادة تفسير الأدلة الحرجة على ترتيب وصول Events الخام فقط.
- القاعدة التنفيذية:
  - أي `reinterpretation_rule` يجب أن يعاد تقييمها من `Confirmed State` بعد نهاية كل Tick مقبول.
- المعنى:
  - lag
  - async arrival
  - caching
  - event replay
  - لا يجوز أن يترك الدليل في تفسير قديم خاطئ إذا كانت شروط الحالة الحالية تغيّر معناه.
- المعادلة المرجعية:

```text
for each reinterpretation_rule in case_definition:
  if current_confirmed_state satisfies rule.state_predicates:
    apply(rule.new_interpretation)
  else:
    apply(rule.fallback_interpretation)
```

- إذا تغيّر التفسير بسبب إعادة تقييم الحالة:
  - يطلق المحرك:
    - `EVENT_EVIDENCE_REINTERPRETED`
  - لكن هذا الحدث ناتج من الحالة المؤكدة نفسها، لا من ترتيب event arrival.

## 4. Behavior Equations

### الحالة الرقمية الأولية لكل جلسة استجواب
```text
pressure_score = 0
spam_score = 0
aggression_score = 0
profile_match_score = 0
```

### القيم المأخوذة من ملف الشخصية
```text
collapse_threshold = Cognitive_Profile.collapse_threshold or 7
lawyer_up_threshold = Cognitive_Profile.lawyer_up_threshold or 7
aggression_tolerance = Cognitive_Profile.aggression_tolerance or 2
rapport_affinity = Cognitive_Profile.rapport_affinity or 0
evidence_rigidity = Cognitive_Profile.evidence_rigidity or 0
```

### تعديل العتبات بالعلاقة الممتدة
```text
relationship_modifier =
  if npc_global_memory.relationship_score <= -3 then +1
  else if npc_global_memory.relationship_score >= +3 then -1
  else 0

effective_collapse_threshold =
  collapse_threshold + relationship_modifier

effective_lawyer_up_threshold =
  lawyer_up_threshold - relationship_modifier
```

### جدول الأفعال والدلتا
| Action | pressure | spam | aggression | profile_match | Notes |
|---|---:|---:|---:|---:|---|
| `aggressive_choice` | +2 | +0 | +2 | -1 | يحرق الخيار التعاطفي الموازي |
| `empathetic_choice_aligned` | +0 | +0 | -1 | +2 | لا يقل عن 0 |
| `empathetic_choice_misaligned` | -1 | +0 | +0 | -1 | `pressure` لا يقل عن 0 |
| `present_verified_evidence_relevant` | +3 | +0 | +0 | +1 | يفتح الضغط إذا كان مناسبًا |
| `present_irrelevant_evidence` | +0 | +1 | +0 | -1 | يضعف المصداقية |
| `expose_confirmed_contradiction` | +2 | +0 | +0 | +1 | أقوى من السؤال العادي |
| `repeat_question` | +0 | +1 | +0 | -1 | Anti-bruteforce |
| `tactical_silence_success` | +1 | +0 | +0 | +0 | يعمل فقط مع شخصيات `ramble/collapse` |

### معادلات التحديث
```text
pressure_score_next =
  max(0, pressure_score_current + action_pressure_delta)

spam_score_next =
  max(0, spam_score_current + action_spam_delta)

aggression_score_next =
  max(0, aggression_score_current + action_aggression_delta)

profile_match_score_next =
  profile_match_score_current + action_profile_delta
```

### مراحل الآلة
- `Probing`
- `Pressure`
- `Branching`
- `Collapse`
- `Lawyer Up`

### انتقالات الآلة
```text
Probing -> Pressure
if presented_verified_evidence_relevant = true
and pressure_score >= 3

Pressure -> Branching
if pressure_score >= 5

Branching -> Collapse
if resolution_score_effective >= effective_collapse_threshold
and aggression_score <= aggression_tolerance
and spam_score < dialogue_spam_limit

Branching -> Lawyer Up
if spam_score >= dialogue_spam_limit
or aggression_score > aggression_tolerance
or (pressure_score >= effective_lawyer_up_threshold
    and resolution_score_effective < effective_collapse_threshold)
```

### معادلة الحسم
```text
resolution_score =
  pressure_score
  + profile_match_score
  - aggression_score
  - spam_score
```

### Deterministic Micro-Variation
- لتجنب السلوك الآلي الجامد، يجوز تطبيق:

```text
micro_variation ∈ [-0.2, +0.2]
```

- لكن فقط إذا كان مشتقًا حتميًا من:
  - `playthrough_seed`
  - `session_id`
  - `current_tick`
  - `action_id`
- المعادلة التنفيذية:

```text
resolution_score_effective =
  resolution_score + micro_variation
```

- القيود:
  - لا يفتح `Pressure` بلا دليل صالح
  - لا يلغي `dialogue_spam_limit`
  - لا يكسر `aggression_tolerance`
  - ولا يقلب نتيجة بعيدة عن العتبة بوضوح

### قاعدة Burned Choices
```text
if action = aggressive_choice:
  burn(parallel_empathetic_choice_id)

if action creates strategic hostility:
  burn(profile_sensitive_followup_ids)
```

- الخيار المحروق لا يعود داخل نفس الجلسة.

## 5. Trinity Awareness Formula

### النطاق
```text
minimum_awareness = 0
maximum_awareness = 100
```

### معادلة التحديث
```text
awareness_score_next =
  clamp(
    minimum_awareness,
    maximum_awareness,
    awareness_score_current
    + awareness_gain_total
    - awareness_decay_total
  )
```

### مصادر الزيادة
| Runtime Observation | Delta |
|---|---:|
| verify evidence tagged `grand_truth_seed` | +2 |
| connect evidence from 2 different `grand_truth_axis` values on board | +3 |
| connect evidence from all 3 axes in one valid cluster | +5 |
| choose motive `manipulated_by_network` | +4 |
| mark case as `resolved_as_network_activity` | +4 |
| identify `empty_third_seat_hint_seen` from supported evidence | +5 |
| correctly attribute retaliation as proxy behavior | +3 |

### Diminishing Returns Per Case
- لمنع الـ Min-Maxing داخل قضية واحدة، تطبق الزيادة مع معامل تراجع لكل فئة Awareness داخل القضية نفسها.
- المنحنى المرجعي:

```text
awareness_multiplier_by_repeat_index =
  [1.0, 0.75, 0.5, 0.25]
```

- المعادلة:

```text
effective_awareness_gain =
  base_awareness_gain
  × awareness_multiplier_by_repeat_index[category_repeat_index]
```

- `category_repeat_index` يعني عدد مرات تفعيل نفس فئة المصدر داخل القضية:
  - `grand_truth_seed`
  - `network_motive`
  - `multi_axis_connection`
  - `proxy_detection`
- بعد الوصول إلى آخر عنصر في المنحنى:
  - يبقى المعامل ثابتًا على `0.25`

### مصادر الانخفاض
| Runtime Observation | Delta |
|---|---:|
| accept a declared `red_herring` as primary theory | -3 |
| resolve a case as purely individual while network evidence was available | -4 |
| accept false confession flagged by runtime as protective/manipulated | -4 |
| discard verified grand truth seed as irrelevant | -2 |

### قواعد التفعيل
- لا تطبق أي زيادة أو نقصان إلا إذا أنتجت Event موثقًا داخل نفس الـ Tick.
- لا يسمح بجمع نفس مصدر الوعي مرتين من نفس `source_ref` داخل القضية.
- يحفظ النظام `awareness_source_history` لمنع التكرار الوهمي.
- ويحفظ أيضًا `awareness_category_repeat_count` لتطبيق `diminishing returns` داخل القضية.

### عتبات الرد
```text
Tier 1 = 25
Tier 2 = 50
Tier 3 = 75
```

### أهلية الـ Retaliation
```text
retaliation_allowed =
  awareness_score_crossed_threshold = true
  and (current_tick - last_trinity_retaliation_tick) >= cooldown_ticks
  and trinity_retaliation_count < max_events_per_case
```

### اختيار المسؤول
```text
responsible_role =
  retaliation_rule.primary_role

if responsible_role = vacant_trinity_role
and proxy_cover_enabled = true:
  responsible_role = retaliation_rule.proxy_role
```

### قواعد الـ Stacking
- إذا `allow_same_tick_stack = false`:
  - يطبق رد واحد فقط داخل الـ Tick
- إذا `priority_mode = highest_tier_only`:
  - يختار المحرك أعلى Retaliation Tier مؤهل
- إذا `duplicate_event_policy = reject_same_source`:
  - ترفض استجابة ثانية من نفس `source_ref` داخل القضية

## 6. Progressive Penalty Runtime

### المعادلة
```text
route_violation_counters[route]_next =
  route_violation_counters[route]_current + 1
```

### طبقات الاحتكاك
```text
if violations >= warning_at:
  emit warning

if violations >= trust_loss_at:
  police_trust_score -= trust_loss_per_violation

if violations >= delay_tick_cost_at:
  scheduled_tick += delay_ticks_per_violation

if violations >= temporary_tool_disable_at:
  disable_tool_until_tick =
    current_tick + temporary_disable_duration_ticks
```

- القفل الثنائي الكامل لا يستخدم إلا إذا كان:
  - `binary_lock_enabled = true`
  - ومصرحًا به صراحةً داخل الـ Schema

### قاعدة التفسير المرئي للعقوبة غير العشوائية
- لا يجوز للمحرك تطبيق:
  - delay
  - provisional result
  - queue pressure
  - degraded certainty
- كعقوبة صامتة.
- أي أثر احتكاكي غير عشوائي يجب أن يولد:
  - `visible_notice`
  - أو `system_toast`
  - أو `briefing_note`
- الصيغة المرجعية:

```text
if penalty_effect_applied and player_facing_explanation_missing:
  raise RUNTIME_PENALTY_EXPLANATION_MISSING
```

- أمثلة تفسير مقبولة:
  - "تحليل المعمل تأخر بسبب ضغط الاسترجاع الرقمي."
  - "النتيجة الحالية أولية حتى يكتمل مسار الفحص."

## 7. next_case_rules Runtime Guard

### القاعدة
- `next_case_rules` يجب أن تكون غير متداخلة وظيفيًا عند نفس الأولوية.
- إذا طابقت Ruleان أو أكثر بنفس `priority` داخل نهاية نفس القضية:
  - يعتبر هذا `Case-Critical Configuration Error`
  - ترفض عملية اختيار القضية التالية
  - ويُفعل `Safe Mode` في بيئة التطوير حتى تُصلح القاعدة

### عقدة Hooks الانتقال للقضية التالية
- يجوز لتعريف القضية أن يضيف:
  - `transition_context_hooks`
- هذه الـ Hooks لا تغيّر target case.
- وظيفتها:
  - تمرير friction سردي أو معرفي إلى القضية التالية
  - مثل:
    - `missing_dialogue_line`
    - `biased_briefing_assumption`
    - `clue_summary_skew`
- يجب أن تكون:
  - deterministic
  - ناتجة من Flags مؤكدة
  - وغير عشوائية
- هذا ضروري خصوصًا لحالات:
  - `false success`
  - حيث يجب أن يظهر الأثر في القضية التالية لا كخصم رقمي صامت فقط

## 8. Performance Strategy

### المبادئ
- لا يعاد حساب الأنظمة المشتقة إلا إذا تغيرت مدخلاتها داخل الـ Tick.
- لا يحتفظ Audit Log إلا بالأحداث التي أثرت في الحالة.
- Snapshot الكامل يكتب فقط عند `Commit`.

### Lazy Evaluation
- `derived_route_profile`
  - يعاد حسابه فقط إذا تغيرت حالة Evidence مؤثرة
- `trinity_awareness_score`
  - يعاد حسابه فقط إذا ظهر Event مدرج داخل `awareness_sources`
- `retaliation eligibility`
  - لا يفحص إلا عند عبور عتبة أو انخفاض Cooldown

## 9. Runtime Debug Contract

### القنوات التي يجب أن يكتبها المحرك في بيئة التطوير
```json
{
  "engine_debug": {
    "event_trace": [],
    "live_flags": {},
    "rollback_snapshots": [],
    "runtime_errors": [],
    "dev_alerts": [],
    "safe_mode_state": {
      "enabled": false,
      "reason": null,
      "severity": "warning",
      "display_mode": "banner"
    }
  }
}
```

### ما الذي يستهلك هذه القنوات؟
- `DevDebugPanel`
- اختبارات التكامل
- مؤلفو القضايا أثناء ضبط الأدلة التعاونية

## 10. Save Versioning & Migration

### قاعدة الإصدار
- كل ملف حفظ يجب أن يحتوي على:

```text
save_version = "v1.0"
```

- لا يجوز للمحرك تحميل Save بلا `save_version`.

### سياسة التحميل
```text
if save_version == runtime_supported_version:
  load_save()
else if migration_exists(save_version, runtime_supported_version):
  migrate_then_load()
else:
  reject_save_and_raise_dev_alert()
```

### الهدف
- حماية ملفات الحفظ عند تغير:
  - الـ Schema
  - shape الحالة
  - عتبات السلوك
  - عقود الـ Runtime

## 11. العلاقة مع الملفات الأخرى
- `essentional.md`
  - يشرح الهيكل العام للمحرك
- `schema.md`
  - يحدد شكل البيانات والعتبات
- `behavior.md`
  - يحدد قواعد السلوك ومراحل الآلة
- `ui_components.md`
  - يربط قنوات الـ Debug و`Confirmed State` بالواجهة
- `engine_runtime_spec.md`
  - يحول كل ذلك إلى قواعد Runtime حتمية قابلة للتكويد
