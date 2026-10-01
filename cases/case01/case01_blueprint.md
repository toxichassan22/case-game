# case01 Gameplay Blueprint

## Scope
- هذا الملخص يعكس الـ blueprint المنفذ حاليًا، وليس المسودة القديمة.
- المرجع التنفيذي:
  - `cases/case01/case01.json`
  - `cases/case01/blueprints.json`
  - `runtime/src/case01/config.ts`

## Openable Sources
- `INT-SHARIF-01`
- `INT-LAYLA-01`
- `INT-HATEM-01`
- `INT-ABU-KHALED-01`
- `INT-DR-YAHYA-01`
- `TIMELINE-BOARD`
- `CHIEF-DESK`

## Review Blueprints
- `SCN-03`
  - `interaction_id: ORIGIN-CONFIRMED`
  - `result: office_origin_confirmed`
- `SCN-04`
  - `interaction_id: OUTER-HANDLE`
  - `result: outer_lock_possible`
- `DB-01`
  - `interaction_id: SHIFT-KEY-LOG`
  - `result: shift_key_assigned_to_sharif`
- `DB-03`
  - `interaction_id: PURCHASE-RECEIPT`
  - `result: thinner_purchase_confirmed`
- `DB-05`
  - `interaction_id: OPEN`
  - `result: coffee_receipt_reviewed`
- `DB-06`
  - `interaction_id: TRIP-TRACE`
  - `result: layla_execution_window_broken`
- `DB-07`
  - `interaction_id: OPEN`
  - `result: gps_records_reviewed`
- `DB-08`
  - `interaction_id: OPEN`
  - `result: financial_records_reviewed`
- `DB-09`
  - `interaction_id: OPEN`
  - `result: locksmith_records_reviewed`
- `SCN-05`
  - `interaction_id: OPEN`
  - `result: chemical_analysis_reviewed`
  - unlock path:
    - `SCN-03`
    - `DB-01`
- `EVID-PARTIAL-LOCK`
  - `interaction_id: OPEN`
  - `result: partial_lock_reviewed`
- `EVID-PARTIAL-FALSE-ORIGIN-STORY`
  - `interaction_id: OPEN`
  - `result: false_origin_story_reviewed`
- `EVID-PARTIAL-BLACK-LEDGER`
  - `interaction_id: OPEN`
  - `result: black_ledger_statement_reviewed`
- `EVID-SUP-CCTV-CORRUPTION`
  - `interaction_id: OPEN`
  - `result: corruption_precedes_heat`

## Inspect Blueprints
- `OBJ-01`
  - `interaction_id: INSPECT`
  - `result: black_ledger_fragments_found`
- `OBJ-02`
  - `interaction_id: INSPECT`
  - `result: spare_key_found`

## Dialog Blueprints
- `INT-SHARIF-01 / Q03`
  - `result: preemptive_origin_claim_logged`
  - يلتقط النفي الاستباقي عن منشأ الحريق.
- `INT-SHARIF-01 / Q06`
  - `result: key_access_statement_recorded`
  - يدخل في سلسلة `EVID-PARTIAL-LOCK`.
- `INT-SHARIF-01 / Q09`
  - `result: ledger_slip_logged`
  - يدخل في سلسلة `EVID-PARTIAL-BLACK-LEDGER`.
- `INT-LAYLA-01 / Q02`
  - `result: layla_office_entry_logged`
  - يفتح أو يدعم تبرئة ليلى زمنيًا.
- `CHIEF-DESK / REQ-EVIDENCE-01`
  - `result: additional_files_dispatched`
  - يفتح عدة عناصر مؤجلة مثل `OBJ-01`, `OBJ-02`, `EVID-SUP-CCTV-CORRUPTION`.
- `INT-DR-YAHYA-01 / Q01`
  - `result: yahya_behavioral_analysis_shared`
  - يقدم تحليلًا نفسيًا لسلوك شريف (تلميح خافت لأسلوب المُلقن).
