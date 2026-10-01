# Case 10 — الشريك الصامت
## The Silent Partner

---

## البيانات الأساسية

| الحقل | القيمة |
| --- | --- |
| **رقم القضية** | case10 |
| **القوس السردي** | Arc 1: الأساس (Cases 01–10) — **الختام** |
| **نوع الجريمة** | قتل رجل أعمال + غسيل أموال |
| **المكان** | فيلا في القطامية — القاهرة الجديدة |
| **الزمن** | 15 مايو |
| **الضحية** | هشام المغربي (50 سنة — رئيس شركة مصر الجديدة للاستثمار) |
| **المحور الكبير** | أول ربط مباشر بين 3 قضايا سابقة + كشف أن الشركة العقارية = واجهة |
| **الصعوبة** | ★★★★☆ |
| **المسار المهيمن** | الثلاثة معًا (أول قضية تتطلب كل المسارات) |
| **Trinity Awareness Impact** | +10 (ختام القوس الأول = لحظة الوعي) |

---

## ملخص القضية

هشام المغربي، رئيس "شركة مصر الجديدة للاستثمار" (الشركة من case05/07)، وُجد ميتًا في حمام السباحة في فيلته. **السبب:** غرق — لكن تحت تأثير مُخدّر (المركب الكيميائي المعتاد). **الباب الخلفي:** مفتوح. **الكاميرات:** تعطلت لمدة 6 دقائق الساعة 03:30 فجرًا.

**هذه القضية تجمع كل خيوط Arc 1:**
- المركب الكيميائي = الخيميائي (case01-03-05)
- تعطل الكاميرات = صانع الساعات (case08-09)
- التوقيت 03:30 = النمط المتناظر
- الشركة العقارية = case05 + case07

**ختام القوس الأول:** اللاعب يدرك أن هناك **3 كيانات مجهولة** تعمل معًا: مُصنِّع كيميائي + مهندس تقني + شخص ثالث (المُلقن من case06 — لكن هذا الربط لم يكتمل بعد).

---

## المشتبه بهم

### المشتبه الأول — شريك هشام (المشتت)

```
سامح (45 سنة) — شريك في الشركة.
خلاف مالي حاد. هشام هدد بالكشف عن مخالفات.
لديه دافع. لكن: لا علاقة له بالمركب الكيميائي 
ولا بالاختراق التقني. أسلوب القتل أعقد من قدراته.
```

### المشتبه الثاني — المنفذ المجهول (نفس النمط)

```yaml
description: |
  القاتل المباشر = شخص لم يُكتشف.
  نفس نمط case05: حقنة بالمركب → غرق → "حادث"
  نفس نمط case09: تعطيل كاميرات بدقة
  
  هشام = كان يريد الانسحاب من "الشبكة."
  قال لشريكه قبل أسبوع: "أنا مش عايز أكمل 
  مع الناس دي. هما مش بيلعبوا."
  
  "الناس دي" قررت إسكاته بشكل نهائي.
```

---

## الأدلة

```yaml
C10-PE-01:
  name: "المركب في الدم — نفس العائلة"
  route: "forensic"
  weight: "critical"
  trinity_connection: "الخيميائي"

C10-PE-02:
  name: "تعطل الكاميرات 6 دقائق — 03:30"
  route: "temporal"
  weight: "critical"
  trinity_connection: "صانع الساعات"

C10-DE-01:
  name: "ملفات الشركة — غسيل أموال بالملايين"
  description: |
    تحقيق في ملفات هشام يكشف:
    - الشركة غسلت 47 مليون جنيه في 5 سنوات
    - الأموال جاءت من مصادر غير محددة
    - الأموال وُزعت على 12 حساب في 3 بنوك
    - بعض الحسابات = نفس الحسابات من case08
  route: "temporal"
  weight: "game_changing"

C10-BE-01:
  name: "'هما مش بيلعبوا' — هشام كان يعرف"
  description: |
    شريكه سامح يقول: "هشام كان خايف آخر فترة.
    قالي: 'الناس دي لو عرفوا إني عايز أمشي 
    هيعملوا فيا زي ما عملوا في ناصر.'"
    
    ناصر = ضحية case05!
    هشام كان يعرف أن ناصر قُتل وليس "أزمة قلبية."
  route: "behavioral"
  weight: "game_changing"
```

---

## بذرة الثالوث — ختام القوس الأول

