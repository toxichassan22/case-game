# Case 38 — الوعد
## The Promise

---

## البيانات الأساسية (Case Metadata)

| الحقل | القيمة |
| --- | --- |
| **رقم القضية** | case38 |
| **القوس السردي** | Arc 4: الانكشاف (Cases 31–40) |
| **نوع الجريمة** | اختطاف ابن اللاعب/شخص قريب من اللاعب |
| **المكان** | القاهرة — عدة مواقع |
| **الزمن** | 29 نوفمبر |
| **الضحية** | شخص قريب من المحقق (NPC متكرر — يحدده النظام حسب تفاعلات اللاعب) |
| **المحور الكبير** | الثالوث يهاجم اللاعب شخصيًا — أول تهديد مباشر لحياته الخاصة |
| **الصعوبة** | ★★★★★ |
| **المسار المهيمن** | الزمني (مطاردة بالوقت) |
| **Trinity Awareness Impact** | +10 |

---

## ملخص القضية (Case Synopsis)

**الثالوث يرد على القبض على الخيميائي (case36).** شخص قريب من المحقق — يمكن أن يكون:
- سمر المنصوري (ابنة ضحية case03 — إذا بنى علاقة معها)
- القاضي عصام فهمي (من case25 — إذا أصبح حليفًا)
- الممرضة سهام (من case03 — إذا ساعدها)

**المختطف يُحتجز في مكان مجهول.** اللاعب يتلقى رسالة:

> "مسكت واحد مننا. إحنا هناخد واحد منك.
> عندك 12 ساعة. الساعة بتحسب."

**هذه القضية = countdown. 12 ساعة حقيقية في اللعبة.** كل خطوة تحقيقية = تمر ساعة. إذا لم ينقذ الضحية في 12 خطوة — يموت.

---

## مسرح الجريمة — رحلة بين الأماكن

### المكان الأول: شقة الضحية (نقطة الاختطاف)

```
- باب مفتوح. لا علامات اقتحام عنيفة (الباب فُتح بمفتاح مُقلّد)
- كرسي مقلوب في غرفة المعيشة
- كوب شاي مكسور على الأرض
- هاتف الضحية على الأرض — آخر مكالمة: رقم مجهول (قبل 20 دقيقة من الاكتشاف)
- ملحوظة على الطاولة (بطاقة مطبوعة):
  "المحطة الأولى: حيث بدأ كل شيء."
  ← تلميح: البداية = case01 = المكتبة المحترقة في حلوان
```

### المكان الثاني: المكتبة المحترقة (case01 — إعادة زيارة)

```
- المكتبة لا تزال مهجورة (لم يُعد بناؤها)
- داخلها: بطاقة ثانية على الأرض:
  "المحطة الثانية: حيث سمعت الصوت لأول مرة."
  ← تلميح: الصوت = case06 = شقة يوسف في الزمالك
```

### المكان الثالث: شقة يوسف القديمة (case06 — إعادة زيارة)

```
- الشقة مؤجرة لشخص جديد. لكن على الباب: بطاقة ثالثة:
  "المحطة الأخيرة: حيث سيكسر التماثل.
  العنوان: [إحداثيات GPS]"
  ← مبنى مهجور في حلوان
```

### المكان الرابع: المبنى المهجور — مكان الاحتجاز

```
- مبنى صناعي مهجور. 3 طوابق.
- الضحية في الطابق الثاني — مقيدة/مقيد على كرسي
- حراسة: شخصان مسلحان (مجرمون محليون — أُجروا)
- **لا فخاخ.** الثالوث لم يكن ينوي القتل فعلاً — بل الرسالة.
- على الحائط أمام الضحية: "الساعة عمرها ما بتأخر."
```

---

## الضحية (تختلف حسب أداء اللاعب)

### السيناريو A: سمر المنصوري

```yaml
condition: "اللاعب بنى علاقة مع سمر بعد case03"
victim_profile: |
  سمر (40 سنة). ابنة حسن المنصوري (ضحية case03).
  بعد إدانة عادل في case03، سمر أصبحت "حليفة" 
  غير رسمية — تتابع التحقيق وتسأل عن التطورات.
  
  اختطافها = رسالة: "كل من يقترب منك يتأذى."

dialogue_if_rescued: |
  سمر: *مرتعشة* "مكنتش خايفة على نفسي. 
  كنت خايفة إنك تيجي وتلاقيني... زي أبويا."
  
  المحقق: ...
  
  سمر: "بس إنت جيت. وده يكفيني."
```

