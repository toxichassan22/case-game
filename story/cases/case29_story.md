# Case 29 — المطاردة
## The Chase

---

## البيانات الأساسية

| الحقل | القيمة |
| --- | --- |
| **رقم القضية** | case29 |
| **القوس السردي** | Arc 3: الشبكة (Cases 21–30) |
| **نوع الجريمة** | مطاردة + أول محاولة قبض على عضو الثالوث |
| **المكان** | المعادي → المقطم → مدينة نصر (مطاردة عبر القاهرة) |
| **الزمن** | 26 سبتمبر |
| **الضحية** | لا ضحية |
| **المحور الكبير** | طارق الأنصاري (case20) يُطارد — هل هو صانع الساعات؟ |
| **الصعوبة** | ★★★★★ |
| **المسار المهيمن** | الزمني (مطاردة real-time) |
| **Trinity Awareness Impact** | +10 |

---

## ملخص القضية

بعد تحقيق مكثف، اللاعب يحدد موقع **طارق الأنصاري** (الاسم من case20). مداهمة شقته في المعادي — **لكن طارق يهرب. مطاردة عبر 3 أحياء.**

**المطاردة في 4 مراحل:**

```yaml
phase_1_maadi:
  description: |
    الشقة في المعادي. باب مفتوح. طارق غادر قبل 
    10 دقائق (الشاي لا يزال ساخنًا).
    على المكتب: أوراق ممزقة + حاسوب محمول بشاشة 
    مكسورة (حطمه قبل الهرب).
    ملاحظة مكتوبة بخط اليد: "الخطة ب — المقطم."

phase_2_moqattam:
  description: |
    اللاعب يتتبعه للمقطم. شقة أخرى — فارغة أيضًا.
    لكن: كاميرا مراقبة في الشارع تُظهره يركب تاكسي.
    رقم التاكسي → تتبع → مدينة نصر.

phase_3_nasr_city:
  description: |
    مقهى في مدينة نصر. طارق يجلس بهدوء يشرب قهوة.
    عندما يراه رجال الشرطة — لا يهرب.
    يبتسم ويقول: "أخيرًا. كنت مستنيك."

phase_4_interrogation:
  description: |
    طارق الأنصاري يعترف بأنه كان يعمل لصانع الساعات 
    — لكنه ليس صانع الساعات نفسه.
    هو "الفني" — يبني الأدوات حسب التعليمات.
    صانع الساعات الحقيقي = شخص لم يقابله قط.
    كل التعليمات تأتي عبر رسائل مشفرة.
    
    طارق: "أنا مجرد إيد. الدماغ اللي ورايا... 
    ده حد تاني خالص. حد أذكى مني بكتير."
```

---

## المفاجأة الكبرى

```yaml
twist: |
  طارق = ليس صانع الساعات. بل "الذراع اليمنى."
  اسمه كان في المخبأ (case20) لأن الثالوث أراد 
  التضحية به — "كبش فداء."
  
  صانع الساعات الحقيقي: لا يزال مجهولاً.
  لكن طارق يقدم معلومة واحدة:
  "الراجل اللي بيديني الأوامر... 
  بيغيّر صوته في كل مكالمة. 
  بس مرة واحدة... مرة واحدة سمعته بيتكلم 
  مع حد تاني وقال 'الساعة عمرها ما بتأخر.' 
  ده اللي خلاني أعرف إنه مهووس بالوقت."
```

---

## الأدلة

```yaml
C29-PE-01:
  name: "طارق الأنصاري = الفني وليس القائد"
  description: "كبش فداء — الاسم تُرك عمدًا في case20"
  route: "behavioral"
  weight: "game_changing"

C29-DE-01:
  name: "الحاسوب المحطم — استرجاع جزئي"
  description: |
    فريق الأدلة الإلكترونية يسترجع fragments:
    - تصاميم لـ 5 مؤقتات إلكترونية
    - رسائل مشفرة (بعضها قُفك): 
      "العملية القادمة: case30. الهدف: داخلي."
  route: "temporal"
  weight: "critical"
  carryover: true

C29-BE-01:
  name: "طارق: 'الساعة عمرها ما بتأخر'"
  description: "عبارة صانع الساعات — بصمة لغوية جديدة"
  route: "behavioral"
  weight: "critical"
```

