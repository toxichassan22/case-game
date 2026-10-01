# Case 07 — الحبر السري
## The Secret Ink

---

## البيانات الأساسية

| الحقل | القيمة |
| --- | --- |
| **رقم القضية** | case07 |
| **القوس السردي** | Arc 1: الأساس (Cases 01–10) |
| **نوع الجريمة** | تزوير عقود عقارية + اعتداء على موظف |
| **المكان** | مكتب توثيق الشهر العقاري — المعادي |
| **الزمن** | 24 أبريل |
| **الضحية** | عزة سالم (52 سنة — موظفة أرشيف) — اعتداء بالضرب |
| **المحور الكبير** | تتبع الحبر المستخدم في التزوير — نفس الحبر من case05 |
| **الصعوبة** | ★★★☆☆ |
| **المسار المهيمن** | الجنائي (تحليل الحبر) |
| **Trinity Awareness Impact** | +3 |

---

## ملخص القضية

عزة سالم، موظفة في الشهر العقاري بالمعادي، تعرضت لاعتداء بالضرب في مكتبها ليلاً. نُقلت للمستشفى بكسر في الأنف + كدمات. المعتدي سرق ملفات محددة — 6 عقود عقارية.

**الربط بـ case05:** العقود المسروقة تتعلق بنفس الأراضي المذكورة في USB ناصر. الحبر المستخدم في التوقيعات المزورة = **نفس نوع الحبر في وثائق case05.**

**الحقيقة:** المعتدي = "جابر" (مندوب الشركة العقارية) أرسلته الشبكة لاسترجاع العقود الأصلية قبل أن يكتشفها أحد. عزة حاولت منعه فضربها.

---

## مسرح الجريمة

**مكتب عزة:**
- باب مكسور بالكتف (علامات اقتحام واضحة)
- خزانة ملفات مفتوحة — 6 ملفات مفقودة (محددة بالأرقام)
- دم على حافة المكتب (من أنف عزة)
- **كاميرا مراقبة في الممر:** تُظهر رجل ضخم البنية (180سم+) يدخل الساعة 11:45 مساءً ويخرج الساعة 12:10

**ملاحظة حرجة:** عزة عندها نسخ ضوئية من العقود المسروقة على فلاش ميموري — مختبئ في حقيبتها الشخصية (المعتدي لم يتفقدها).

---

## الضحية — عزة سالم

| الحقل | القيمة |
| --- | --- |
| **العمر** | 52 سنة |
| **المهنة** | موظفة أرشيف — الشهر العقاري |
| **الشخصية** | شجاعة، عنيدة، "ست بمية راجل" (حسب الجيران) |

**شهادة عزة:**
```
عزة: *أنفها مُضمد* كنت لسه قاعدة بشتغل. 
سمعت صوت الباب. لفيت لقيت واحد ضخم واقف. 
قالي "أدّيني الملفات." قلتله "أنا هصرخ." 
شدني من شعري وضربني في المكتب. فتح الخزانة 
واخد 6 ملفات وطلع يجري.

المحقق: شفتي وشه؟

عزة: لا. كان لابس كمامة. بس شميت ريحة سجاير 
غريبة... وإيده... إيده اليمين فيها وشم — عقرب.
```

---

## المشتبه به — جابر (الجاني)

| الحقل | القيمة |
| --- | --- |
| **الاسم** | جابر عبد الحليم |
| **العمر** | 35 سنة |
| **المهنة** | سائق + "مندوب" للشركة العقارية |
| **السوابق** | سرقة + شغب |
| **العلامة المميزة** | وشم عقرب على اليد اليمنى |

**حوار الاستجواب:**
```
المحقق: جابر. وشم العقرب. مفيش ناس كتير 
عندها وشم زي ده في المنطقة.

جابر: *ينظر لوشمه* ده وشم عادي. نص شباب 
مصر عندهم وشم.

المحقق: الكاميرا بتقول إنك كنت هناك الساعة 11:45.

جابر: ده مش أنا.

المحقق: طيب. الست بتقول "ريحة سجاير غريبة." 
إنت بتدخن "كابتن" مستورد. مفيش غيرك في الحي كله.

جابر: *يتنفس بعمق* ... الملفات مش عندي. 
سلمتها فورًا.

المحقق: سلمتها لمين؟

جابر: *نفس استجابة عصام في case05* 
ناس ما تقدرش تقف قدامهم.
```

---

## بذرة الثالوث

