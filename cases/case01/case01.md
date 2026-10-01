# case01

## Canonical Authoring Note
- هذه الوثيقة تلخص النسخة المنفذة فعليًا من القضية الأولى.
- المصدر التنفيذي المعتمد هو:
  - `cases/case01/case01.json`
  - `cases/case01/blueprints.json`
- أي مستند أقدم يذكر `فادي أمين` أو اسم القضية `رماد الصيدلية` أو تصميمًا يستهدف 6 ساعات حل لم يعد معتمدًا.

## Metadata
- `case_id`: `case01`
- العنوان: `رماد الرف الأخير`
- النوع: `arson`
- الضحية: `محمود السيوفي`
- القضية تعليمية لكنها تحتوي من البداية على فرق واضح بين:
  - `حل قانوني`
  - `فهم حقيقي`

## Core Truth
- الجاني المحلي: `char_sharif` / `شريف عادل السيوفي`
- الدافع الحقيقي: `motive_embezzlement_black_ledger`
- الدوافع الضعيفة المقبولة كـ false success:
  - `motive_insurance`
  - `motive_family_conflict`
- الوسائل الصحيحة المقبولة:
  - `method_arson_office_origin`
  - `method_side_door_lock`
  - `method_arson_front_door`

## Cast
- `char_sharif`: الجاني الحقيقي.
- `char_abu_khaled`: مشتت محلي مرتبط بفرضية الحادث الكهربائي.
- `char_layla`: مشتبه بها مؤقتًا بسبب المفتاح وحركة الدخول.
- `char_hatem`: مشتبه به ثانوي يخرج زمنيًا عبر `DB-05`.
- `char_dr_yahya`: مستشار نفسي متعاون مع الشرطة — أول ظهور له في اللعبة. (متكرر عبر القضايا)

## Evidence Structure
- السلسلة السلوكية المطلوبة للإغلاق لا تعتمد على حدس عام؛ يجب إثبات واحد على الأقل من:
  - `DB-08`
  - `DB-09`
  - `EVID-PARTIAL-FALSE-ORIGIN-STORY`
  - `EVID-PARTIAL-BLACK-LEDGER`
- الدليل العابر للمسارات المطلوب للإغلاق يجب أن يتحقق منه عنصر واحد على الأقل من:
  - `SCN-05`
  - `DB-07`
  - `EVID-PARTIAL-LOCK`
- لا يجوز احتساب نفس الدليل في الشرطين.

## Investigation Routes
- `forensics`
  - يبدأ من `SCN-03`
  - يثبت منشأ الحريق
  - يفتح `SCN-04` و`DB-03`
- `timeline`
  - يراجع `DB-05` و`DB-06` و`DB-07`
  - يثبّت `LOCK-EVENT-03` و`LOCK-EVENT-06`
- `behavioral`
  - يلتقط `Q03` و`Q09`
  - يحول الأدلة الجزئية إلى سلاسل اتهام فعلية

## Partial Evidence Chains
- `EVID-PARTIAL-LOCK`
  - يبدأ كإشارة ناقصة/مضللة
  - يعاد تفسيره عبر `SCN-04` + `Q06` + `LOCK-EVENT-03`
  - يمكن أن يمر بحالة `contested` قبل أن يصل إلى `verified`
- `EVID-PARTIAL-FALSE-ORIGIN-STORY`
  - يُفتح بعد `SCN-03`
  - يثبت عبر الجمع بين `SCN-03` و`Q03`
- `EVID-PARTIAL-BLACK-LEDGER`
  - يُفتح بعد `OBJ-01`
  - يكتمل عبر `OBJ-01` + `Q09`

## Player-Facing Flow
- البداية العملية:
  - `Inbox`
  - `Case Files`
  - `Database`
- المصادر المفتوحة مباشرة من الـ blueprint:
  - `INT-SHARIF-01`
  - `INT-LAYLA-01`
  - `INT-HATEM-01`
  - `INT-ABU-KHALED-01`
  - `TIMELINE-BOARD`
  - `CHIEF-DESK`
- طلب `REQ-EVIDENCE-01` من `CHIEF-DESK` هو المفتاح لفتح عدة عناصر مؤجلة.

## Closure Model
- الإغلاق الصحيح:
  - `submitted_suspect = char_sharif`
  - `submitted_motive = motive_embezzlement_black_ledger`
  - `submitted_method_or_timeline` من قائمة الطرق الصحيحة
  - `submitted_evidence_ids` بعدد 3 أو أكثر
  - مع استيفاء شرط behavioral + cross-route
- الإغلاق الزائف:
  - المتهم يظل `char_sharif`
  - لكن الدافع يكون `motive_insurance` أو `motive_family_conflict`
  - ينتج عنه `case01_false_confidence_close`
- الفشل:
  - يحدث عند غياب السلسلة السلوكية
  - أو غياب الدليل العابر للمسارات
  - أو استخدام دليل واحد في الشرطين

## Carryover And Hooks
- `EVID-CARRYOVER-CCTV-BURNED-VIDEO` هو بذرة الانتقال إلى `case02` - فيديو 12 ثانية يظهر ظلًا يتلاعب بالكاميرا
- `EVID-SUP-CCTV-CORRUPTION` هو دليل مساعد يفتح الفيديو المحروق
- يمكن أن يرفع:
  - `is_clockmaker_suspicious_1`
  - `kept_case01_camera_corruption_file`
  - `kept_case01_cctv_burned_video`
- الانتقال التالي مضبوط عبر:
  - `hook_case02_clockmaker_seed`
  - `hook_case02_false_confidence`
  - `case01_case02_with_hidden_clarity`
  - `case01_case02_clean_resolution`
  - `case01_case02_false_confidence`
  - `case01_case02_failure_pressure`

## Maintenance Rule
- عند تعديل القضية الأولى:
  - عدّل `case01.json` و`blueprints.json` أولًا.
  - ثم حدّث هذه الوثيقة فقط لتلخيص التنفيذ الحالي.
  - لا تُعاد إضافة شخصيات أو مسارات غير موجودة في الملفات التنفيذية.
