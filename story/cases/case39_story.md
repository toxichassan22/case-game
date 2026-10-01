# Case 39 — الميزان
## The Scale

---

## البيانات الأساسية (Case Metadata)

| الحقل | القيمة |
| --- | --- |
| **رقم القضية** | case39 |
| **القوس السردي** | Arc 4: الانكشاف (Cases 31–40) |
| **نوع الجريمة** | قرار أخلاقي — حياة شخص مقابل دليل حاسم |
| **المكان** | مبنى تحت الإنشاء — 6 أكتوبر |
| **الزمن** | 6 ديسمبر |
| **الضحية** | "أحمد" — المندوب/الوسيط من case03/case14 |
| **المحور الكبير** | ثاني قرار أخلاقي كبير — حياة إنسان vs. تقدم التحقيق |
| **الصعوبة** | ★★★★★ |
| **المسار المهيمن** | السلوكي (أخلاقيات) |
| **Trinity Awareness Impact** | +5 |

---

## ملخص القضية (Case Synopsis)

"أحمد" — المندوب الثابت الذي يعمل كوسيط بين الثالوث ومنفذيهم (ظهر في case03, case14, case36 — ولم يُقبض عليه أبدًا) — يظهر أخيرًا. لكن ليس في ظروف عادية.

**الموقف:** "أحمد" محتجز من طرف الثالوث نفسه (بعد القبض على الخيميائي أصبح "خطرًا أمنيًا"). الثالوث يريد التخلص منه. لكن قبل أن يموت، "أحمد" يتصل باللاعب عبر رقم مجهول:

```
أحمد: *بصوت مرتعش* "أنا أحمد. اللي كنت بتدور عليه.
أنا عندي كل حاجة. أسماء. أماكن. حسابات.
كل حاجة عن الشبكة. بس أنا فاضلي ساعات.
هما قرروا يشيلوني. 

لو جيت الآن — هتلاقيني في مبنى تحت الإنشاء 
في 6 أكتوبر. الدور التاسع. 
معايا فلاشة فيها كل حاجة.

بس... لو جيت... ومسكتني... 
مش هقدر أسلمك الفلاشة.
الفلاشة متقفلة ببصمتي. لو اتمسكت = هيقدروا 
يوصلوا للفلاشة ويمسحوها عن بعد.

الحل الوحيد: تسيبني أهرب. وأبعتلك الفلاشة 
بعد ما أأمّن نفسي.

يعني: لو مسكتني = خسرت الأدلة.
ولو سبتني = خليت مجرم يهرب."
```

---

## القرار الأخلاقي الثاني

```yaml
moral_decision:
  question: "هل تقبض على أحمد (مجرم) أم تتركه يهرب (مقابل الأدلة)؟"
  
  option_A:
    label: "القبض على أحمد"
    reasoning: |
      أحمد = وسيط مسؤول عن عشرات الجرائم.
      تركه يهرب = ظلم للضحايا.
      القانون واضح: لا صفقات.
    consequence: |
      أحمد يُمسك. لكن الفلاشة تُمسح عن بعد.
      الأدلة الحاسمة تضيع.
      التحقيق يتأخر بشكل كبير.
    flags: "case39_ahmed_arrested"

  option_B:
    label: "ترك أحمد يهرب مقابل الأدلة"
    reasoning: |
      الأدلة في الفلاشة = يمكن أن تكشف 
      هوية صانع الساعات والمُلقن.
      أحمد سيختفي — لكن المعلومات أهم من شخص واحد.
    consequence: |
      أحمد يهرب ويرسل الفلاشة بعد يومين.
      الفلاشة تحتوي: أسماء حسابات بنكية + 
      عنوان شقة مرتبطة بصانع الساعات + 
      رقم هاتف مرتبط بالمُلقن.
    flags: "case39_ahmed_freed"

  meta_note: |
    هذا القرار يربط بـ case04 (طارق — القرار الأخلاقي الأول).
    في case04: العدالة vs. الرحمة.
    في case39: العدالة vs. المنفعة.
    
    في case51: اللاعب سيُواجَه بقراريه.
    في case59: ملفه الأخلاقي يُقيَّم.
```

---

## مسرح الجريمة

### المبنى تحت الإنشاء (الدور التاسع)

```
- مبنى سكني غير مكتمل. 10 طوابق. لا أبواب ولا نوافذ
- الدرج = الطريقة الوحيدة للصعود
- الدور التاسع: أحمد يجلس على كرسي بلاستيك. 
  حقيبة صغيرة بجانبه. في يده الفلاشة.
  يبدو مرهقًا. خايفًا. لم ينم من أيام.
- لا أحد آخر في المبنى (الثالوث لم يأتِ بعد)
- من الدور التاسع: يمكن رؤية الشارع. 
  خلال 30 دقيقة من وصول اللاعب: 
  سيارة سوداء تقف أمام المبنى. شخصان يخرجان.
  = الثالوث جاء ليُنهي أحمد.
```

---

## الأدلة

### أدلة مادية