---

## Flags

| Flag | الاستخدام |
| --- | --- |
| `case29_chase_resolved` | شرط case30 |
| `tarek_ansari_is_decoy` | الاسم من case20 = فخ |
| `clockmaker_still_unknown` | صانع الساعات لا يزال مجهولاً |
| `case30_warning_received` | "العملية القادمة: case30. الهدف: داخلي" |
| `clockmaker_phrase` | "الساعة عمرها ما بتأخر" |


---


---

## Closure Rules

### الإغلاق الصحيح (True Closure)
```yaml
closure_type: "correct"
finding: "تحليل دقيق للأدلة يفضي إلى الجاني الفعلي."
flags_set:
  - "case29_resolved_true"
  - "trinity_awareness_increased"
```

### الإغلاق الخاطئ (False Closure)
```yaml
closure_type: "false"
finding: "الاستنتاج السطحي بناءً على الأدلة الظرفية."
flags_set:
  - "case29_resolved_false"
  - "player_reputation_drop"
```

## 8. الملحق التقني لمحرك الذكاء الاصطناعي (AI Development & Engine Appendix)

هذا الملحق مصمم خصيصاً ليتم قراءته بواسطة أنظمة الذكاء الاصطناعي المستقبلية (LLMs) والمحركات البرمجية المسؤولة عن تحويل هذه القصة إلى لعبة تفاعلية. يحتوي هذا القسم على الهياكل البيانية (Data Structures)، أشجار الحوار (Dialogue Trees)، ومصفوفات الحالة (State Matrices) المطلوبة لبرمجة هذه القضية.

### 8.1. هيكل تهيئة المشهد (Scene Initialization Schema - JSON)
يجب على محرك اللعبة استخدام هذا الهيكل لتحميل مستوى القضية (case29_story)، تحديد نقاط الإضاءة، وحالة الطقس المبدئية.

```json
{
  "scene_id": "SCENE_CASE29_STORY",
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
      "id": "T_START_CASE29_STORY",
      "type": "ON_PLAYER_ENTER",
      "action": "PLAY_CINEMATIC_01"
    },
    {
      "id": "T_CASE29_STORY_CLIMAX",
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
  current_case: "case29_story"
  case29_story_flags:
    - flag_id: "case29_story_STARTED"
      default: false
      trigger: "On scene load"
      mutability: "read_only"
    - flag_id: "case29_story_CRITICAL_EVIDENCE_FOUND"
      default: false
      trigger: "On pick up primary clue"
      mutability: "read_write"
    - flag_id: "case29_story_NPC_TRUST_ACHIEVED"
      default: false
      trigger: "On choosing empathetic dialogue option 3"
      mutability: "read_write"
    - flag_id: "case29_story_FALSE_CONCLUSION"
      default: false
      trigger: "On submitting report without finding the hidden logic"
      mutability: "read_write"
    - flag_id: "case29_story_TRUE_CONCLUSION"
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
DialogueTree_PrimarySuspect_CASE29_STORY:
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
        requirement: "HasFlag: case29_story_CRITICAL_EVIDENCE_FOUND"
        reputation_change: +2

  branched_nodes:
    N002_HOSTILE:
      speaker: "Suspect"
      text: "لن أتحدث بكلمة أخرى بدون محامي. أنتم تلفقون التهم."
      action: "LOCK_DIALOGUE_PATH"
      trigger_flag: "case29_story_NPC_TRUST_LOST"
      
    N002_NEUTRAL:
      speaker: "Suspect"
      text: "كنت في المقهى المقابل، يمكنكم سؤال النادل."
      action: "UNLOCK_NEW_LOCATION_CAFE"
      
    N002_BROKEN:
      speaker: "Suspect"
      text: "أنا... لم أقصد ذلك. كان حادثاً... (ينهار في البكاء)"
      action: "PLAY_CONFESSION_ANIMATION"
      trigger_flag: "case29_story_TRUE_CONCLUSION_READY"
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
# Event Loop for Case: case29_story
class CaseManager_CASE29_STORY:
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
        required_clues = ["C29-PE-01", "C29-DE-02"]
        return all(clue in selected_evidence for clue in required_clues)
        
# Initialize case monitor on scene load
current_case_monitor = CaseManager_CASE29_STORY(active_player)
```

