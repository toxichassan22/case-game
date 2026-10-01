# schema.md

## الهدف
هذا الملف يربط البناء السردي بالبناء التقني.
هو المرجع الذي يحدد شكل البيانات بين الـ Backend والـ Frontend.

### Root Save Envelope
- ملف الحفظ الفعلي يجب أن يبدأ من Root واضح، لا من `player_state` مباشرة.
- الشكل المرجعي المقترح:

```json
{
  "save_version": "v1.0",
  "player_state": {},
  "active_case_state": {},
  "engine_debug": {
    "event_trace": [],
    "live_flags": {},
    "rollback_snapshots": []
  }
}
```

- `save_version` يعيش في الجذر فقط.
- `player_state` لا يملك `save_version` داخله.
- `engine_debug` داخل ملف الحفظ اختياري في الإنتاج، لكنه جزء مشروع من Root Save Envelope في التطوير أو الاختبار.

## 1. هيكل JSON للقضية

### المفاتيح الأساسية
- `case_id: string`
- `title: string`
- `crime_type: string`
- `victim_name: string | null`
- `overview: object`
- `inbox_brief: object`
- `evidence_list: array`
- `suspects: array`
- `witnesses: array`
- `related_persons: array`
- `required_flags: array`
- `outcome_flags: object`
- `solution_paths: object`
- `derived_route_profile: object`
- `closure_rules: object`
- `trinity_hooks: object`
- `hidden_systems: object`
- `penalty_rules: object`
- `transition_context_hooks: array`
- `next_case_rules: array`

### الشكل المرجعي المقترح
```json
{
  "case_id": "case01",
  "title": "اسم القضية",
  "crime_type": "arson",
  "victim_name": "اسم الضحية",
  "overview": {
    "public_summary": "ملخص عام للقضية",
    "main_question": "السؤال الأساسي",
    "stakes": "ما الذي يجعل القضية مهمة"
  },
  "inbox_brief": {
    "sender": "Chief Desk",
    "subject": "New Case Intake",
    "message": "تكليف مختصر"
  },
  "evidence_list": [],
  "suspects": [],
  "witnesses": [],
  "related_persons": [],
  "required_flags": [],
  "outcome_flags": {
    "success": [],
    "partial": [],
    "failure": []
  },
  "solution_paths": {
    "timeline": {},
    "forensics": {},
    "behavioral": {}
  },
  "derived_route_profile": {
    "timeline": 0.34,
    "forensics": 0.33,
    "behavioral": 0.33,
    "raw_scores": {
      "timeline": 6.8,
      "forensics": 6.6,
      "behavioral": 6.6
    },
    "normalization_total": 20.0,
    "formula_version": "v1_weighted_state_normalized",
    "computed_from_evidence": true
  },
  "closure_rules": {
    "requires_culprit": true,
    "requires_motive": true,
    "requires_method_or_opportunity": true,
    "minimum_evidence_count": 3,
    "validate_closure": {
      "minimum_behavioral_chain_verified": 1,
      "minimum_cross_route_verified": 1,
      "no_shared_evidence_between_roles": true
    }
  },
  "trinity_hooks": {
    "awareness_sources": [],
    "retaliation_rules": []
  },
  "hidden_systems": {
    "route_collaboration": {
      "minimum_required_chains": 1,
      "shared_evidence_completion_required": true,
      "critical_evidence_requires_alternative_paths": true,
      "minimum_alternative_trigger_sets_for_critical_evidence": 2
    },
    "evidence_reinterpretation_rules": [],
    "soft_exposure_rules": [],
    "forensics_queue_pressure_rules": {
      "enabled": true,
      "requires_player_facing_explanation": true
    },
    "trinity_awareness": {
      "starting_score": 0,
      "minimum_score": 0,
      "allow_score_decay": true,
      "early_detection_threshold": 25,
      "retaliation_thresholds": [25, 50, 75],
      "diminishing_returns_per_case": true,
      "diminishing_returns_curve": [1.0, 0.75, 0.5, 0.25]
    },
    "trinity_retaliation": {
      "vacant_role_mode": "derive_from_player_profile",
      "proxy_cover_enabled": true,
      "cooldown_ticks": 3,
      "max_events_per_case": 4,
      "stacking_rules": {
        "allow_same_tick_stack": false,
        "priority_mode": "highest_tier_only",
        "duplicate_event_policy": "reject_same_source"
      }
    },
    "vacant_role_resolution": {
      "primary_source": "route_usage_stats",
      "tie_breaker_order": [
        "first_case_closure_route",
        "chosen_specialty",
        "default_role"
      ],
      "default_role": "timeline"
    },
    "ui_anomalies": {
      "enabled": true,
      "allowed_events": []
    }
  },
  "penalty_rules": {
    "random_interrogation_limit": 3,
    "dialogue_spam_limit": 4,
    "wrong_board_connection_limit": 4,
    "false_submission_limit": 2,
    "trust_loss_per_violation": 5,
    "route_lock_threshold": {
      "mode": "progressive_friction",
      "warning_at": 1,
      "trust_loss_at": 2,
      "delay_tick_cost_at": 3,
      "delay_ticks_per_violation": 1,
      "temporary_tool_disable_at": 4,
      "temporary_disable_duration_ticks": 2,
      "binary_lock_enabled": false
    }
  },
  "transition_context_hooks": [],
  "next_case_rules": [
    {
      "rule_id": "case01_clockmaker_path",
      "priority": 100,
      "required_flags_all": ["is_clockmaker_suspicious"],
      "required_flags_any": [],
      "blocked_flags": [],
      "target_case_id": "case03",
      "target_case_path": "cases/case03/case03.md",
      "clarity_modifier": 10,
      "transition_reason": "تصاعد الشك في بصمة صانع الساعات"
    },
    {
      "rule_id": "case01_default_path",
      "priority": 10,
      "required_flags_all": [],
      "required_flags_any": [],
      "blocked_flags": [],
      "target_case_id": "case04",
      "target_case_path": "cases/case04/case04.md",
      "clarity_modifier": -5,
      "transition_reason": "التحقيق خرج بصورة أقل دقة"
    }
  ]
}
```

