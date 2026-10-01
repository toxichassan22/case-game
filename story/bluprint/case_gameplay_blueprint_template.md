# caseXX Gameplay Blueprint Template

## الهدف
هذا الملف لا يستبدل `cases/caseXX/caseXX.md`.
هذا الملف يحول القضية من `Author Design File` إلى `Gameplay Blueprint` قابل للتحويل لاحقًا إلى JSON وتنفيذ داخل الواجهة.

## مفاتيح القراءة

- `PLAYER-FACING`
  - هذا المحتوى يراه اللاعب داخل اللعبة كما هو أو بصياغة قريبة جدًا منه.
- `DESIGN NOTE`
  - هذه ملاحظة للمصمم أو الكاتب أو من يحول الملف إلى تنفيذ.
- `HIDDEN LOGIC`
  - هذه طبقة لا يجب أن تُعرض للاعب حرفيًا، لكنها تفسر لماذا يعمل الملف بهذا الشكل.
- `SYSTEM RULE`
  - هذه قاعدة شبه برمجية أو شرط فتح أو شرط نجاح/فشل.

---

## 1. Core Truth

### DESIGN NOTE
- الحقيقة المحلية الثابتة:
  - [من فعل الجريمة؟]
  - [كيف فعلها؟]
  - [لماذا فعلها؟]
  - [ما الخيط المحلي الأهم؟]
  - [ما الخيط الكبير المرتبط بالشبكة؟]
  - [ما الدليل الناقص الذي لن يكتمل إلا بتعاون مسارين أو أكثر؟]

### DESIGN NOTE
- المشتبه بهم الأساسيون:
  - [مشتبه 1]
  - [مشتبه 2]
  - [مشتبه 3]
  - [مشتبه 4 إن وجد]

### HIDDEN LOGIC
- ما الذي لا يجب أن يُعرض للاعب حرفيًا؟
- ما الذي يجب أن يتحول إلى:
  - مستند؟
  - مقتطف حوار؟
  - ملاحظة سلوكية؟
  - عنصر بصري؟
  - شذوذ واجهة مقصود؟

---

## 2. Player Question

### PLAYER-FACING
- السؤال العام:
  - [ما السؤال المركزي الذي يقود القضية؟]

### PLAYER-FACING
- ما يجب على اللاعب إثباته قبل الإغلاق:
  - [نقطة 1]
  - [نقطة 2]
  - [نقطة 3]

### SYSTEM RULE
- صيغة الإغلاق النهائية:
  - `suspect`
  - `motive`
  - `method`
  - `evidence_ids[3+]`

---

## 3. Surface Apps

### PLAYER-FACING
- التطبيقات المفتوحة في بداية القضية:
  - `Inbox`
  - `Case Files`
  - `Database`
  - [أي تطبيق إضافي؟]

### PLAYER-FACING
- التطبيقات التي تفتح لاحقًا:
  - `String Board`
  - `Forensics Tool`
  - `Timeline Tool`
  - `Behavior Console`
  - [أي أداة خاصة؟]

---

## 4. Naming Convention

### DESIGN NOTE
- هذا الترميز يصبح ثابتًا في كل القضايا:
  - `INT-XX`
  - `SCN-XX`
  - `BLD-XX`
  - `INT-NAME-XX`
  - `OBJ-XX`
  - `DB-XX`
  - `DIG-XX`

### SYSTEM RULE
- أسماء الملفات داخل كل قضية يجب أن تكون:
  - ثابتة
  - قابلة للتحويل إلى `document_id`
  - قابلة للربط داخل `evidence_list`

---

## 5. Case Files Structure

### Folder A - Intake
- [INT-01]
- [INT-02]
- [INT-03]

### Folder B - Crime Scene
- [SCN-01]
- [SCN-02]
- [SCN-03]

### Folder C - Statements
- [INT-SUSPECT1-01]
- [INT-SUSPECT2-01]
- [INT-SUSPECT3-01]

### Folder D - Records
- [BLD/DB/DIG files]

### Folder E - Sensitive Items
- [OBJ-01]
- [OBJ-02]
- [OBJ-03]

---

## 6. Player-Facing Documents

### [DOC-ID] [اسم الملف]
#### DESIGN NOTE
- الغرض:
  - [وظيفته في اللعب]

#### PLAYER-FACING
- [النص أو وصف المحتوى]

[كرر نفس النمط لكل الملفات المهمة]

---

## 7. Interrogation Excerpts

### [INT-NAME-01]
#### DESIGN NOTE
- الهدف:
  - [ما الذي يجب أن يكتشفه اللاعب من هذا الاستجواب؟]
- ما الـ Question IDs المهمة؟
  - [Q01]
  - [Q02]
  - [Q03]

#### PLAYER-FACING
```text
[سؤال]
[إجابة]

[سؤال]
[إجابة]
```

#### DESIGN NOTE
- ملاحظة سلوكية:
  - [تردد / زلة / تناقض / نبرة]
- قواعد الحرق:
  - [إذا اختار Q01 احرق Q03]
  - [إذا بدأ بالترهيب اقفل مسار التعاطف]