### السيناريو B: القاضي فهمي

```yaml
condition: "القاضي أصبح حليفًا بعد case25"
victim_profile: |
  القاضي (58 سنة). رفض ابتزاز الثالوث في case25.
  كان يساعد اللاعب بتسهيل أوامر قضائية.
  
  اختطافه = رسالة: "حتى القضاء مش آمن."

dialogue_if_rescued: |
  القاضي: *بهدوء مدهش* "أنا ما خفتش منهم 
  لما هددوني في case25. ومش هخاف دلوقتي. 
  بس أنا قلقان... عليك. هما مش بيلعبوا."
```

---

## المشتبه بهم

### المنفذون — مجرمون محليون

```yaml
executor_1:
  name: "عماد"
  age: 30
  description: "مسجل خطر. تلقى 20,000 جنيه. لا يعرف من يعمل له."
  
executor_2:
  name: "شريف"
  age: 27
  description: "مسجل خطر. نفس القصة."

interrogation: |
  عماد: "واحد اتصل بينا. قال وديه المكان ده 
  واقعدوا معاه لحد ما حد يجي. 
  لو حد سأل، قولوا أنتوا مش عارفين حاجة."
  
  المحقق: الرقم؟
  
  عماد: "اتمسح. الرسالة كانت على تيليجرام. 
  الحساب اتمسح. زي كل مرة."
```

---

## الأدلة (Evidence Catalog)

### أدلة مادية

```yaml
C38-PE-01:
  evidence_id: "C38-PE-01"
  type: "physical"
  name: "البطاقات الثلاث — مسار الصيد"
  location: "3 مواقع مختلفة"
  description: |
    3 بطاقات مطبوعة. نفس نوع الورق. نفس الطباعة.
    كل بطاقة تقود للمكان التالي.
    المسار = مسار اللاعب في القضايا (case01 → case06).
    الثالوث يعرف كل خطوة سار فيها اللاعب.
    هذا يؤكد case17 (backdoor): يقرأون ملفه.
  route: "forensic"
  weight: "critical"

C38-PE-02:
  evidence_id: "C38-PE-02"
  type: "physical"
  name: "'الساعة عمرها ما بتأخر' — على الحائط"
  location: "المبنى المهجور"
  description: |
    عبارة صانع الساعات. رغم غياب 
    الخيميائي (مقبوض عليه)، صانع الساعات 
    والمُلقن لا يزالان يعملان.
  route: "behavioral"
  weight: "supporting"
  trinity_connection: "صانع الساعات"

C38-PE-03:
  evidence_id: "C38-PE-03"
  type: "physical"
  name: "المفتاح المُقلّد — من أين؟"
  location: "شقة الضحية"
  description: |
    الباب فُتح بمفتاح. لم يُكسر.
    المفتاح مُقلّد = شخص حصل على نسخة.
    كيف؟ عبر backdoor case17 = 
    صانع الساعات حصل على عنوان الضحية 
    من ملفات الوزارة + أرسل شخصًا لنسخ المفتاح.
  route: "forensic"
  weight: "critical"
```

### أدلة رقمية

```yaml
C38-DE-01:
  evidence_id: "C38-DE-01"
  type: "digital"
  name: "رسالة الـ 12 ساعة"
  description: |
    الرسالة وصلت عبر Terminal (= صانع الساعات 
    يستخدم backdoor للتواصل عبر النظام نفسه).
    "مسكت واحد مننا. إحنا هناخد واحد منك. 
    عندك 12 ساعة."
    
    المؤقت = حقيقي. يعد تنازليًا على الشاشة.
  route: "temporal"
  weight: "game_changing"

C38-DE-02:
  evidence_id: "C38-DE-02"
  type: "digital"
  name: "إحداثيات GPS في البطاقة الأخيرة"
  description: |
    الإحداثيات تقود للمبنى المهجور.
    تحقق: المبنى مملوك لشركة... 
    "مصر الجديدة للاستثمار" (الشركة من case05/10).
    حتى بعد موت المغربي (case10)، 
    الشركة لا تزال تُستخدم قانونيًا.
  route: "temporal"
  weight: "critical"
```

### أدلة سلوكية