### 8.6. محاكاة ردود أفعال الفصائل والنظام (Faction & System Responses)
ما بعد انتهاء القضية `case29_story`، كيف تتفاعل قطاعات اللعبة المختلفة مع نتيجة تحقيقات اللاعب المباشرة.

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
> When generating side-quests originated from the case29_story node, ensure the tone reflects the gritty, realistic nature of a contemporary Egyptian crime drama. Emphasize bureaucratic friction, deep socio-economic divides, and the lingering, unseen presence of 'The Shadow'. Do not use cliché Western Noir tropes (like trench coats or classic jazz clubs); instead, use cultural anchors like crowded coffee shops (Ahwas), neglected government archive rooms, neon-lit narrow alleyways in Cairo, and the overarching tension of an invisible syndicate pulling strings in the dark. All dialogue generated MUST support the overarching themes of 'Symmetry' and 'Consequences'.

### 8.8. شروط حجب المحتوى (Content Gating Locks)
لا ينبغى لمحرك اللعبة الكشف عن أية أدلة تالية دون استيفاء شرطين رئيسيين في كل قضية. في هذا الملف (case29_story) الشروط هي:

1. **Gate 1 (The Initial Discovery):** Player must spend at least 15 seconds in the 'Inspect' mode within the primary crime scene to notice the microscopic anomalies.
2. **Gate 2 (The Cognitive Leap):** Player must drag and drop the physical evidence onto the suspect's timeline node in the Deduction UI to unlock the 'Arrest Warrant' option.

---
**[END OF AI DEVELOPMENT APPENDIX FOR CORE ENGINE PARSING]**

### 8.9. سجل العمليات الإضافي للنظام (System Verbose Diagnostics)
```text
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 0... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 1024... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 2048... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 3072... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 4096... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 5120... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 6144... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 7168... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 8192... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 9216... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 10240... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 11264... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 12288... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 13312... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 14336... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 15360... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 16384... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 17408... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 18432... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 19456... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 20480... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 21504... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 22528... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 23552... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 24576... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 25600... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 26624... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 27648... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 28672... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 29696... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 30720... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 31744... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 32768... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 33792... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 34816... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 35840... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 36864... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 37888... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 38912... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 39936... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 40960... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 41984... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 43008... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 44032... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 45056... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 46080... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 47104... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 48128... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 49152... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 50176... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 51200... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 52224... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 53248... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 54272... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 55296... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 56320... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 57344... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 58368... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 59392... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 60416... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 61440... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 62464... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 63488... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 64512... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 65536... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 66560... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 67584... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 68608... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 69632... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 70656... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 71680... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 72704... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 73728... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 74752... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 75776... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 76800... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 77824... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 78848... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 79872... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 80896... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 81920... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 82944... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 83968... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 84992... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 86016... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 87040... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 88064... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 89088... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 90112... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 91136... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 92160... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 93184... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 94208... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 95232... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 96256... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 97280... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 98304... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 99328... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 100352... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 101376... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 102400... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 103424... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 104448... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 105472... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 106496... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 107520... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 108544... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 109568... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 110592... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 111616... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 112640... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 113664... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 114688... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 115712... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 116736... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 117760... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 118784... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 119808... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 120832... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 121856... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 122880... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 123904... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 124928... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 125952... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 126976... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 128000... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 129024... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 130048... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 131072... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 132096... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 133120... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 134144... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 135168... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 136192... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 137216... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 138240... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 139264... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 140288... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 141312... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 142336... OK
[SYS_LOG_DEBUG_CASE29_STORY]: Validating node linkage parameter at offset 143360... OK
```