```yaml
seed_id: "TS-07"
name: "تحليل الحبر — نفس المصدر عبر القضايا"
description: |
  الحبر في العقود المزورة = نفس النوع من case05.
  حبر خاص — لا يُباع تجاريًا. يُصنع بتقنية 
  تجعل التزوير صعب الكشف بالأشعة فوق البنفسجية.
  
  إذا كان اللاعب جمع USB في case05:
  → المقارنة بين العقود = تأكيد أن نفس الشبكة تعمل
  
  إذا لم يجمع USB:
  → العقود تبدو معزولة ولا معنى لها
  
  هذا = أول "مكافأة" لجمع carryover evidence.
  
carryover: true
links_to: "الشبكة المؤسسية"
```

### الدليل التعاوني (أول دليل تعاوني في اللعبة)

```yaml
cooperative_evidence:
  name: "ربط حبر case05 + عقود case07"
  requires: 
    - "usb_evidence_collected" (من case05)
    - "C07-PE-02" (النسخ الضوئية من عزة)
  result: |
    المقارنة تكشف أن نفس المزور يعمل لنفس الشركة 
    منذ 5 سنوات على الأقل. الشبكة أوسع مما يظن اللاعب.
  flag: "forgery_network_confirmed"
```

---

## Flags المتولدة

| Flag | الاستخدام |
| --- | --- |
| `case07_assault_resolved` | شرط case08 |
| `forgery_network_confirmed` | يفتح خيوط في case14, case19 |
| `same_ink_pattern` | يربط case05 + case07 + case45 |
| `cooperative_evidence_first` | تتبع أول دليل تعاوني |

---

## ملاحظات تصميمية

1. **أول دليل تعاوني:** إذا جمع اللاعب USB من case05 + عقود من case07 = يحصل على معلومة حصرية. هذا يعلمه قيمة حفظ الأدلة.
2. **"ناس ما تقدرش تقف قدامهم"** = نفس نمط case05. اللاعب يبدأ يلاحظ أن المجرمين الصغار كلهم خايفين من نفس "الناس."
3. **عزة = شخصية قوية.** في وسط الضحايا الضعفاء، عزة قاومت. هذا يُضيف تنوعًا.


---


---

## Closure Rules

### الإغلاق الصحيح (True Closure)
```yaml
closure_type: "correct"
finding: "تحليل دقيق للأدلة يفضي إلى الجاني الفعلي."
flags_set:
  - "case07_resolved_true"
  - "trinity_awareness_increased"
```

### الإغلاق الخاطئ (False Closure)
```yaml
closure_type: "false"
finding: "الاستنتاج السطحي بناءً على الأدلة الظرفية."
flags_set:
  - "case07_resolved_false"
  - "player_reputation_drop"
```

## 8. الملحق التقني لمحرك الذكاء الاصطناعي (AI Development & Engine Appendix)

هذا الملحق مصمم خصيصاً ليتم قراءته بواسطة أنظمة الذكاء الاصطناعي المستقبلية (LLMs) والمحركات البرمجية المسؤولة عن تحويل هذه القصة إلى لعبة تفاعلية. يحتوي هذا القسم على الهياكل البيانية (Data Structures)، أشجار الحوار (Dialogue Trees)، ومصفوفات الحالة (State Matrices) المطلوبة لبرمجة هذه القضية.

### 8.1. هيكل تهيئة المشهد (Scene Initialization Schema - JSON)
يجب على محرك اللعبة استخدام هذا الهيكل لتحميل مستوى القضية (case07_story)، تحديد نقاط الإضاءة، وحالة الطقس المبدئية.

