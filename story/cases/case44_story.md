# Case 44 — الاسم الأخير ⚡⚡
## The Last Name

---

## البيانات الأساسية (Case Metadata)

| الحقل | القيمة |
| --- | --- |
| **رقم القضية** | case44 |
| **القوس السردي** | Arc 5: المواجهة (Cases 41–50) — **اللحظة الأعظم** |
| **نوع الجريمة** | كشف هوية المُلقن |
| **المكان** | مستشفى العباسية للصحة النفسية |
| **الزمن** | 10 يناير |
| **المحور الكبير** | الثالوث يكتمل — المُلقن يُكشف |
| **الصعوبة** | ★★★★★ |
| **المسار المهيمن** | السلوكي (تحليل نفسي عكسي) |
| **Trinity Awareness Impact** | +25 (ذروة) |

---

## ملخص القضية (Case Synopsis)

كل الخيوط تتجمع. كل carryover يعود. **اللاعب يعرف أخيرًا من هو المُلقن.**

**التجميع:**
- case13: "مؤسسة صحية/نفسية"
- case23: "مستشفى أو جامعة — يعمل رسميًا"
- case31: "مستشفى نفسي حكومي"
- case33: تسجيل صوتي 30 ثانية
- case37: تسجيل صوتي 12 دقيقة (voice match 78%)
- case42: "د. يح____" في مستشفى العباسية

**الخطوة الأخيرة:** مقارنة voice print مع أصوات 3 أطباء اسمهم يبدأ بـ "يح" في القسم:
1. د. يحيى عمران (48 سنة — رئيس وحدة العلاج المعرفي)
2. د. يحسن فؤاد (39 سنة — طبيب مقيم)
3. د. يحفظ نادر (55 سنة — استشاري متقاعد جزئيًا)

**النتيجة:** Voice print يتطابق 97% مع... **د. يحيى عمران.**

---

## المُلقن — الكشف الكامل

```yaml
real_identity:
  name: "د. يحيى عمران"
  age: 48
  education: |
    - بكالوريوس طب — جامعة القاهرة
    - ماجستير طب نفسي — جامعة عين شمس
    - دكتوراه في العلاج المعرفي السلوكي (CBT)
    - زمالة في جامعة لندن (سنتين)
  career: |
    - رئيس وحدة العلاج المعرفي — مستشفى العباسية
    - أستاذ مساعد — كلية الطب، جامعة عين شمس
    - 20+ بحث منشور عن "التلاعب المعرفي"
    - مستشار في 3 محاكم (تقييم نفسي للمتهمين)
  appearance: |
    متوسط الطول. وجه ودود. ابتسامة دائمة.
    يرتدي بدلة رمادية أنيقة. نظارة مستطيلة.
    صوت هادئ جدًا — "بيريّح" حسب زملائه.
    "أطيب دكتور في المستشفى" — هذا ما يقوله الجميع.
  
  personality: |
    د. يحيى = أكثر شخصية مرعبة في اللعبة.
    لأنه يبدو طبيعيًا تمامًا.
    
    فلسفته:
    "التماثل" = الحالة الطبيعية البشرية 
    (الخوف، الضمير، التردد، الألم).
    هذه الأشياء = "أقنعة" تمنع الناس من 
    أن يكونوا "حقيقيين."
    
    "كسر التماثل" = إزالة هذه الأقنعة.
    ما تحتها = "الإنسان الحقيقي."
    بعض الناس تحت القناع = عنيفون.
    بعضهم = يائسون.
    بعضهم = فارغون.
    
    المُلقن لا يصنع العنف — بل يكشفه.
    (هكذا يرى نفسه)
    
    "أنا مش بقتل. أنا بس بشيل الغطاء. 
    اللي تحته = مش مسؤوليتي."
    
  the_shadow_reveal: |
    ⚠ المفاجأة الأكبر:
    
    "الظل" من case26 = د. يحيى نفسه.
    
    الرسائل التي أرسلها للاعب عبر Terminal = 
    كانت منه. كل رسالة = تقييم.
    
    "بُص وراك" = كان يحذره من المخترق (case30) 
    لأنه أراد أن يستمر التحقيق = أراد أن يرى 
    كيف سيتصرف اللاعب تحت الضغط.
    
    "إنت بتتقيّم" (كلام الخيميائي في case36) = 
    حرفيًا. المُلقن يقيّم اللاعب.
    
    لماذا؟ لأنه يرى في اللاعب "قناعًا" أيضًا.
    ويريد أن يكسره.
    
    "اللاعب = آخر تجربة للمُلقن."
```

---

## المواجهة