### ملاحظات
- `solution_paths` مفتاح أساسي ولازم يكون موجود في كل قضية.
- `closure_rules.validate_closure` يعرّف Hard Gate الإغلاق، ولا يجوز تركه للواجهة أو للتقدير الضمني.
- كل مسار من الثلاثة لا يقدم "نسخة مختلفة من القضية"، بل زاوية تحليل مختلفة لنفس الحقيقة المحلية.
- `next_case_rules` يجب أن تعتمد على الـ Flags الناتجة من إغلاق القضية، لا على رقم القضية فقط.
- `outcome_flags` هي الوعاء الرسمي لتوليد أثر القضية على الشبكة الكبرى.
- `transition_context_hooks` لا تغيّر القضية التالية نفسها، لكنها تمرر friction أو انحيازًا سرديًا/معرفيًا لبدايتها.
- `story/` يحتوي المراجع العامة فقط، بينما ملفات القضايا الفعلية تعيش داخل `cases/caseXX/`.
- `derived_route_profile` ناتج محسوب آليًا من أوزان الأدلة، وليس حقلًا يكتبه المؤلف يدويًا.
- `trinity_hooks` يصف ما الذي يرفع الوعي، وما الرد، ومن المسؤول عنه داخل هذه القضية.
- `hidden_systems.evidence_reinterpretation_rules` تعيد تفسير الأدلة من الحالة المؤكدة لا من ترتيب وصول الأحداث.
- `hidden_systems.soft_exposure_rules` تضمن تعريضًا خفيفًا لبعض الأدلة حتى لو بقيت اختيارية.
- `hidden_systems.forensics_queue_pressure_rules` تصف ضغط صف النتائج مع تفسير ظاهر للاعب.
- JSON هنا يجب أن يبقى `Declarative Data` فقط، بينما التقييم والتنفيذ الفعلي يتم داخل المحرك.