```yaml
C38-BE-01:
  evidence_id: "C38-BE-01"
  type: "behavioral"
  name: "المسار = إعادة لمسار اللاعب"
  description: |
    البطاقات تقود اللاعب لمواقع من قضاياه السابقة.
    الرسالة: "إحنا نعرف كل حاجة عنك."
    
    لكن أيضًا: الرسالة تكشف ما يعرفه الثالوث — 
    وما لا يعرفه. لو اللاعب حل case01 بشكل 
    مختلف (مسار بديل) = البطاقة ستكون مختلفة.
    هذا يعني: الثالوث يعرف مساره الفعلي — 
    = يقرأون تقارير التحقيق.
  route: "behavioral"
  weight: "game_changing"
```

---

## مسارات التحقيق

### المسار السريع (6 خطوات = 6 ساعات)

```yaml
fast_path:
  step_1: "اذهب لشقة الضحية → اقرأ البطاقة الأولى"
  step_2: "اذهب للمكتبة (case01) → البطاقة الثانية"
  step_3: "اذهب لشقة يوسف (case06) → البطاقة الثالثة + GPS"
  step_4: "اذهب للمبنى المهجور"
  step_5: "مواجهة الحراس (عنف أو تفاوض)"
  step_6: "إنقاذ الضحية"
  result: "نجاح — 6 ساعات متبقية"
```

### المسار الدقيق (10 خطوات = 10 ساعات)

```yaml
thorough_path:
  step_1-6: "نفس المسار السريع"
  step_7: "تحقيق في البطاقات (بصمات، نوع الورق)"
  step_8: "تحقيق في المبنى (مملوك لشركة case05)"
  step_9: "استجواب الحراس"
  step_10: "تتبع حساب التيليجرام (محاولة)"
  result: "نجاح — 2 ساعات متبقية (ضيق)"
```

### الفشل (12+ خطوة)

```yaml
failure:
  condition: "اللاعب ضيّع وقتًا في تحقيقات جانبية"
  result: |
    الضحية تموت. الحراس يهربون.
    رسالة على الحائط: "الساعة ما بتأخرش. وإنت اتأخرت."
    
    هذا = أقسى عقوبة في اللعبة.
    الضحية التي بنيت معها علاقة = ماتت بسببك.
  flags: "case38_hostage_dead"
```

---

## بذرة الثالوث

```yaml
seed_id: "TS-38"
description: |
  الثالوث يرد:
  - القبض على الخيميائي (case36) أغضبهم
  - اختطاف شخص قريب من اللاعب = رد شخصي
  - الرسالة: "واحد مقابل واحد"
  
  لكن: الثالوث لم يقتل فورًا. أعطى 12 ساعة.
  لماذا؟ لأنهم يختبرون اللاعب.
  المُلقن يريد أن يرى: كيف يتصرف تحت الضغط؟
  
  "إنت بتتقيّم" (من case36) = هذا هو التقييم.
  
carryover: true
links_to: "المُلقن يختبر اللاعب"
```

---

## NPCs الثانويون

### أخو إبراهيم (من case37 — الافتتاحية)
```
"أخوي مات بسبب 'أستاذ وليد.' 
وأنا سمعت إنك بتحقق. 
ربنا يقويك... وتوصل للراجل ده قبل ما يموّت حد تاني."
```

---

## Closure Rules

```yaml
success_closure:
  condition: "اللاعب أنقذ الضحية في أقل من 12 ساعة"
  flags_set:
    - "case38_hostage_saved"
    - "case38_correct_closure"
    - "trinity_retaliation_survived"
    - "player_under_direct_threat"

failure_closure:
  condition: "اللاعب لم ينقذ الضحية"
  flags_set:
    - "case38_hostage_dead"
    - "case38_failure"
    - "player_guilt_deep"
```

---

## الحوار الختامي

### إذا نجح:

```
[الضحية تُحرر. تُحضن المحقق.]

الضحية: *بصوت مرتعش* "كنت عارف/ة إنك هتيجي."

المحقق: *ينظر لعبارة الحائط: "الساعة عمرها ما بتأخر."*

[Terminal:]
"رسالة من مصدر غير محدد:
'عاش. المرة الجاية... مش هنديك وقت.'"

[المؤقت يتوقف. الصمت يملأ المكان.]
```

### إذا فشل:

```
[المحقق يصل متأخرًا. الضحية... فارقت الحياة.]

[على الحائط:]
"الساعة ما بتأخرش. وإنت اتأخرت."

[Terminal:]
"⚠ خسارة شخصية. التقرير: فشل في الحماية.
هذا الفشل سيُسجَّل في ملفك.
وسيُذكر في case51 و case59."

[صمت. 15 ثانية.]
```

---

## Flags المتولدة

| Flag | الشرط | الاستخدام اللاحق |
| --- | --- | --- |
| `case38_hostage_saved` | نجاح | يؤثر على case51 + case59 |
| `case38_hostage_dead` | فشل | يؤثر بشكل مدمر على case51 + case59 |
| `trinity_retaliation_survived` | نجاح | الثالوث يعترف بقوة اللاعب |
| `player_under_direct_threat` | دائمًا | اللاعب هدف شخصي الآن |

---

## ملاحظات تصميمية

1. **هذه القضية = أعلى توتر في Arc 4.** المؤقت الحقيقي يجبر اللاعب على اتخاذ قرارات سريعة = أخطاء ممكنة = ندم.

2. **البطاقات = nostalgia weaponized.** الثالوث يأخذ اللاعب في رحلة عبر قضاياه السابقة = "نحن نعرف كل شيء."

3. **اختيار الضحية حسب أداء اللاعب = أقسى تصميم.** لأن اللاعب يفقد الشخص الذي بنى معه أقوى علاقة.

4. **إذا فشل = لن ينساها أبدًا.** وcase51 سيذكره بالفشل.


---

## 8. الملحق التقني لمحرك الذكاء الاصطناعي (AI Development & Engine Appendix)

هذا الملحق مصمم خصيصاً ليتم قراءته بواسطة أنظمة الذكاء الاصطناعي المستقبلية (LLMs) والمحركات البرمجية المسؤولة عن تحويل هذه القصة إلى لعبة تفاعلية. يحتوي هذا القسم على الهياكل البيانية (Data Structures)، أشجار الحوار (Dialogue Trees)، ومصفوفات الحالة (State Matrices) المطلوبة لبرمجة هذه القضية.

### 8.1. هيكل تهيئة المشهد (Scene Initialization Schema - JSON)
يجب على محرك اللعبة استخدام هذا الهيكل لتحميل مستوى القضية (case38_story)، تحديد نقاط الإضاءة، وحالة الطقس المبدئية.

```json
{
  "scene_id": "SCENE_CASE38_STORY",
  "scene_type": "INVESTIGATION_NODE",
  "environment": {
    "base_lighting": "LOW_KEY",
    "volumetric_fog": {
      "enabled": true,
      "density": 0.35,
      "color": "#1a1a1a"
    },
    "weather_system": {
      "active_preset": "DYNAMIC_RAIN",
      "intensity": 0.8,
      "audio_track": "rain_heavy_loop_01.wav"
    },
    "camera_settings": {
      "default_fov": 75,
      "depth_of_field": true,
      "focal_length": 35.0
    }
  },
  "nav_mesh": {
    "generate_on_load": true,
    "restricted_zones": ["EVIDENCE_TAPE_AREA"]
  },
  "triggers": [
    {
      "id": "T_START_CASE38_STORY",
      "type": "ON_PLAYER_ENTER",
      "action": "PLAY_CINEMATIC_01"
    },
    {
      "id": "T_CASE38_STORY_CLIMAX",
      "type": "ON_EVIDENCE_COLLECTED_ALL",
      "action": "UNLOCK_INTERROGATION_ROOM"
    }
  ]
}
```

### 8.2. مصفوفة تتبع المتغيرات (Global Flags & State Matrix)
يتم تحديث هذه المتغيرات أثناء لعب القضية. يجب تخزينها في الـ `SaveData` الخاص باللاعب والتأكد من نقلها للقضايا اللاحقة لتفعيل نظام العواقب (Consequence System).

```yaml
GameStateTracker:
  current_case: "case38_story"
  case38_story_flags:
    - flag_id: "case38_story_STARTED"
      default: false
      trigger: "On scene load"
      mutability: "read_only"
    - flag_id: "case38_story_CRITICAL_EVIDENCE_FOUND"
      default: false
      trigger: "On pick up primary clue"
      mutability: "read_write"
    - flag_id: "case38_story_NPC_TRUST_ACHIEVED"
      default: false
      trigger: "On choosing empathetic dialogue option 3"
      mutability: "read_write"
    - flag_id: "case38_story_FALSE_CONCLUSION"
      default: false
      trigger: "On submitting report without finding the hidden logic"
      mutability: "read_write"
    - flag_id: "case38_story_TRUE_CONCLUSION"
      default: false
      trigger: "On successfully linking all clues to the primary suspect"
      mutability: "read_write"
  
  trinity_system_impact:
    awareness_increment: 2
    shadow_interference_level: "MEDIUM"
    clockmaker_digital_traces: true
    alchemist_chemical_traces: false
```