#### HIDDEN LOGIC
- [ما المعنى الحقيقي لهذا المقتطف؟]

[كرر لمشتبهين آخرين]

---

## 8. Route Gameplay

### المسار الزمني
#### DESIGN NOTE
- الهدف:
  - [ماذا يثبت المسار الزمني؟]

#### PLAYER-FACING TOOLS
- [أداة/ملفات]

#### PLAYER TASK
- [ما الذي يفعله اللاعب؟]

#### HIDDEN LOGIC
- [الاستنتاج الحقيقي]

### المسار الجنائي
#### DESIGN NOTE
- الهدف:
  - [ماذا يثبت المسار الجنائي؟]

#### PLAYER-FACING TOOLS
- [أداة/ملفات]

#### PLAYER TASK
- [ما الذي يفعله اللاعب؟]

#### HIDDEN LOGIC
- [الاستنتاج الحقيقي]

### المسار السلوكي
#### DESIGN NOTE
- الهدف:
  - [ماذا يثبت المسار السلوكي؟]

#### PLAYER-FACING TOOLS
- [أداة/ملفات]

#### PLAYER TASK
- [ما الذي يفعله اللاعب؟]

#### HIDDEN LOGIC
- [الاستنتاج الحقيقي]

### التعاون بين المسارات
#### DESIGN NOTE
- الدليل أو الأدلة التي تبدأ `partial`:
  - [EVID-01]
  - [EVID-02]

#### SYSTEM RULE
- ما الذي يكمل هذا الدليل؟
  - [Trigger من المسار الزمني]
  - [Trigger من المسار الجنائي]
  - [Trigger من المسار السلوكي]
- لكل Trigger يجب تحديد:
  - `trigger_id`
  - `logic_operator`
  - `conditions[]`
  - `on_complete`

#### SYSTEM RULE
- مثال Trigger صريح:
  - `trigger_id: trig_int_suspect1_q03`
  - `logic_operator: all`
  - `conditions[0].event_name: EVENT_EVIDENCE_VERIFIED`
  - `conditions[0].source_ref: LAB-TOX-02`
  - `conditions[0].interaction_id: RESULT-READY`
  - `conditions[0].expected_player_action: review_report`
  - `conditions[0].required_result: compound_tagged`
  - `conditions[1].event_name: EVENT_INTERROGATION_NODE_UNLOCKED`
  - `conditions[1].source_ref: INT-SUSPECT1-01`
  - `conditions[1].interaction_id: Q03`
  - `conditions[1].expected_player_action: choose_dialog_option`
  - `conditions[1].required_result: suspect_slip_detected`
  - `on_complete: upgrade EVID-04 from partial to verified`

#### SYSTEM RULE
- مثال Trigger بديل لنفس الاكتمال:
  - `trigger_id: trig_receipt_lab_02`
  - `logic_operator: all`
  - `conditions[0].event_name: EVENT_EVIDENCE_VERIFIED`
  - `conditions[0].source_ref: LAB-TOX-02`
  - `conditions[0].interaction_id: RESULT-READY`
  - `conditions[0].expected_player_action: review_report`
  - `conditions[0].required_result: compound_tagged`
  - `conditions[1].event_name: EVENT_TIMELINE_CONTRADICTION_CONFIRMED`
  - `conditions[1].source_ref: TIMELINE-BOARD`
  - `conditions[1].interaction_id: LOCK-EVENT-07`
  - `conditions[1].expected_player_action: lock_timeline_event`
  - `conditions[1].required_result: purchase_window_confirmed`
  - `on_complete: upgrade EVID-04 from partial to verified`

#### HIDDEN LOGIC
- كيف يتحول معنى الدليل بعد اكتمال التعاون؟
  - [من اشتباه إلى دليل]
  - [من مشتت إلى مفتاح]
- ما الـ Trigger الأساسي وما الـ Fallback؟
  - [Primary]
  - [Fallback]

---

## 9. Unlock Conditions

### SYSTEM RULE
- [تطبيق/ملف]
  - يفتح إذا:
    - [شرط 1]
    - [شرط 2]
- [دليل ناقص]
  - يترقى إذا:
    - [Trigger من مسار آخر]
    - [Flag معين]

[كرر لكل unlock مهم]

---

## 10. String Board Nodes

### PLAYER-FACING NODES
- [شخص]
- [مكان]
- [دليل]
- [رمز]

### SYSTEM RULE
- ما المواضع الابتدائية أو المحفوظة للعقد؟
  - `[NODE-ID] -> x / y`
- ما الذي يجب أن يعود كما هو بعد الإغلاق وإعادة الفتح؟
  - [ترتيب العقد]
  - [الزوم]
  - [الـ viewport]

### DESIGN NOTE
- Connections يجب أن تكون ممكنة:
  - [A ↔ B]
  - [C ↔ D]

### DESIGN NOTE
- Connections مضللة لكن منطقية:
  - [A ↔ X]
  - [Y ↔ Z]

---

## 11. Closure Logic

### SYSTEM RULE
- يجب على اللاعب تحديد:
  - `suspect`
  - `motive`
  - `method`
  - `evidence_ids[3+]`