### معادلة `derived_route_profile`
- الهدف من `derived_route_profile` هو وصف المسار الفعلي الذي بناه اللاعب داخل القضية، لا المسار الذي نواه المؤلف.
- لكل Evidence عامل مساهمة حسب حالته:
  - `locked = 0.00`
  - `partial = 0.50`
  - `verified = 1.00`
  - `contested = 0.25`
  - `corrupted = 0.00`
- المعادلة الخام لكل Route هي:

```text
raw_route_score(route) =
  Σ [ evidence.route_weight(route) × state_factor(evidence.state) ]
```

- مجموع التطبيع هو:

```text
normalization_total =
  raw_route_score(timeline) +
  raw_route_score(forensics) +
  raw_route_score(behavioral)
```

- المعادلة النهائية هي:

```text
derived_route_profile(route) =
  raw_route_score(route) / normalization_total
```

- إذا كان `normalization_total = 0`:
  - تسجل كل القيم `0.0`
  - وتبقى `computed_from_evidence = false`
- إذا كان `normalization_total > 0`:
  - يجب أن يكون مجموع:
    - `timeline`
    - `forensics`
    - `behavioral`
  - مساويًا `1.0` تقريبًا بعد التقريب إلى أربع منازل عشرية.

### هيكل `next_case_rules`
- كل عنصر داخل `next_case_rules` يجب أن يحتوي على:
  - `rule_id`
  - `priority`
  - `required_flags_all`
  - `required_flags_any`
  - `blocked_flags`
  - `target_case_id`
  - `target_case_path`
  - `clarity_modifier`
  - `transition_reason`
- يتم تقييم القواعد من الأعلى أولوية إلى الأقل، وأول Rule يطابق الحالة هو الذي يحدد القضية التالية.
- `target_case_path` يجب أن يشير دائمًا إلى ملف داخل `cases/caseXX/`.

### هيكل `transition_context_hooks`
- كل عنصر داخل `transition_context_hooks` يفضل أن يحتوي على:
  - `hook_id`
  - `target_case_id`
  - `required_flags_all`
  - `blocked_flags`
  - `effect_type`
  - `effect_payload`
  - `player_facing_intent`
- هذه الـ Hooks:
  - لا تغير `target_case_id`
  - لكنها تمرر friction أو assumption أو missing line إلى القضية التالية
  - وهي مهمة لحالات `false success`

## 2. قاموس العلامات (Flags Dictionary)

### علامات المسار
- `route_timeline_favored = true`
- `route_forensics_favored = true`
- `route_behavioral_favored = true`
- `route_profile_dependent = true`
- `route_all_disciplines_required = true`
- `route_collaboration_required = true`
- `route_collaboration_completed = true`
- `resolved_as_institutional = true`
- `resolved_as_individual = true`
- `resolved_as_network_activity = true`

### علامات السمعة
- `reputation_police_trust_high = true`
- `reputation_police_trust_low = true`
- `reputation_prosecution_confident = true`
- `reputation_interrogation_aggressive = true`
- `reputation_interrogation_precise = true`

### علامات الأدلة المستمرة
- `kept_black_envelope_fragment = true`
- `recovered_archive_key_case05 = true`
- `stored_case02_password = true`
- `preserved_hidden_photo_negative = true`
- `ignored_alchemist_evidence = true`

### علامات الحقيقة الكبرى
- `is_clockmaker_suspicious = true`
- `is_alchemist_suspicious = true`
- `is_whisperer_suspicious = true`
- `trinity_pattern_detected = true`
- `trinity_awareness_rising = true`
- `trinity_awareness_falling = true`
- `trinity_retaliation_tier_1 = true`
- `trinity_retaliation_tier_2 = true`
- `trinity_retaliation_tier_3 = true`
- `empty_third_seat_hint_seen = true`
- `empty_third_seat_discovered = true`
- `dark_path_opened = true`

### علامات شذوذ الواجهة
- `ui_anomaly_inbox_retracted = true`
- `ui_anomaly_database_typo = true`
- `ui_anomaly_report_flicker = true`