### 8.3. شجرة الحوار التفاعلية (Dialogue Tree Graph - YAML)
لتحقيق تفرع المحادثات، يجب على الـ AI بناء عقد (Nodes) متصلة بهذه الطريقة لكل شخصية داخل هذه القضية.

```yaml
DialogueTree_PrimarySuspect_CASE38_STORY:
  root_node:
    id: "N001"
    speaker: "Detective"
    text: "أين كنت في ليلة وقوع الحادث؟ لقد راجعنا كافة السجلات ولم نجد ما يثبت كلامك."
    options:
      - id: "OPT_1"
        text: "[الضغط بقوة] لا تكذب، لدينا شهود."
        next_node: "N002_HOSTILE"
        requirement: None
        reputation_change: -1
      - id: "OPT_2"
        text: "[الاستجواب المنهجي] صف لي تحركاتك مرة أخرى، خطوة بخطوة."
        next_node: "N002_NEUTRAL"
        requirement: None
        reputation_change: 0
      - id: "OPT_3"
        text: "[استخدام الدليل المادي] كيف تفسر وجود بصماتك هنا؟ (إبراز الدليل)"
        next_node: "N002_BROKEN"
        requirement: "HasFlag: case38_story_CRITICAL_EVIDENCE_FOUND"
        reputation_change: +2

  branched_nodes:
    N002_HOSTILE:
      speaker: "Suspect"
      text: "لن أتحدث بكلمة أخرى بدون محامي. أنتم تلفقون التهم."
      action: "LOCK_DIALOGUE_PATH"
      trigger_flag: "case38_story_NPC_TRUST_LOST"
      
    N002_NEUTRAL:
      speaker: "Suspect"
      text: "كنت في المقهى المقابل، يمكنكم سؤال النادل."
      action: "UNLOCK_NEW_LOCATION_CAFE"
      
    N002_BROKEN:
      speaker: "Suspect"
      text: "أنا... لم أقصد ذلك. كان حادثاً... (ينهار في البكاء)"
      action: "PLAY_CONFESSION_ANIMATION"
      trigger_flag: "case38_story_TRUE_CONCLUSION_READY"
```

### 8.4. تعريف عناصر مسرح الجريمة (Inventory & Interactive Entities)
يتم إنشاء الأشياء القابلة للتفاعل ككائنات (Objects) تتمتع بخصائص فيزيائية ووصفية.

```json
{
  "entities": [
    {
      "entity_id": "OBJ_BLOOD_SPLATTER_01",
      "type": "FORENSIC_DECAL",
      "interaction_prompt": "قم بجمع عينة دماء (تتطلب قطنة معقمة)",
      "script_on_interact": "func_analyze_blood(self.id)",
      "is_destructible": false,
      "hidden_info": "يكشف التحليل عن وجود سم معدل جينيا."
    },
    {
      "entity_id": "OBJ_SUSPECT_PHONE",
      "type": "INTERACTABLE_PROP",
      "interaction_prompt": "تصفح الهاتف المتروك",
      "script_on_interact": "func_open_phone_ui()",
      "is_destructible": true,
      "hidden_info": "يحتوي على رسائل مشفرة يجب كسرها لاحقا باستخدام محطة اختراق."
    },
    {
      "entity_id": "LOC_LOCKED_DOOR",
      "type": "ENVIRONMENTAL_PUZZLE",
      "interaction_prompt": "حاول فتح الباب (مقفل من الداخل)",
      "script_on_interact": "func_check_key_or_lockpick()",
      "is_destructible": true,
      "hidden_info": "يتطلب مهارة Lockpicking مستوى 3 للعبور بسلام."
    }
  ]
}
```

### 8.5. نظام البرمجة النصية للأحداث (Pseudocode Event Triggers)
الخوارزمية المبدئية التي تحكم تسلسل الحل والانتقال بين المراحل داخل هذه القضية الخاصة.