```yaml
confrontation: |
  المحقق يذهب لمكتب د. يحيى في العباسية.
  يطرق الباب. يفتح.
  
  د. يحيى يجلس خلف مكتبه. يبتسم.
  
  يحيى: "أهلاً. كنت مستنيك."
  
  [نفس الجملة قالها الخيميائي في case36.
  ونفس الجملة قالها طارق الأنصاري في case29.
  = الثلاثة كانوا يعرفون أن اللاعب قادم.]

interrogation_full: |
  المحقق: د. يحيى عمران. أنا عارف مين إنت.
  
  يحيى: *يبتسم بصدق* "عرفت. 
  كنت عارف إنك هتعرف. 
  السؤال مكنش 'هل' — بل 'إمتى.'"
  
  المحقق: إنت المُلقن. إنت 'أستاذ وليد.'
  إنت قتلت يوسف (case06) ومحمد وعيلته (case12) 
  ود. ليلى (case23) و3 في الأقصر (case37).
  
  يحيى: *ينحني للأمام* "أنا ما قتلتش حد. 
  أنا اتكلمت. الكلام ما بيقتلش.
  اللي قتل نفسه... أو عيلته... 
  ده قراره. أنا بس ساعدته يوصل لحقيقته."
  
  المحقق: "حقيقته"؟! إنت دمرت ناس!
  
  يحيى: *بهدوء مطلق* "أنا كشفت ناس. 
  التماثل وهم. الإنسان العادي = قناع.
  تحت القناع = حقيقة. بعض الحقائق... قبيحة.
  أنا مش مسؤول عن القبح. أنا بس رفعت الغطا."
  
  المحقق: والظل؟ الرسائل اللي بعتّها لي؟
  
  يحيى: *يبتسم أوسع* "آه. الرسائل. 
  كنت بقيّمك. كنت عايز أشوف: 
  هل إنت زي الباقيين؟ 
  ولا تحت القناع بتاعك... في حاجة مختلفة؟"
  
  المحقق: وإيه اللي لقيته؟
  
  يحيى: *يميل للخلف* (صمت 5 ثوانٍ)
  "لقيت إنك... مش عارف نفسك لسه. 
  بس قريب. قريب أوي.
  
  عشان كده أنا مش هقاوم. مش هسيب. 
  مش هغير حاجة. أنا هدخل السجن.
  
  بس أنا عارف حاجة واحدة:
  الكلام اللي قلتهولك... 
  في الرسائل... في القضايا...
  لسه في دماغك. ومش هيطلع.
  
  عشان كده... أنا كسبت."
  
  [صمت. 10 ثوانٍ.]
  
  المحقق: *يقيده* "إنت مالكش حق تقول كده."
  
  يحيى: *وهو يُقاد للخارج* "مش أنا اللي قال. 
  إنت اللي سمع."
```

---

## بذرة الثالوث — الثالوث يكتمل

```yaml
seed_id: "TS-44"
description: |
  Terminal:
  "══════════════════════════════════════════
   ⚡ الثالوث — مكتمل
  ══════════════════════════════════════════
  
   الخيميائي: محمد عادل السيسي — مقبوض ✓
   صانع الساعات: رامي حسن الشاذلي — مكشوف/هارب ⚠
   المُلقن: د. يحيى عمران — مقبوض ✓
   
   الظل = المُلقن (مؤكد)
   
   الحالة: 2 مقبوضين. 1 هارب.
   الشبكة: تتفكك.
   
   ⚠ سؤال مفتوح:
   هل المُلقن توقف... أم أن كلماته لا تزال 
   تعمل في عقول من سمعها؟
  ══════════════════════════════════════════"
```

---

## Flags

| Flag | الاستخدام |
| --- | --- |
| `case44_whisperer_captured` | لحظة فارقة |
| `trinity_complete` | كل الأسماء مكشوفة |
| `shadow_is_whisperer` | الظل = المُلقن |
| `player_evaluation_revealed` | اللاعب كان "تجربة" |
| `whisperer_words_linger` | كلماته لا تزال تعمل |


---


---

## الأدلة (Evidence Catalog)

### أدلة مادية (Physical Evidence)
```yaml
44-PE-01:
  evidence_id: "44-PE-01"
  type: "physical"
  name: "دليل فيزيائي متعلق بمسرح الجريمة"
  weight: "critical"
```

### أدلة رقمية (Digital Evidence)
```yaml
44-DE-01:
  evidence_id: "44-DE-01"
  type: "digital"
  name: "سجلات اتصالات الضحية"
  weight: "supporting"
```


---

## Closure Rules

### الإغلاق الصحيح (True Closure)
```yaml
closure_type: "correct"
finding: "تحليل دقيق للأدلة يفضي إلى الجاني الفعلي."
flags_set:
  - "case44_resolved_true"
  - "trinity_awareness_increased"
```

### الإغلاق الخاطئ (False Closure)
```yaml
closure_type: "false"
finding: "الاستنتاج السطحي بناءً على الأدلة الظرفية."
flags_set:
  - "case44_resolved_false"
  - "player_reputation_drop"
```

## 8. الملحق التقني لمحرك الذكاء الاصطناعي (AI Development & Engine Appendix)

هذا الملحق مصمم خصيصاً ليتم قراءته بواسطة أنظمة الذكاء الاصطناعي المستقبلية (LLMs) والمحركات البرمجية المسؤولة عن تحويل هذه القصة إلى لعبة تفاعلية. يحتوي هذا القسم على الهياكل البيانية (Data Structures)، أشجار الحوار (Dialogue Trees)، ومصفوفات الحالة (State Matrices) المطلوبة لبرمجة هذه القضية.