### علامات العقوبات
- `penalty_random_guess_warning = true`
- `penalty_police_trust_loss = true`
- `penalty_route_temporarily_locked = true`
- `forensics_report_compromised = true`
- `witness_removed_before_testimony = true`

## 3. حالة اللاعب (Player State)

### بيانات أساسية
- `player_id: string`
- `current_case_id: string`
- `chosen_specialty: "timeline" | "forensics" | "behavioral"`
- `session_started_at: string`
- `playthrough_seed: string`
- `trinity_awareness_score: number`
- `random_guess_score: number`
- `wrong_accusation_count: number`
- `first_case_closure_route: "timeline" | "forensics" | "behavioral" | null`
- `vacant_trinity_role: "timeline" | "forensics" | "behavioral"`

### السمعة
- `police_trust_score: number`
- `prosecution_confidence_score: number`
- `psychological_pressure_score: number`
- `dark_alignment_score: number`
- `police_trust_score` يجب أن يكون Player-Facing عبر مؤشر ظاهر في الواجهة.
- `trinity_awareness_score` يجب أن يبقى Hidden State ويمكن أن يرتفع أو ينخفض.

### الأدلة المحتفظ بها
- `inventory_items: array`
- كل عنصر داخل الحقيبة يجب أن يحتوي:
  - `evidence_id`
  - `source_case_id`
  - `type`
  - `retained_reason`
  - `usable_in_future_cases`

### ذاكرة الشخصيات الممتدة
- `npc_global_memory: object`
- كل مفتاح داخل `npc_global_memory` يجب أن يكون `character_id`.
- كل سجل شخصية يفضل أن يحتوي على:
  - `relationship_score`
  - `trust_level`
  - `resentment_flags`
  - `wrongly_accused_case_ids`
  - `helped_by_player_case_ids`
  - `known_secrets`
  - `last_seen_case_id`
  - `last_outcome_summary`

### المسار المفضل
- `preferred_route: "timeline" | "forensics" | "behavioral" | "mixed"`
- `route_usage_stats`
- `route_success_stats`
- `route_lock_state: object`
- `vacant_trinity_role` يجب أن يُشتق حتميًا كالتالي:
  - المسار الأعلى في `route_usage_stats`
  - عند التعادل: `first_case_closure_route`
  - عند استمرار التعادل: `chosen_specialty`
  - عند غياب الجميع: `default_role` من `hidden_systems.vacant_role_resolution`

### القضايا المغلقة أو المفتوحة
- `opened_cases: array`
- `closed_cases: array`
- `cold_cases: array`
- `locked_cases: array`

## 4. حالة القضية (Case State)

### عداد التنفيذ
- `current_tick: number`
- `last_state_commit_tick: number`
- `last_trinity_retaliation_tick: number | null`
- `trinity_retaliation_count: number`

### ما الذي تم فتحه؟
- `opened_folders: array`
- `opened_documents: array`
- `unlocked_search_results: array`
- `board_tools_unlocked: array`
- `anomaly_events_seen: array`

### ما الذي تم قراءته؟
- `read_documents: array`
- `inspected_images: array`
- `viewed_reports: array`

### ما الذي تم ربطه؟
- `board_connections: object`
- `board_connections.nodes: array`
- كل node داخل `board_connections.nodes` يجب أن يحتوي:
  - `node_id`
  - `node_type`
  - `position.x`
  - `position.y`
  - `pinned`
  - `collapsed`
  - `z_index`
- `board_connections.links: array`
- كل link داخل `board_connections.links` يجب أن يحتوي:
  - `connection_id`
  - `from_id`
  - `to_id`
  - `relation_type`
  - `created_by_player`
- `board_connections.viewport_state: object`
- `board_connections.viewport_state` يفضل أن يحتوي:
  - `zoom`
  - `offset_x`
  - `offset_y`
- `failed_board_connections: array`
- `partial_evidence_progress: array`
- كل عنصر داخل `partial_evidence_progress` يجب أن يحتوي:
  - `evidence_id`
  - `current_state`
  - `completed_routes`
  - `completion_flags`