```python
# Event Loop for Case: case38_story
class CaseManager_CASE38_STORY:
    def __init__(self, player):
        self.player = player
        self.evidence_collected = 0
        self.suspects_interrogated = 0
        self.case_status = "OPEN"
        
    def on_evidence_found(self, evidence_id):
        self.evidence_collected += 1
        ui.display_notification(f"Evidence {evidence_id} logged.")
        if self.evidence_collected >= 3:
            self.unlock_deduction_board()
            
    def unlock_deduction_board(self):
        ui.enable_tab("DEDUCTION")
        audio.play_sfx("chime_clue_complete.wav")
        # Player can now attempt to link clues together
        
    def submit_final_report(self, selected_suspect, selected_evidence):
        if selected_suspect == self.get_true_suspect() and self.validate_evidence(selected_evidence):
            self.case_status = "CLOSED_SUCCESS"
            self.grant_rewards(exp=1500, rep=10)
            game_manager.advance_story_arc()
        else:
            self.case_status = "CLOSED_FAILED"
            self.grant_rewards(exp=500, rep=-15)
            game_manager.trigger_negative_consequence()
            
    def get_true_suspect(self):
        # Hidden logic that absolute truth relies on
        return "PRIMARY_TARGET_ID"
        
    def validate_evidence(self, selected_evidence):
        required_clues = ["C38-PE-01", "C38-DE-02"]
        return all(clue in selected_evidence for clue in required_clues)
        
# Initialize case monitor on scene load
current_case_monitor = CaseManager_CASE38_STORY(active_player)
```

### 8.6. محاكاة ردود أفعال الفصائل والنظام (Faction & System Responses)
ما بعد انتهاء القضية `case38_story`، كيف تتفاعل قطاعات اللعبة المختلفة مع نتيجة تحقيقات اللاعب المباشرة.

```yaml
FactionReactions:
  Police_Department:
    on_success: "إشادة من اللواء وزيادة ميزانية الفريق."
    on_failure: "توبيخ رسمي وتقليل النقاط المتاحة لطلب موارد المعمل الجنائي."
  
  Underworld_Informants:
    on_success: "ارتفاع أسعار المعلومات (اللاعب يبدو ناجحاً ويمكن استغلاله)."
    on_failure: "المصادر تخفي نفسها (لا يثقون في قدرة اللاعب على حمايتهم)."

  Trinity_Syndicate:
    on_success: "الثالوث يغير تكتيكاته في الجرائم القادمة المماثلة لتفادي الوقوع في نفس الخطأ."
    on_failure: "الثالوث يزداد جرأة، مما يفتح أحداثاً جانبية عشوائية (Random Encounters) في شوارع العاصمة."
```

### 8.7. الموجهات السردية لمولد القصص (Narrative Engine Prompt Injection)
تعليمات مباشرة للـ GenAI الذي سيقوم بصياغة النصوص الإضافية للمهمات الجانبية المتفرعة من هذه القضية بالذات:

> [SYSTEM DIRECTIVE TO LLM ENGINE]
> When generating side-quests originated from the case38_story node, ensure the tone reflects the gritty, realistic nature of a contemporary Egyptian crime drama. Emphasize bureaucratic friction, deep socio-economic divides, and the lingering, unseen presence of 'The Shadow'. Do not use cliché Western Noir tropes (like trench coats or classic jazz clubs); instead, use cultural anchors like crowded coffee shops (Ahwas), neglected government archive rooms, neon-lit narrow alleyways in Cairo, and the overarching tension of an invisible syndicate pulling strings in the dark. All dialogue generated MUST support the overarching themes of 'Symmetry' and 'Consequences'.

### 8.8. شروط حجب المحتوى (Content Gating Locks)
لا ينبغى لمحرك اللعبة الكشف عن أية أدلة تالية دون استيفاء شرطين رئيسيين في كل قضية. في هذا الملف (case38_story) الشروط هي:

1. **Gate 1 (The Initial Discovery):** Player must spend at least 15 seconds in the 'Inspect' mode within the primary crime scene to notice the microscopic anomalies.
2. **Gate 2 (The Cognitive Leap):** Player must drag and drop the physical evidence onto the suspect's timeline node in the Deduction UI to unlock the 'Arrest Warrant' option.

---
**[END OF AI DEVELOPMENT APPENDIX FOR CORE ENGINE PARSING]**