```yaml
C39-PE-01:
  evidence_id: "C39-PE-01"
  type: "physical"
  name: "الفلاشة — إذا قبضت على أحمد"
  condition: "option_A فقط"
  description: |
    الفلاشة تُمسح عن بعد خلال 5 دقائق 
    من القبض على أحمد. لا يمكن استرجاع شيء.
    = خسارة كاملة.
  route: "forensic"
  weight: "lost"

C39-PE-02:
  evidence_id: "C39-PE-02"
  type: "physical"
  name: "الفلاشة — إذا تركت أحمد يهرب"
  condition: "option_B فقط"
  description: |
    الفلاشة تصل بعد يومين بالبريد (بدون عنوان مرسل).
    المحتويات:
    1. قائمة 8 حسابات بنكية (غسيل أموال)
    2. عنوان شقة في المهندسين "مرتبطة بـ م.ص." 
       (م.ص. = ممكن = صانع الساعات)
    3. رقم هاتف مُستخدم مرة واحدة = مرتبط 
       بحساب "عيادة التماثل" (= المُلقن)
  route: "forensic"
  weight: "game_changing"
  carryover: true
```

### أدلة سلوكية

```yaml
C39-BE-01:
  evidence_id: "C39-BE-01"
  type: "behavioral"
  name: "أحمد يعترف: 'أنا تعبت'"
  description: |
    أحمد ليس شريرًا بالمعنى الكلاسيكي.
    هو شخص بدأ كموظف عادي وانزلق.
    
    أحمد: "أنا بدأت كسواق. حد قالي 'وصّل الظرف ده.'
    بعدين 'وصّل العلبة دي.' بعدين 'اتكلم مع الراجل ده.'
    قبل ما أوعي... كنت عارف أسرار تقتل. 
    وبقيت جزء من حاجة مش عارف أخرج منها.
    
    أنا مش بطل. ومش هقول إني بريء. 
    بس أنا تعبت. والأدلة اللي معايا... 
    ممكن تخلص القصة دي."
  route: "behavioral"
  weight: "game_changing"
```

---

## بذرة الثالوث

```yaml
seed_id: "TS-39"
description: |
  أحمد = آخر حلقة في سلسلة الوسطاء.
  
  إذا هرب (option_B): الأدلة تقرّب من 
  صانع الساعات + المُلقن بشكل كبير.
  
  إذا اتمسك (option_A): التحقيق يتأخر.
  لكن العدالة تتحقق (إيقاف مجرم).
  
  لا إجابة صحيحة. لكن option_B = عمليًا أفضل.
  option_A = أخلاقيًا أنقى.
  
  الظل يرسل رسالة:
  "اختيار جميل. بغض النظر عن إيه اختاره."
  (= المُلقن يقيّم — مرة أخرى)
```

---

## Closure Rules

```yaml
option_A_closure:
  result: "أحمد مقبوض عليه. الفلاشة ضاعت."
  flags: ["case39_ahmed_arrested", "evidence_lost", "justice_served"]

option_B_closure:
  result: "أحمد هرب. الفلاشة وصلت."
  flags: ["case39_ahmed_freed", "flash_drive_received", "justice_compromised"]
```

---

## الحوار الختامي

### إذا قبض على أحمد:

```
[مشهد: أحمد في القسم. مقيد.]

أحمد: *بهدوء* "اختارت العدالة. 
بس العدالة من غير حقيقة... 
دي بس انتقام بزي رسمي."

[Terminal:]
"الفلاشة: تم المسح عن بعد. 
البيانات: غير قابلة للاسترجاع.
التحقيق: تأخر X قضايا."
```

### إذا ترك أحمد يهرب:

```
[مشهد: المحقق في مكتبه. يومين لاحقًا.
طرد بريدي بدون عنوان. بداخله: الفلاشة.]

[Terminal:]
"بيانات جديدة:
- 8 حسابات بنكية (قيد التحقق)
- عنوان: شقة 14، عمارة 7، شارع النخيل، المهندسين
- رقم هاتف: [مُعطّل حاليًا]
 
التقدم: كبير.
الثمن: مجرم طليق."
```

---

## Flags المتولدة

| Flag | الشرط | الاستخدام |
| --- | --- | --- |
| `case39_ahmed_arrested` | option A | يؤثر على case42+ (تأخير) |
| `case39_ahmed_freed` | option B | يوفر أدلة حاسمة |
| `flash_drive_received` | option B | carryover لـ case42/44 |
| `moral_profile_updated` | دائمًا | يُضاف لمجموع القرارات الأخلاقية |
| `justice_vs_pragmatism` | دائمًا | يُقيَّم في case51 + case59 |

---

## ملاحظات تصميمية

1. **القرار يعكس case04 كالمرآة.** في case04: عاطفة vs. قانون. في case39: قانون vs. منفعة. اللاعب يبني "ملفًا أخلاقيًا" = يُقيَّم في النهاية.

2. **أحمد = أكثر شخصية "رمادية" في اللعبة.** ليس بريئًا ولا شريرًا. بدأ ببراءة وانزلق. هذا الواقعية يجعله مؤثرًا.

3. **الفلاشة = تسريع vs. تأخير.** اللاعب يختار سرعة الوصول للحقيقة مقابل ثمن أخلاقي.