### مثال JSON لحالة لوحة الخيوط
```json
{
  "board_connections": {
    "nodes": [
      {
        "node_id": "suspect_01",
        "node_type": "character",
        "position": { "x": 240, "y": 180 },
        "pinned": true,
        "collapsed": false,
        "z_index": 3
      }
    ],
    "links": [
      {
        "connection_id": "link_01",
        "from_id": "suspect_01",
        "to_id": "EVID-04",
        "relation_type": "handled",
        "created_by_player": true
      }
    ],
    "viewport_state": {
      "zoom": 1.1,
      "offset_x": -120,
      "offset_y": 40
    }
  }
}
```

### ما الذي تم تقديمه كاتهام؟
- `submitted_suspect`
- `submitted_motive`
- `submitted_method_or_timeline`
- `submitted_evidence_ids`
- `certainty_score`
- `submission_attempt_count`
- `random_interrogation_count`
- `route_lock_events`
- `route_violation_counters: object`
- `route_violation_counters` يفضل أن يحتوي:
  - `timeline`
  - `forensics`
  - `behavioral`

### حالة الاستجواب
- `interrogation_sessions: array`
- كل session داخل `interrogation_sessions` يجب أن يحتوي:
  - `session_id`
  - `character_id`
  - `current_stage`
  - `asked_question_ids`
  - `burned_choice_ids`
  - `locked_choice_ids`
  - `spam_score`
  - `pressure_score`
  - `profile_match_score`
  - `aggression_score`
  - `ended_early`

## 5. هيكل الأدلة

### بيانات كل دليل
- `evidence_id: string`
- `case_id: string`
- `title: string`
- `type: "document" | "image" | "digital" | "report" | "statement" | "object"`
- `evidence_tier: "critical" | "supporting" | "flavor"`
- `evidence_role: "prove" | "unlock" | "mislead" | "context" | "carryover"`
- `summary: string`
- `content_ref: string`
- `locked: boolean`
- `requires_warrant: boolean`
- `state: "partial" | "verified" | "contested" | "corrupted"`
- `requires_route_collaboration: array`
- `depends_on_evidence_ids: array`
- `completion_triggers: array<object>`
- `upgraded_summary: string | null`
- `penalty_if_mishandled: array`

### الوسوم المرتبطة بالدليل
- `tags: array`
- أمثلة:
  - `timeline`
  - `forensics`
  - `behavioral`
  - `red_herring`
  - `grand_truth_seed`
  - `persistent`

### علاقة الدليل بالتخصصات الثلاثة
- `route_weight.timeline: number`
- `route_weight.forensics: number`
- `route_weight.behavioral: number`
- يجوز أن يكون نفس الدليل مهمًا لأكثر من تخصص لكن بدرجات مختلفة.
- إذا بدأ الدليل ناقصًا، يجب أن يحدد `requires_route_collaboration` المسار أو الحدث الذي يكمله.
- كل عنصر داخل `completion_triggers` يجب أن يحتوي على:
  - `trigger_id`
  - `availability_mode`
  - `delay_ticks`
  - `scheduled_on_event`
  - `logic_operator`
  - `conditions`
  - `on_complete`
- `availability_mode` يجب أن تكون:
  - `immediate`
  - `delayed`
- `delay_ticks`:
  - عدد الـ Ticks المطلوب انتظارها إذا كان `availability_mode = delayed`
- `scheduled_on_event`:
  - اسم الحدث الذي يبدأ منه العد إذا كان التفعيل مؤجلًا
  - ويجوز أن يكون `null` إذا كان التأخير يبدأ فور تحقق الشروط الحالية
- `logic_operator` يحدد هل تحقق `conditions` يتم عبر:
  - `any`
  - `all`
- كل condition داخل `conditions` يجب أن تحتوي على:
  - `event_name`
  - `source_type`
  - `source_ref`
  - `interaction_id`
  - `expected_player_action`
  - `required_result`