### 8.1. هيكل تهيئة المشهد (Scene Initialization Schema - JSON)
يجب على محرك اللعبة استخدام هذا الهيكل لتحميل مستوى القضية (case44_story)، تحديد نقاط الإضاءة، وحالة الطقس المبدئية.

```json
{
  "scene_id": "SCENE_CASE44_STORY",
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
      "id": "T_START_CASE44_STORY",
      "type": "ON_PLAYER_ENTER",
      "action": "PLAY_CINEMATIC_01"
    },
    {
      "id": "T_CASE44_STORY_CLIMAX",
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
  current_case: "case44_story"
  case44_story_flags:
    - flag_id: "case44_story_STARTED"
      default: false
      trigger: "On scene load"
      mutability: "read_only"
    - flag_id: "case44_story_CRITICAL_EVIDENCE_FOUND"
      default: false
      trigger: "On pick up primary clue"
      mutability: "read_write"
    - flag_id: "case44_story_NPC_TRUST_ACHIEVED"
      default: false
      trigger: "On choosing empathetic dialogue option 3"
      mutability: "read_write"
    - flag_id: "case44_story_FALSE_CONCLUSION"
      default: false
      trigger: "On submitting report without finding the hidden logic"
      mutability: "read_write"
    - flag_id: "case44_story_TRUE_CONCLUSION"
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
DialogueTree_PrimarySuspect_CASE44_STORY:
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
        requirement: "HasFlag: case44_story_CRITICAL_EVIDENCE_FOUND"
        reputation_change: +2

  branched_nodes:
    N002_HOSTILE:
      speaker: "Suspect"
      text: "لن أتحدث بكلمة أخرى بدون محامي. أنتم تلفقون التهم."
      action: "LOCK_DIALOGUE_PATH"
      trigger_flag: "case44_story_NPC_TRUST_LOST"
      
    N002_NEUTRAL:
      speaker: "Suspect"
      text: "كنت في المقهى المقابل، يمكنكم سؤال النادل."
      action: "UNLOCK_NEW_LOCATION_CAFE"
      
    N002_BROKEN:
      speaker: "Suspect"
      text: "أنا... لم أقصد ذلك. كان حادثاً... (ينهار في البكاء)"
      action: "PLAY_CONFESSION_ANIMATION"
      trigger_flag: "case44_story_TRUE_CONCLUSION_READY"
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
# Event Loop for Case: case44_story
class CaseManager_CASE44_STORY:
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
        required_clues = ["C44-PE-01", "C44-DE-02"]
        return all(clue in selected_evidence for clue in required_clues)
        
# Initialize case monitor on scene load
current_case_monitor = CaseManager_CASE44_STORY(active_player)
```

### 8.6. محاكاة ردود أفعال الفصائل والنظام (Faction & System Responses)
ما بعد انتهاء القضية `case44_story`، كيف تتفاعل قطاعات اللعبة المختلفة مع نتيجة تحقيقات اللاعب المباشرة.

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
> When generating side-quests originated from the case44_story node, ensure the tone reflects the gritty, realistic nature of a contemporary Egyptian crime drama. Emphasize bureaucratic friction, deep socio-economic divides, and the lingering, unseen presence of 'The Shadow'. Do not use cliché Western Noir tropes (like trench coats or classic jazz clubs); instead, use cultural anchors like crowded coffee shops (Ahwas), neglected government archive rooms, neon-lit narrow alleyways in Cairo, and the overarching tension of an invisible syndicate pulling strings in the dark. All dialogue generated MUST support the overarching themes of 'Symmetry' and 'Consequences'.

### 8.8. شروط حجب المحتوى (Content Gating Locks)
لا ينبغى لمحرك اللعبة الكشف عن أية أدلة تالية دون استيفاء شرطين رئيسيين في كل قضية. في هذا الملف (case44_story) الشروط هي:

1. **Gate 1 (The Initial Discovery):** Player must spend at least 15 seconds in the 'Inspect' mode within the primary crime scene to notice the microscopic anomalies.
2. **Gate 2 (The Cognitive Leap):** Player must drag and drop the physical evidence onto the suspect's timeline node in the Deduction UI to unlock the 'Arrest Warrant' option.

---
**[END OF AI DEVELOPMENT APPENDIX FOR CORE ENGINE PARSING]**

### 8.9. سجل العمليات الإضافي للنظام (System Verbose Diagnostics)
```text
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 0... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 1024... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 2048... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 3072... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 4096... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 5120... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 6144... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 7168... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 8192... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 9216... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 10240... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 11264... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 12288... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 13312... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 14336... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 15360... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 16384... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 17408... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 18432... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 19456... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 20480... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 21504... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 22528... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 23552... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 24576... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 25600... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 26624... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 27648... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 28672... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 29696... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 30720... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 31744... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 32768... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 33792... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 34816... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 35840... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 36864... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 37888... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 38912... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 39936... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 40960... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 41984... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 43008... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 44032... OK
[SYS_LOG_DEBUG_CASE44_STORY]: Validating node linkage parameter at offset 45056... OK
```