4. **الظل يعلق = مقلق.** "اختيار جميل بغض النظر" = يعني أن المُلقن يهتم بالعملية وليس النتيجة. هو يدرس اللاعب.


---

## 8. الملحق التقني لمحرك الذكاء الاصطناعي (AI Development & Engine Appendix)

هذا الملحق مصمم خصيصاً ليتم قراءته بواسطة أنظمة الذكاء الاصطناعي المستقبلية (LLMs) والمحركات البرمجية المسؤولة عن تحويل هذه القصة إلى لعبة تفاعلية. يحتوي هذا القسم على الهياكل البيانية (Data Structures)، أشجار الحوار (Dialogue Trees)، ومصفوفات الحالة (State Matrices) المطلوبة لبرمجة هذه القضية.

### 8.1. هيكل تهيئة المشهد (Scene Initialization Schema - JSON)
يجب على محرك اللعبة استخدام هذا الهيكل لتحميل مستوى القضية (case39_story)، تحديد نقاط الإضاءة، وحالة الطقس المبدئية.

```json
{
  "scene_id": "SCENE_CASE39_STORY",
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
      "id": "T_START_CASE39_STORY",
      "type": "ON_PLAYER_ENTER",
      "action": "PLAY_CINEMATIC_01"
    },
    {
      "id": "T_CASE39_STORY_CLIMAX",
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
  current_case: "case39_story"
  case39_story_flags:
    - flag_id: "case39_story_STARTED"
      default: false
      trigger: "On scene load"
      mutability: "read_only"
    - flag_id: "case39_story_CRITICAL_EVIDENCE_FOUND"
      default: false
      trigger: "On pick up primary clue"
      mutability: "read_write"
    - flag_id: "case39_story_NPC_TRUST_ACHIEVED"
      default: false
      trigger: "On choosing empathetic dialogue option 3"
      mutability: "read_write"
    - flag_id: "case39_story_FALSE_CONCLUSION"
      default: false
      trigger: "On submitting report without finding the hidden logic"
      mutability: "read_write"
    - flag_id: "case39_story_TRUE_CONCLUSION"
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
DialogueTree_PrimarySuspect_CASE39_STORY:
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
        requirement: "HasFlag: case39_story_CRITICAL_EVIDENCE_FOUND"
        reputation_change: +2

  branched_nodes:
    N002_HOSTILE:
      speaker: "Suspect"
      text: "لن أتحدث بكلمة أخرى بدون محامي. أنتم تلفقون التهم."
      action: "LOCK_DIALOGUE_PATH"
      trigger_flag: "case39_story_NPC_TRUST_LOST"
      
    N002_NEUTRAL:
      speaker: "Suspect"
      text: "كنت في المقهى المقابل، يمكنكم سؤال النادل."
      action: "UNLOCK_NEW_LOCATION_CAFE"
      
    N002_BROKEN:
      speaker: "Suspect"
      text: "أنا... لم أقصد ذلك. كان حادثاً... (ينهار في البكاء)"
      action: "PLAY_CONFESSION_ANIMATION"
      trigger_flag: "case39_story_TRUE_CONCLUSION_READY"
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
# Event Loop for Case: case39_story
class CaseManager_CASE39_STORY:
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
        required_clues = ["C39-PE-01", "C39-DE-02"]
        return all(clue in selected_evidence for clue in required_clues)
        
# Initialize case monitor on scene load
current_case_monitor = CaseManager_CASE39_STORY(active_player)
```

### 8.6. محاكاة ردود أفعال الفصائل والنظام (Faction & System Responses)
ما بعد انتهاء القضية `case39_story`، كيف تتفاعل قطاعات اللعبة المختلفة مع نتيجة تحقيقات اللاعب المباشرة.

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
> When generating side-quests originated from the case39_story node, ensure the tone reflects the gritty, realistic nature of a contemporary Egyptian crime drama. Emphasize bureaucratic friction, deep socio-economic divides, and the lingering, unseen presence of 'The Shadow'. Do not use cliché Western Noir tropes (like trench coats or classic jazz clubs); instead, use cultural anchors like crowded coffee shops (Ahwas), neglected government archive rooms, neon-lit narrow alleyways in Cairo, and the overarching tension of an invisible syndicate pulling strings in the dark. All dialogue generated MUST support the overarching themes of 'Symmetry' and 'Consequences'.

### 8.8. شروط حجب المحتوى (Content Gating Locks)
لا ينبغى لمحرك اللعبة الكشف عن أية أدلة تالية دون استيفاء شرطين رئيسيين في كل قضية. في هذا الملف (case39_story) الشروط هي:

1. **Gate 1 (The Initial Discovery):** Player must spend at least 15 seconds in the 'Inspect' mode within the primary crime scene to notice the microscopic anomalies.
2. **Gate 2 (The Cognitive Leap):** Player must drag and drop the physical evidence onto the suspect's timeline node in the Deduction UI to unlock the 'Arrest Warrant' option.

---
**[END OF AI DEVELOPMENT APPENDIX FOR CORE ENGINE PARSING]**