- `completion_triggers` يجب أن تصف الحدث الفعلي مثل:
  - `EVENT_INTERROGATION_NODE_UNLOCKED` لسؤال استجواب محدد مثل `INT-SUSPECT1-01:Q03`
  - `EVENT_TIMELINE_CONTRADICTION_CONFIRMED` لإثبات زمني معين مثل `TIMELINE-BOARD:LOCK-EVENT-07`
  - `EVENT_EVIDENCE_VERIFIED` عند وصول تقرير معمل أو Metadata بعينه مثل `LAB-TOX-02:RESULT-READY`
- أي Evidence حرج للإغلاق لا يجوز أن يعتمد على Trigger واحد فقط من دون بديل عادل.
- `derived_route_profile` يجب أن يُحسب من مجموع `route_weight.*` عبر الأدلة الصالحة داخل القضية.

### مثال JSON لدليل تعاوني
```json
{
  "evidence_id": "EVID-04",
  "case_id": "case01",
  "title": "Residue Trace",
  "type": "report",
  "evidence_tier": "critical",
  "evidence_role": "prove",
  "state": "partial",
  "route_weight": {
    "timeline": 0.20,
    "forensics": 0.55,
    "behavioral": 0.25
  },
  "completion_triggers": [
    {
      "trigger_id": "trig_evid04_interrogation_path",
      "availability_mode": "immediate",
      "delay_ticks": 0,
      "scheduled_on_event": null,
      "logic_operator": "all",
      "conditions": [
        {
          "event_name": "EVENT_EVIDENCE_VERIFIED",
          "source_type": "report",
          "source_ref": "LAB-TOX-02",
          "interaction_id": "RESULT-READY",
          "expected_player_action": "review_report",
          "required_result": "compound_tagged"
        },
        {
          "event_name": "EVENT_INTERROGATION_NODE_UNLOCKED",
          "source_type": "interrogation",
          "source_ref": "INT-SUSPECT1-01",
          "interaction_id": "Q03",
          "expected_player_action": "choose_dialog_option",
          "required_result": "suspect_slip_detected"
        }
      ],
      "on_complete": "upgrade_to_verified"
    },
    {
      "trigger_id": "trig_evid04_timeline_path",
      "availability_mode": "delayed",
      "delay_ticks": 2,
      "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
      "logic_operator": "all",
      "conditions": [
        {
          "event_name": "EVENT_EVIDENCE_VERIFIED",
          "source_type": "report",
          "source_ref": "LAB-TOX-02",
          "interaction_id": "RESULT-READY",
          "expected_player_action": "review_report",
          "required_result": "compound_tagged"
        },
        {
          "event_name": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
          "source_type": "timeline",
          "source_ref": "TIMELINE-BOARD",
          "interaction_id": "LOCK-EVENT-07",
          "expected_player_action": "lock_timeline_event",
          "required_result": "purchase_window_confirmed"
        }
      ],
      "on_complete": "upgrade_to_verified"
    }
  ]
}
```

### علاقة الدليل بالمسار العام
- `grand_truth_axis: array`
- أمثلة:
  - `clockmaker`
  - `alchemist`
  - `whisperer`
  - `institutional_corruption`
  - `player_recruitment`

## 6. هيكل الشخصيات

### بيانات الشخصيات
- `character_id: string`
- `name: string`
- `role_in_case: string`
- `relationship_to_victim: string`
- `occupation: string`
- `public_profile: string`

### النمط السلوكي
- `MBTI_Type: string | null`
- `Cognitive_Profile: object`
- `Cognitive_Profile` يفضل أن يحتوي على:
  - `collapse_threshold: number`
  - `lawyer_up_threshold: number`
  - `aggression_tolerance: number`
  - `rapport_affinity: number`
  - `evidence_rigidity: number`
- `pressure_response: "silence" | "ramble" | "attack" | "collapse" | "lawyer_up"`
- `deception_style: "direct" | "passive" | "gaslighting" | "protective"`

### البصمة اللغوية
- `speech_register: "formal" | "street" | "academic" | "bureaucratic"`
- `favorite_phrases: array`
- `verbal_tells: array`

