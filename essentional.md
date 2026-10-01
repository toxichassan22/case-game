# essentional.md

## الهدف
هذا الملف هو `High-level Index & Architecture Overview`.
وظيفته جمع الصورة المعمارية الكبرى للنظام، وتحديد:
- كيف تتحرك اللعبة؟
- ما مسؤولية كل طبقة؟
- ما المرجع الذي يُرجع إليه عند الحاجة للتفاصيل التنفيذية الصارمة؟

هذا الملف لا يحمل المعادلات التنفيذية الدقيقة ولا قواعد الـ Runtime منخفضة المستوى.
للتفاصيل التنفيذية الصارمة، المرجع النهائي هو:
- `engine_runtime_spec.md`

## 1. المبادئ العليا

- اللعبة تعمل كنظام حتمي قابل لإعادة التشغيل.
- لا يوجد منطق حرج يترك للواجهة أو للمصادفة.
- الـ JSON يبقى طبقة بيانات Declarative.
- المحرك هو المسؤول عن:
  - تفسير الأحداث
  - ترقية الأدلة
  - توليد الـ Flags
  - تطبيق العقوبات
  - اختيار القضية التالية

## 2. حلقة اللعب (Game Loop)

### الصيغة المختصرة
`Observe -> Connect -> Hypothesize -> Test -> Confirm/Fail -> Update State`

### المسار العملي
1. `Case Intake`
   - استلام رسالة القضية وفتح الحالة الأولية.
2. `Evidence Review`
   - قراءة المستندات والتقارير وتثبيت الأدلة.
3. `Hypothesis Building`
   - ربط الأدلة والشخصيات والأحداث على `String Board`.
4. `Interrogation / Analysis`
   - استخدام الأدوات السلوكية والزمنية والجنائية لاختبار الفرضيات.
5. `Accusation / Resolution`
   - تقديم الاتهام وإغلاق القضية وتوليد الأثر الناتج.

## 3. النظرة العليا للمحرك

### Event-Driven Architecture
- اللعبة تعمل عبر `Event Bus`.
- اللاعب لا يغير الحالة مباشرة.
- الواجهة ترسل أفعالًا.
- المحرك يستهلكها.
- الحالة المؤكدة فقط هي ما يعود إلى الواجهة.

### الطبقات الرئيسية
- `Event Processor`
  - يدير مرور الأحداث داخل المحرك.
- `Evidence Engine`
  - يرفع الأدلة من `locked/partial` إلى `verified` عند تحقق الشروط.
- `Flag Engine`
  - يولد `outcome_flags` و`route flags` و`trinity flags`.
- `Penalty Engine`
  - يطبق الاحتكاك التدريجي والعقوبات.
- `Route Resolution Engine`
  - يحسم `derived_route_profile` و`vacant_trinity_role` و`next_case_rules`.
- `State Persistence Manager`
  - يحفظ `Confirmed State`.

## 4. مسار البناء والتنفيذ

### خط الأنابيب الرسمي
`Author File -> Blueprint -> JSON -> Engine Runtime`

### المعنى
- `Author File`
  - حيث يكتب المؤلف الحقيقة المحلية وبنية القضية.
- `Blueprint`
  - حيث تتحول الفكرة إلى قواعد لعب وTriggers ونتائج.
- `JSON`
  - حيث تصبح القضية Contract بيانات قابلًا للتنفيذ.
- `Engine Runtime`
  - حيث يطبق المحرك القواعد على الحالة الفعلية أثناء اللعب.

## 5. مسؤولية كل ملف مرجعي

- `schema.md`
  - شكل البيانات التعاقدي.
- `behavior.md`
  - منطق السلوك وآلات الحالة.
- `ui_components.md`
  - إسقاط الحالة على الواجهة.
- `grand_truth.md`
  - الربط بين السرد الكبير ومنطق النظام.
- `case rules.md`
  - حماية الـ Authoring أثناء كتابة القضايا.
- `case_gameplay_blueprint_template.md`
  - القالب الإجرائي لكتابة قضية قابلة للتحويل.
- `engine_runtime_spec.md`
  - المرجع النهائي للتفاصيل التنفيذية الصارمة.

## 6. إحالات صريحة إلى المرجع النهائي

للتفاصيل التنفيذية الصارمة وحسابات الـ Ticks والـ Safe Mode، المرجع النهائي هو:
- `engine_runtime_spec.md`

للتفاصيل النهائية الخاصة بـ:
- `Tick System`
- `Runtime Validation Layer`
- `Invalid State Policy`
- `Safe Mode`
- `Deterministic Micro-Variation`
- `Diminishing Returns Per Case`
- `Save Versioning & Migration`
- `next_case_rules Runtime Guard`

يجب الرجوع مباشرة إلى:
- `engine_runtime_spec.md`

## 7. قاعدة منع التضارب المرجعي

- إذا وُجد تعارض بين `essentional.md` و`engine_runtime_spec.md`:
  - المرجع النهائي هو `engine_runtime_spec.md`
- هذا الملف يشرح:
  - الصورة الكبرى
  - الترتيب المعماري
  - المسؤوليات
- ولا يعيد تعريف:
  - المعادلات
  - الـ thresholds
  - قواعد الـ Runtime التفصيلية