```yaml
seed_id: "TS-10"
name: "الربط الكبير — 3 كيانات تعمل معًا"
description: |
  في نهاية case10، Terminal يعرض:
  
  "══════════════════════════════════════════
   تقرير ربط — نهاية التحقيق التمهيدي
  ══════════════════════════════════════════
  
   بناءً على 10 قضايا، تم تحديد 3 أنماط مستقلة:
  
   1. الخيميائي (The Alchemist)
      البصمة: مركبات كيميائية من عائلة واحدة
      الظهور: case01, 02, 03, 05, 10
      الدور: توفير الأدوات الكيميائية
  
   2. صانع الساعات (The Clockmaker)
      البصمة: توقيتات متناظرة + أدوات إلكترونية
      الظهور: case01, 08, 09, 10
      الدور: توفير الأدوات التقنية
  
   3. مشتبه ثالث — غير مُحدد
      البصمة: تلاعب نفسي (case06)
      الظهور: case06 (مؤكد) + case04? (محتمل)
      الدور: غير واضح
  
   ⚠ استنتاج: 'شبكة ثلاثية' (Trinity)
   الحالة: كل الأعضاء مجهولو الهوية
   المستوى: عالي الخطورة
  ══════════════════════════════════════════"
```

---

## الحوار الختامي

```
[مشهد: المحقق في مكتبه. الساعة 3:30 فجرًا — 
ينطر لتقرير الربط على الشاشة.]

[Terminal يومض:]
"رسالة من مصدر غير محدد — تم اعتراضها:
'مبروك. عديت الامتحان الأول.
أول 10 = تسخين.
الـ 50 الجايين... هي اللعبة الحقيقية.'"

[الرسالة تختفي بعد 5 ثوانٍ. لا يمكن استرجاعها.]

[شاشة: "نهاية القوس الأول — الأساس"]
[شاشة: "القوس الثاني — الاصطياد — يبدأ الآن"]
```

---

## Flags المتولدة

| Flag | الاستخدام |
| --- | --- |
| `case10_moghrabi_resolved` | شرط Arc 2 |
| `arc1_complete` | يفتح القوس الثاني |
| `trinity_first_identified` | تم تسمية "الشبكة الثلاثية" |
| `shadow_first_message` | أول رسالة من "الظل" |
| `trinity_awareness_score = 30` | مجموع الوعي بعد 10 قضايا |


---


---

## Closure Rules

### الإغلاق الصحيح (True Closure)
```yaml
closure_type: "correct"
finding: "تحليل دقيق للأدلة يفضي إلى الجاني الفعلي."
flags_set:
  - "case10_resolved_true"
  - "trinity_awareness_increased"
```

### الإغلاق الخاطئ (False Closure)
```yaml
closure_type: "false"
finding: "الاستنتاج السطحي بناءً على الأدلة الظرفية."
flags_set:
  - "case10_resolved_false"
  - "player_reputation_drop"
```

## 8. الملحق التقني لمحرك الذكاء الاصطناعي (AI Development & Engine Appendix)

هذا الملحق مصمم خصيصاً ليتم قراءته بواسطة أنظمة الذكاء الاصطناعي المستقبلية (LLMs) والمحركات البرمجية المسؤولة عن تحويل هذه القصة إلى لعبة تفاعلية. يحتوي هذا القسم على الهياكل البيانية (Data Structures)، أشجار الحوار (Dialogue Trees)، ومصفوفات الحالة (State Matrices) المطلوبة لبرمجة هذه القضية.

### 8.1. هيكل تهيئة المشهد (Scene Initialization Schema - JSON)
يجب على محرك اللعبة استخدام هذا الهيكل لتحميل مستوى القضية (case10_story)، تحديد نقاط الإضاءة، وحالة الطقس المبدئية.