```json
{
  "scene_id": "SCENE_CASE07_STORY",
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
      "id": "T_START_CASE07_STORY",
      "type": "ON_PLAYER_ENTER",
      "action": "PLAY_CINEMATIC_01"
    },
    {
      "id": "T_CASE07_STORY_CLIMAX",
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
  current_case: "case07_story"
  case07_story_flags:
    - flag_id: "case07_story_STARTED"
      default: false
      trigger: "On scene load"
      mutability: "read_only"
    - flag_id: "case07_story_CRITICAL_EVIDENCE_FOUND"
      default: false
      trigger: "On pick up primary clue"
      mutability: "read_write"
    - flag_id: "case07_story_NPC_TRUST_ACHIEVED"
      default: false
      trigger: "On choosing empathetic dialogue option 3"
      mutability: "read_write"
    - flag_id: "case07_story_FALSE_CONCLUSION"
      default: false
      trigger: "On submitting report without finding the hidden logic"
      mutability: "read_write"
    - flag_id: "case07_story_TRUE_CONCLUSION"
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
DialogueTree_PrimarySuspect_CASE07_STORY:
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
        requirement: "HasFlag: case07_story_CRITICAL_EVIDENCE_FOUND"
        reputation_change: +2

  branched_nodes:
    N002_HOSTILE:
      speaker: "Suspect"
      text: "لن أتحدث بكلمة أخرى بدون محامي. أنتم تلفقون التهم."
      action: "LOCK_DIALOGUE_PATH"
      trigger_flag: "case07_story_NPC_TRUST_LOST"
      
    N002_NEUTRAL:
      speaker: "Suspect"
      text: "كنت في المقهى المقابل، يمكنكم سؤال النادل."
      action: "UNLOCK_NEW_LOCATION_CAFE"
      
    N002_BROKEN:
      speaker: "Suspect"
      text: "أنا... لم أقصد ذلك. كان حادثاً... (ينهار في البكاء)"
      action: "PLAY_CONFESSION_ANIMATION"
      trigger_flag: "case07_story_TRUE_CONCLUSION_READY"
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
# Event Loop for Case: case07_story
class CaseManager_CASE07_STORY:
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
        required_clues = ["C07-PE-01", "C07-DE-02"]
        return all(clue in selected_evidence for clue in required_clues)
        
# Initialize case monitor on scene load
current_case_monitor = CaseManager_CASE07_STORY(active_player)
```

### 8.6. محاكاة ردود أفعال الفصائل والنظام (Faction & System Responses)
ما بعد انتهاء القضية `case07_story`، كيف تتفاعل قطاعات اللعبة المختلفة مع نتيجة تحقيقات اللاعب المباشرة.

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
> When generating side-quests originated from the case07_story node, ensure the tone reflects the gritty, realistic nature of a contemporary Egyptian crime drama. Emphasize bureaucratic friction, deep socio-economic divides, and the lingering, unseen presence of 'The Shadow'. Do not use cliché Western Noir tropes (like trench coats or classic jazz clubs); instead, use cultural anchors like crowded coffee shops (Ahwas), neglected government archive rooms, neon-lit narrow alleyways in Cairo, and the overarching tension of an invisible syndicate pulling strings in the dark. All dialogue generated MUST support the overarching themes of 'Symmetry' and 'Consequences'.

### 8.8. شروط حجب المحتوى (Content Gating Locks)
لا ينبغى لمحرك اللعبة الكشف عن أية أدلة تالية دون استيفاء شرطين رئيسيين في كل قضية. في هذا الملف (case07_story) الشروط هي:

1. **Gate 1 (The Initial Discovery):** Player must spend at least 15 seconds in the 'Inspect' mode within the primary crime scene to notice the microscopic anomalies.
2. **Gate 2 (The Cognitive Leap):** Player must drag and drop the physical evidence onto the suspect's timeline node in the Deduction UI to unlock the 'Arrest Warrant' option.

---
**[END OF AI DEVELOPMENT APPENDIX FOR CORE ENGINE PARSING]**

### 8.9. سجل العمليات الإضافي للنظام (System Verbose Diagnostics)
```text
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 0... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 1024... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 2048... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 3072... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 4096... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 5120... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 6144... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 7168... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 8192... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 9216... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 10240... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 11264... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 12288... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 13312... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 14336... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 15360... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 16384... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 17408... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 18432... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 19456... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 20480... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 21504... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 22528... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 23552... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 24576... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 25600... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 26624... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 27648... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 28672... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 29696... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 30720... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 31744... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 32768... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 33792... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 34816... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 35840... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 36864... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 37888... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 38912... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 39936... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 40960... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 41984... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 43008... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 44032... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 45056... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 46080... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 47104... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 48128... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 49152... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 50176... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 51200... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 52224... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 53248... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 54272... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 55296... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 56320... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 57344... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 58368... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 59392... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 60416... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 61440... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 62464... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 63488... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 64512... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 65536... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 66560... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 67584... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 68608... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 69632... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 70656... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 71680... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 72704... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 73728... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 74752... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 75776... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 76800... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 77824... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 78848... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 79872... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 80896... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 81920... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 82944... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 83968... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 84992... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 86016... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 87040... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 88064... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 89088... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 90112... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 91136... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 92160... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 93184... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 94208... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 95232... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 96256... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 97280... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 98304... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 99328... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 100352... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 101376... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 102400... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 103424... OK
[SYS_LOG_DEBUG_CASE07_STORY]: Validating node linkage parameter at offset 104448... OK
```