### العلاقة بالقضية الحالية وبالشبكة الكبرى
- `local_function: "suspect" | "witness" | "victim" | "related"`
- `recurring_npc: boolean`
- `grand_truth_relevance: array`
- `hidden_affiliations: array`

## 7. هيكل الإغلاق والنتائج

### ما الذي يدخل في قرار الإغلاق؟
- اسم الجاني
- الدافع
- الوسيلة أو الفرصة الزمنية
- عدد الأدلة المقبولة
- درجة اليقين

### ما الذي يحسب نجاحًا كاملًا أو جزئيًا؟
- `full_success`
  - الجاني صحيح
  - الدافع صحيح
  - الوسيلة أو الفرصة صحيحة
  - 3 أدلة على الأقل صالحة
  - لا توجد عقوبة حرجة ما زالت فعالة عند الإغلاق
- `partial_success`
  - الإمساك بالمنفذ مع خطأ في الرأس المدبر أو الدافع
  - أو الوصول للحقيقة مع خسارة ثقة أو إغلاق مسار بسبب التخمين الزائد
- `failure`
  - اتهام غير صالح أو أدلة ظرفية غير كافية
  - أو تفعيل عقوبة حرجة تجعل الملف غير قابل للإغلاق القانوني في هذه المرحلة

### كيف تولد النتائج Flags جديدة؟
- كل إغلاق يولد:
  - Flags محلية للقضية
  - Flags مسارية
  - Flags تخص الحقيقة الكبرى
- مثال:
  - `is_clockmaker_suspicious = true`
  - `reputation_police_trust_low = true`
  - `kept_black_envelope_fragment = true`

## 8. الأنظمة الخفية والعقوبات

### `hidden_systems`
- `route_collaboration.minimum_required_chains`
  - يحدد أقل عدد من الأدلة الناقصة التي لا تكتمل إلا بتعاون مسارين أو أكثر.
- `route_collaboration.minimum_alternative_trigger_sets_for_critical_evidence`
  - يمنع الـ Soft Lock داخل الأدلة الحاسمة.
- `evidence_reinterpretation_rules`
  - قواعد Declarative يعاد تقييمها من `Confirmed State` بعد كل Tick.
  - الهدف هو منع كسر التفسير بسبب lag أو async ordering.
- `soft_exposure_rules`
  - تفرض تعريضًا خفيفًا لبعض الأدلة المهمة حتى لو بقيت اختيارية.
- `forensics_queue_pressure_rules`
  - تصف ضغط صف النتائج الجنائية.
  - يجب أن تقرن كل أثر فيها بتفسير ظاهر للاعب.
- `trinity_awareness`
  - مسؤول عن رفع أو خفض `trinity_awareness_score` داخل القضية.
  - ويجوز أن يحتوي على:
    - `diminishing_returns_per_case`
    - `diminishing_returns_curve`
  - حتى لا يستطيع اللاعب عمل Min-Maxing عبر تكرار نفس فئة الأفعال داخل قضية واحدة.
- `trinity_retaliation`
  - يحدد من يرد على اللاعب فعليًا إذا كان أحد مقاعد الثالوث شاغرًا.
- `trinity_retaliation.cooldown_ticks`
  - أقل عدد Ticks بين Retaliation وآخر داخل القضية نفسها.
- `trinity_retaliation.max_events_per_case`
  - السقف الأعلى لتدخلات الثالوث داخل القضية حتى لا يتحول النظام إلى فوضى.
- `trinity_retaliation.stacking_rules`
  - يحدد هل يسمح بتجميع أكثر من رد داخل نفس الـ Tick أم يطبق الأعلى أولوية فقط.
- `vacant_role_resolution`
  - يحدد الـ Tie-breaker Logic الخاصة باللاعب المتوازن.
- `ui_anomalies.allowed_events`
  - يحدد الشذوذات المسموح بها في هذه القضية فقط، حتى لا تتحول الظاهرة إلى عشوائية غير منضبطة.