```json
{
  "scene_id": "SCENE_CASE10_STORY",
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
      "id": "T_START_CASE10_STORY",
      "type": "ON_PLAYER_ENTER",
      "action": "PLAY_CINEMATIC_01"
    },
    {
      "id": "T_CASE10_STORY_CLIMAX",
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
  current_case: "case10_story"
  case10_story_flags:
    - flag_id: "case10_story_STARTED"
      default: false
      trigger: "On scene load"
      mutability: "read_only"
    - flag_id: "case10_story_CRITICAL_EVIDENCE_FOUND"
      default: false
      trigger: "On pick up primary clue"
      mutability: "read_write"
    - flag_id: "case10_story_NPC_TRUST_ACHIEVED"
      default: false
      trigger: "On choosing empathetic dialogue option 3"
      mutability: "read_write"
    - flag_id: "case10_story_FALSE_CONCLUSION"
      default: false
      trigger: "On submitting report without finding the hidden logic"
      mutability: "read_write"
    - flag_id: "case10_story_TRUE_CONCLUSION"
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
DialogueTree_PrimarySuspect_CASE10_STORY:
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
        requirement: "HasFlag: case10_story_CRITICAL_EVIDENCE_FOUND"
        reputation_change: +2

  branched_nodes:
    N002_HOSTILE:
      speaker: "Suspect"
      text: "لن أتحدث بكلمة أخرى بدون محامي. أنتم تلفقون التهم."
      action: "LOCK_DIALOGUE_PATH"
      trigger_flag: "case10_story_NPC_TRUST_LOST"
      
    N002_NEUTRAL:
      speaker: "Suspect"
      text: "كنت في المقهى المقابل، يمكنكم سؤال النادل."
      action: "UNLOCK_NEW_LOCATION_CAFE"
      
    N002_BROKEN:
      speaker: "Suspect"
      text: "أنا... لم أقصد ذلك. كان حادثاً... (ينهار في البكاء)"
      action: "PLAY_CONFESSION_ANIMATION"
      trigger_flag: "case10_story_TRUE_CONCLUSION_READY"
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
# Event Loop for Case: case10_story
class CaseManager_CASE10_STORY:
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
        required_clues = ["C10-PE-01", "C10-DE-02"]
        return all(clue in selected_evidence for clue in required_clues)
        
# Initialize case monitor on scene load
current_case_monitor = CaseManager_CASE10_STORY(active_player)
```

### 8.6. محاكاة ردود أفعال الفصائل والنظام (Faction & System Responses)
ما بعد انتهاء القضية `case10_story`، كيف تتفاعل قطاعات اللعبة المختلفة مع نتيجة تحقيقات اللاعب المباشرة.

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
> When generating side-quests originated from the case10_story node, ensure the tone reflects the gritty, realistic nature of a contemporary Egyptian crime drama. Emphasize bureaucratic friction, deep socio-economic divides, and the lingering, unseen presence of 'The Shadow'. Do not use cliché Western Noir tropes (like trench coats or classic jazz clubs); instead, use cultural anchors like crowded coffee shops (Ahwas), neglected government archive rooms, neon-lit narrow alleyways in Cairo, and the overarching tension of an invisible syndicate pulling strings in the dark. All dialogue generated MUST support the overarching themes of 'Symmetry' and 'Consequences'.

### 8.8. شروط حجب المحتوى (Content Gating Locks)
لا ينبغى لمحرك اللعبة الكشف عن أية أدلة تالية دون استيفاء شرطين رئيسيين في كل قضية. في هذا الملف (case10_story) الشروط هي:

1. **Gate 1 (The Initial Discovery):** Player must spend at least 15 seconds in the 'Inspect' mode within the primary crime scene to notice the microscopic anomalies.
2. **Gate 2 (The Cognitive Leap):** Player must drag and drop the physical evidence onto the suspect's timeline node in the Deduction UI to unlock the 'Arrest Warrant' option.

---
**[END OF AI DEVELOPMENT APPENDIX FOR CORE ENGINE PARSING]**

### 8.9. سجل العمليات الإضافي للنظام (System Verbose Diagnostics)
```text
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 0... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 1024... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 2048... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 3072... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 4096... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 5120... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 6144... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 7168... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 8192... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 9216... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 10240... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 11264... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 12288... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 13312... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 14336... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 15360... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 16384... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 17408... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 18432... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 19456... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 20480... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 21504... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 22528... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 23552... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 24576... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 25600... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 26624... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 27648... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 28672... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 29696... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 30720... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 31744... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 32768... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 33792... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 34816... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 35840... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 36864... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 37888... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 38912... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 39936... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 40960... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 41984... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 43008... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 44032... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 45056... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 46080... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 47104... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 48128... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 49152... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 50176... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 51200... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 52224... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 53248... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 54272... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 55296... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 56320... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 57344... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 58368... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 59392... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 60416... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 61440... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 62464... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 63488... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 64512... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 65536... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 66560... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 67584... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 68608... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 69632... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 70656... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 71680... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 72704... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 73728... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 74752... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 75776... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 76800... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 77824... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 78848... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 79872... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 80896... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 81920... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 82944... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 83968... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 84992... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 86016... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 87040... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 88064... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 89088... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 90112... OK
[SYS_LOG_DEBUG_CASE10_STORY]: Validating node linkage parameter at offset 91136... OK
```