### PLAYER-FACING
- الشكل المقترح:
  - [كيف يغلق اللاعب القضية؟]

### DESIGN NOTE
- الأدلة القانونية المثالية:
  - [دليل 1]
  - [دليل 2]
  - [دليل 3]

---

## 12. Fail / Partial Success

### SYSTEM RULE
- نجاح كامل:
  - [شروط النجاح الكامل]

### SYSTEM RULE
- نجاح جزئي:
  - [شروط النجاح الجزئي]

### SYSTEM RULE
- فشل:
  - [شروط الفشل]

### DESIGN NOTE
- أثر الفشل:
  - [ماذا يتغير؟]

### SYSTEM RULE
- ثمن التخمين:
  - [خصم ثقة]
  - [قفل مسار مؤقت]
  - [تأخير تقرير]
  - [سحب شاهد]

---

## 13. Carryover / Inventory

### SYSTEM RULE
- العنصر القابل للاحتفاظ:
  - [OBJ / DOC / CODE]

### DESIGN NOTE
- نوع العنصر:
  - `persistent evidence` / `key` / `lore item` / `cross-case trigger`

### HIDDEN LOGIC
- استخدامه لاحقًا:
  - [في أي قضايا أو محاور يفيد؟]

### SYSTEM RULE
- الـ Flag الناتج:
  - `[inventory_or_persistent_flag]`

---

## 14. Derived Route Profile

### DESIGN NOTE
- ما الأدلة التي ترفع كل مسار؟
  - [أدلة زمني]
  - [أدلة جنائي]
  - [أدلة سلوكي]
- لا تكتب وزنًا رقميًا للقضية يدويًا.
- الـ Backend أو أداة البناء يجب أن تستخرج `derived_route_profile` من مجموع `route_weight.*` للأدلة الصالحة.

---

## 15. Trinity Awareness / UI Anomalies

### SYSTEM RULE
- ما الذي يرفع `trinity_awareness_score` في هذه القضية؟
  - [تصرف 1]
  - [تصرف 2]

### SYSTEM RULE
- ما الذي يخفض `trinity_awareness_score` في هذه القضية؟
  - [مشتت منطقي صدقه اللاعب]
  - [اعتراف كاذب قبله اللاعب]

### DESIGN NOTE
- إذا ارتفع الوعي مبكرًا، ما الرد؟
  - [شذوذ واجهة]
  - [إفساد دليل]
  - [ضغط على شاهد]
- إذا كان عضو الثالوث الموافق لهذا النوع من الرد ميتًا، من هو الـ Proxy الذي يغطي دوره؟
  - [عضو حي 1]
  - [عضو حي 2]

### PLAYER-FACING
- ما الشذوذ الذي قد يراه اللاعب؟
  - [رسالة تختفي]
  - [اسم يتبدل]
  - [ختم يومض]

---

## 16. Next Case Routing

### SYSTEM RULE
- اكتب `next_case_rules` التي تربط ناتج هذه القضية بالقضية التالية.

### DESIGN NOTE
- أي Ruleين لهما نفس `priority` يجب أن يكونا:
  - `Mutually Exclusive`
  - ومبررين بوضوح داخل هذا الـ Blueprint
- يجب دائمًا إضافة:
  - `Default Path`
  - بأقل `priority`
  - حتى لا يترك المؤلف النظام بلا مخرج صالح
- لا تعتمد على Runtime Guard وحده لحل التعارض؛ عالج التعارض في مرحلة الكتابة نفسها.

### SYSTEM RULE
- لكل Rule اكتب:
  - `rule_id`
  - `priority`
  - `required_flags_all`
  - `required_flags_any`
  - `blocked_flags`
  - `target_case_id`
  - `transition_reason`

---

## 17. JSON Notes

### ما يذهب إلى JSON لاحقًا
- تعريف المستندات
- النصوص القابلة للفتح
- مقتطفات التحقيق
- شروط الفتح
- `route_weight` لكل دليل
- `derived_route_profile`
- `requires_route_collaboration`
- `completion_triggers`
- `completion_triggers[].trigger_id`
- `completion_triggers[].logic_operator`
- `completion_triggers[].conditions[]`
- `completion_triggers[].conditions[].event_name`
- `completion_triggers[].conditions[].source_ref`
- `completion_triggers[].conditions[].interaction_id`
- `interrogation_burn_rules`
- `outcome_flags`
- `carryover_item`
- `failure_rules`
- `partial_success_rules`
- `penalty_rules`
- `trinity_awareness_delta`
- `trinity_awareness_decay`
- `ui_anomaly_rules`

### ما لا يجب أن يذهب إلى JSON حرفيًا
- شروحات المؤلف
- التحليل المباشر
- الجمل التي تشرح للاعب معنى الزلة بدل أن تجعله يكتشفها

---

## 18. القرار التنفيذي

- [ملف القضية المرجعي داخل `cases/caseXX/caseXX.md`] يقول: ما الحقيقة؟
- [ملف الـ Blueprint داخل `cases/caseXX/`] يقول: كيف يلعبها المستخدم؟
- [ملف JSON لاحقًا داخل `cases/caseXX/`] يقول: كيف ينفذها النظام؟