### `trinity_hooks`
- `awareness_sources`
  - قائمة Declarative توضح ما الذي يرفع وعي اللاعب داخل القضية.
- `retaliation_rules`
  - قائمة Declarative توضح:
    - نوع الرد
    - شرط التفعيل
    - المسؤول الأساسي
    - المسؤول البديل إذا كان المقعد شاغرًا
    - وتخضع دائمًا لحدود `cooldown_ticks` و`max_events_per_case` و`stacking_rules`

### `penalty_rules`
- `random_interrogation_limit`
  - عدد محاولات الاستجواب العشوائي قبل أول عقوبة.
- `dialogue_spam_limit`
  - عدد الخيارات الحوارية غير المدروسة قبل بدء حرق الاختيارات أو خصم الثقة.
- `wrong_board_connection_limit`
  - عدد الروابط الخاطئة قبل خصم الثقة أو قفل أداة.
- `false_submission_limit`
  - عدد الاتهامات غير المدعومة قبل تصعيد النيابة أو رئيس الشرطة.
- `route_lock_threshold`
  - لم يعد رقمًا ثنائيًا بسيطًا.
  - يجب أن يكون Object بنمط `progressive_friction`.
  - يحدد:
    - `warning_at`
    - `trust_loss_at`
    - `delay_tick_cost_at`
    - `delay_ticks_per_violation`
    - `temporary_tool_disable_at`
    - `temporary_disable_duration_ticks`
    - `binary_lock_enabled`
  - الهدف هو زيادة الاحتكاك تدريجيًا بدل كسر القضية بقفل مباشر.

### قواعد عامة
- العقوبات يجب أن تكون متدرجة وواضحة الأثر في الحالة الخلفية حتى لو لم يشرحها النظام نصيًا بالكامل.
- شذوذات الواجهة يجب أن تأتي من `hidden_systems.ui_anomalies` لا من قرارات عشوائية في الـ Frontend.
- ارتفاع `trinity_awareness_score` يجب أن يفتح إمكانات تصعيد، لا أن يكافئ اللاعب فورًا بكشف الحقيقة الكبرى.
- انخفاض `trinity_awareness_score` مسموح إذا صدق اللاعب مشتتًا منطقيًا أو تبنى تفسيرًا فرديًا خاطئًا يبعده عن النمط الصحيح.
- `current_tick` و`last_trinity_retaliation_tick` و`trinity_retaliation_count` يجب أن تُحفظ داخل حالة القضية حتى تبقى حدود `cooldown_ticks` و`max_events_per_case` حتمية بعد إعادة التحميل.
- حالة الـ String Board لا تكتمل بحفظ الروابط فقط؛ يجب حفظ `board_connections.nodes[].position` و`board_connections.viewport_state`.
- ذاكرة الشخصيات الممتدة يجب أن تكون Player-Scoped وليست مجرد خاصية ثابتة داخل تعريف الشخصية.
- `save_version` يجب أن يبقى إجباريًا داخل ملفات الحفظ حتى يمكن تنفيذ migration آمنة عند تغير العقود.
- مكان `save_version` الرسمي هو Root Save Envelope، لا `player_state`.
- الـ Schema يجب أن يصف البيانات فقط:
  - Events المطلوبة
  - الشروط
  - thresholds
  - mappings
- أما تنفيذ الانتقال نفسه فيبقى داخل المحرك لا داخل JSON.

## 9. ملاحظات تنفيذية

- يفضل أن تكون بيانات القضايا في ملفات JSON أو بنية مكافئة قابلة للتحميل الكسول.
- يفضل أن تبقى أسماء الـ Flags مركزية في قاموس واحد لتجنب التضارب بين القضايا.
- أي قيمة يحتاجها الـ Frontend للعرض فقط يجب فصلها عن القيم التي يستخدمها المنطق الخلفي للحسم.
- يفضل أن تُعرّف الأدلة التعاونية والـ penalty tiers والـ anomaly triggers في JSON نفسه حتى يسهل اختبارها آليًا.