- `INT-DR-YAHYA-01 / Q02`
  - `result: yahya_pattern_observation`
  - يطرح ملاحظة عن "النمط المنظم" للجريمة (بذرة Trinity awareness).
- `INT-DR-YAHYA-01 / Q03`
  - `result: yahya_coping_advice`
  - يقدم نصائح للتعامل مع ضغوط التحقيق (يبدو كأب روحي).

## Timeline Blueprints
- `LOCK-EVENT-03`
  - `title: تأكيد وجود شريف (20:41)`
  - prerequisites:
    - `SCN-04`
    - `DB-01`
- `LOCK-EVENT-05`
  - `title: رؤية شريف المزعومة (21:05)`
  - prerequisites:
    - `SCN-03`
    - `INT-SHARIF-01`
- `LOCK-EVENT-06`
  - `title: فساد الكاميرا (21:01)`
  - prerequisites:
    - `DB-01`
    - `EVID-SUP-CCTV-CORRUPTION`

## Critical Partial Evidence
- `EVID-PARTIAL-LOCK`
  - unlock trigger:
    - `SCN-04`
  - verified path primary:
    - `SCN-04`
    - `INT-SHARIF-01 / Q06`
    - `LOCK-EVENT-03`
  - verified path fallback:
    - `SCN-04`
    - `DB-01`
    - `LOCK-EVENT-03`
  - reinterpretation rule:
    - `OBJ-02 + DB-06` ينقل الدليل من شبهة ضد ليلى إلى حجة متماسكة ضد شريف

- `EVID-PARTIAL-FALSE-ORIGIN-STORY`
  - unlock trigger:
    - `SCN-03`
  - verified path:
    - `SCN-03`
    - `INT-SHARIF-01 / Q03`

- `EVID-PARTIAL-BLACK-LEDGER`
  - unlock trigger:
    - `OBJ-01`
  - verified path:
    - `OBJ-01`
    - `INT-SHARIF-01 / Q09`

## Closure Constraints
- suspect catalog:
  - `char_sharif`
- accepted true motives:
  - `motive_embezzlement_black_ledger`
- false-success motives:
  - `motive_insurance`
  - `motive_family_conflict`
- accepted true methods:
  - `method_arson_office_origin`
  - `method_side_door_lock`
  - `method_arson_front_door`
- validator:
  - `minimum_behavioral_chain_verified = 1`
  - `minimum_cross_route_verified = 1`
  - `no_shared_evidence_between_roles = true`

## Cross-Route Buckets
- behavioral bucket:
  - `DB-08`
  - `DB-09`
  - `EVID-PARTIAL-FALSE-ORIGIN-STORY`
  - `EVID-PARTIAL-BLACK-LEDGER`
- cross-route bucket:
  - `SCN-05`
  - `DB-07`
  - `EVID-PARTIAL-LOCK`

## Soft Exposure And Pressure
- `EVID-SUP-CCTV-CORRUPTION` يظهر كـ soft exposure بعد التقدم المناسب.
- `REQUEST_DEEP_METADATA_RECOVERY` قبل تثبيت `SCN-03` قد يفعّل `forensics_queue_pressure`.
- النتيجة ليست عقابًا عشوائيًا؛ هي تأخير أو provisional quality بشكل حتمي حسب الـ selector.

## Transition Logic
- إذا التقط اللاعب الشذوذ الرقمي وأغلق القضية جيدًا:
  - `case01_case02_with_hidden_clarity`
- إذا أغلقها محليًا بشكل صحيح بدون الالتقاط:
  - `case01_case02_clean_resolution`
- إذا وصل إلى false success:
  - `case01_case02_false_confidence`
- إذا فشل:
  - `case01_case02_failure_pressure`

## Maintenance Guardrails
- أي تعديل في هذا الملف يجب أن يكون انعكاسًا مباشرًا للـ JSON والـ config.
- لا تُذكر شخصيات أو مصادر أو مسارات غير موجودة فعليًا مثل:
  - `INT-FADI-01`
  - `فادي أمين`
  - اسم القضية `رماد الصيدلية`
