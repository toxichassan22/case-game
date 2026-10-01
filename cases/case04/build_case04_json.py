import json
import os

case_data = {
    "case_id": "case04",
    "title": "الموظف المثالي",
    "crime_type": "covert_assassination_forgery",
    "victim_name": "محمود السعيد",
    "overview": {
        "public_summary": "موظف أرشيف بسيط يعثر عليه ميتاً بسكتة دماغية (ارتفاع ضغط الدم) في منزله. يبدو الأمر كوفاة طبيعية.",
        "main_question": "لماذا تمتهن عصابة محترفة اغتيال رجل بلا أعداء؟",
        "stakes": "تمرير عقد مزور قد يكلف الدولة أراضي بـ 4 مليار جنيه لصالح شركة الرمال الذهبية."
    },
    "inbox_brief": {
        "sender": "Chief Desk",
        "subject": "وفاة طبيعية مشبوهة - موظف الشهر العقاري",
        "message": "رجل مسن مات ببيته بسكتة، لا شبهة مبدئية. لكنه المتصرف الوحيد في أرشيف الشهر العقاري القديم. راجع الشقة وتأكد."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-04-01",
            "case_id": "case04",
            "title": "أثر الحقنة الميكروسكوبية",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "نقطة صغيرة خلف الأذن لا يمكن رؤيتها بالعين المجردة تتعلق بموقع الحقن.",
            "content_ref": "CASE04_BODY_NECK",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_tox_screen",
                    "availability_mode": "delayed",
                    "delay_ticks": 2,
                    "scheduled_on_event": "EVENT_EVIDENCE_SUBMITTED_TO_LAB",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-TOX-04",
                            "interaction_id": "RESULT-READY",
                            "expected_player_action": "review_report",
                            "required_result": "synthetic_epinephrine_detected"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تأكيد طبي أن الوفاة ليست سكتة طبيعية بل نتيجة جرعة اصطناعية مفرطة لرفع الضغط بشكل يتسبب بانفجار المخ.",
            "penalty_if_mishandled": ["penalty_police_trust_loss"],
            "tags": ["forensics", "grand_truth_seed", "alchemist", "murder_weapon"],
            "route_weight": {
                "timeline": 0.0,
                "forensics": 0.70,
                "behavioral": 0.0
            },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-04-02",
            "case_id": "case04",
            "title": "ميدالية المفاتيح الممسوحة",
            "type": "object",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "ميدالية المفاتيح الخاصة بالعمل في المنزل ممسوحة تماماً من أية بصمات.",
            "content_ref": "CASE04_KEYSET",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_fingerprints",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "OBJECT_INSPECTED",
                            "source_type": "object",
                            "source_ref": "CASE04_KEYSET",
                            "interaction_id": "DUSTING",
                            "expected_player_action": "inspect_object",
                            "required_result": "keys_wiped_clean"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المفاتيح استخدمت ومسحت بدقة لعدم ترك دليل. الجريمة استهدفت الأرشيف.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "behavioral", "motive"],
            "route_weight": {
                "timeline": 0.30,
                "forensics": 0.20,
                "behavioral": 0.10
            },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-04-03",
            "case_id": "case04",
            "title": "العقد رقم 35 (الأراضي)",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "عقد أرض بقيمة 4 مليارات لصالح الرمال الذهبية في ملفات 1990.",
            "content_ref": "CASE04_FORGED_DEED",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": ["EVID-04-02"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_ink_test",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-DOC-04",
                            "interaction_id": "INK-ANALYSIS",
                            "expected_player_action": "review_report",
                            "required_result": "thermal_aging_detected"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الحبر تم تعريضه لتقادم حراري ميكرويفي ليبدو من السبعينات ولكنه مستحدث.",
            "penalty_if_mishandled": ["delay_tick_cost_at"],
            "tags": ["forensics", "forgery_exposed", "grand_truth_seed", "clockmaker"],
            "route_weight": {
                "timeline": 0.10,
                "forensics": 0.60,
                "behavioral": 0.10
            },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-04-04",
            "case_id": "case04",
            "title": "سجل الكاميرا 34 - الأرشيف",
            "type": "digital",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "عطل مصطنع لمدة 6 دقائق فجراً عبر استدعاء صيانة وهمي من داخل السيستم.",
            "content_ref": "CASE04_CCTV_LOG",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker"],
            "route_weight": {
                "timeline": 0.60,
                "forensics": 0.0,
                "behavioral": 0.0
            },
            "grand_truth_axis": ["clockmaker"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-04-NONE",
            "name": "مجهول / العصابة (صانع الساعات والخيميائي)",
            "role_in_case": "Primary Target",
            "relationship_to_victim": "غير معروف",
            "occupation": "شبكة اغتيال وتزوير",
            "public_profile": "كيان وهمي يدير الاغتيالات الباردة.",
            "MBTI_Type": "INTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 10,
                "base_lawyer_up_threshold": 1,
                "aggression_tolerance": 5,
                "rapport_affinity": -5,
                "evidence_rigidity": 10
            },
            "pressure_response": "silence",
            "deception_style": "passive",
            "speech_register": "formal",
            "favorite_phrases": [],
            "verbal_tells": [],
            "local_function": "suspect",
            "recurring_npc": True,
            "grand_truth_relevance": ["Core Trinity Members"],
            "hidden_affiliations": ["The Shadow"]
        }
    ],
    "witnesses": [
        {
            "character_id": "WIT-04-01",
            "name": "عماد السيد",
            "role_in_case": "Reporter / Colleague",
            "relationship_to_victim": "زميل في الأرشيف",
            "occupation": "موظف حكومي",
            "public_profile": "موظف يعلم بصلاحية المفاتيح الوحيدة مع محمود.",
            "MBTI_Type": "ISFJ",
            "cognitive_profile": {
                "base_collapse_threshold": 4,
                "base_lawyer_up_threshold": 6,
                "aggression_tolerance": 2,
                "rapport_affinity": 4,
                "evidence_rigidity": 3
            },
            "pressure_response": "collapse",
            "deception_style": "protective",
            "speech_register": "street",
            "favorite_phrases": ["العهدة دي رقبة يا باشا"],
            "verbal_tells": ["التلفت المحذر عند ذكر الأرشيف"],
            "local_function": "witness",
            "recurring_npc": False,
            "grand_truth_relevance": [],
            "hidden_affiliations": []
        },
        {
            "character_id": "WIT-04-02",
            "name": "تامر",
            "role_in_case": "Informant",
            "relationship_to_victim": "لا يوجد",
            "occupation": "مخبر سيبراني مخترق سيستم",
            "public_profile": "يفهم في تعقيدات الاختراق الرقمي الفائق للثلث.",
            "MBTI_Type": "INTP",
            "cognitive_profile": {
                "base_collapse_threshold": 6,
                "base_lawyer_up_threshold": 8,
                "aggression_tolerance": 4,
                "rapport_affinity": 6,
                "evidence_rigidity": 7
            },
            "pressure_response": "ramble",
            "deception_style": "direct",
            "speech_register": "street",
            "favorite_phrases": ["ده لعب دكاترة يا باشا"],
            "verbal_tells": ["حماس شديد للاختراق"],
            "local_function": "informant",
            "recurring_npc": True,
            "grand_truth_relevance": ["Identifies Clockmaker signature"],
            "hidden_affiliations": ["Underworld"]
        }
    ],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case04_resolved_true", "trinity_awareness_boost", "clockmaker_tagged", "forgery_exposed"],
        "partial": ["case04_resolved_partial", "player_reputation_drop"],
        "failure": ["case04_resolved_false", "corruption_wins", "alchemist_ghost", "player_reputation_drop"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استخدام سجل الكاميرا وتوقيت وفاة محمود لإثبات وجود تغطية زمنية لسرقة الملف."
        },
        "forensics": {
            "description": "تحليل الجثة لإثبات التسمم المستتر وتحليل حبر العقد لإثبات حداثة التزوير الكيميائي."
        },
        "behavioral": {
            "description": "استجواب عماد عن استحالة التزوير بدون المفتاح، ثم استجواب تامر لاستنتاج نوع المعتدي من هويته التقنية."
        }
    },
    "derived_route_profile": {
        "timeline": 0.30,
        "forensics": 0.50,
        "behavioral": 0.20,
        "raw_scores": {
            "timeline": 0.9,
            "forensics": 1.5,
            "behavioral": 0.6
        },
        "normalization_total": 3.0,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": True,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_archive_infiltration"],
        "false_success_motive_ids": ["motive_natural_stroke"],
        "false_success_flag": "case04_resolved_false",
        "accepted_motive_ids": ["motive_archive_infiltration", "motive_natural_stroke"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 0,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": True,
            "behavioral_chain_evidence_ids": [],
            "cross_route_evidence_ids": ["EVID-04-03"],
            "rejected_submission_reason_codes": ["missing_forgery_evidence"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "detecting_epinephrine_injection_mark",
            "detecting_thermal_aging_ink",
            "detecting_6_min_cctv_logic_flaw"
        ],
        "retaliation_rules": [
            {
                "type": "evidence_tampering",
                "condition": "trinity_awareness_score_exceeds_threshold",
                "primary_actor": "Clockmaker",
                "backup_actor": "Alchemist"
            }
        ]
    },
    "hidden_systems": {
        "route_collaboration": {
            "minimum_required_chains": 1,
            "shared_evidence_completion_required": True,
            "critical_evidence_requires_alternative_paths": False,
            "minimum_alternative_trigger_sets_for_critical_evidence": 1
        },
        "evidence_reinterpretation_rules": [],
        "soft_exposure_rules": [],
        "forensics_queue_pressure_rules": {
            "enabled": True,
            "pressure_increment": 2,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-04-03"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 0,
            "minimum_score": 0,
            "allow_score_decay": False,
            "early_detection_threshold": 10,
            "retaliation_thresholds": [10, 20, 30],
            "diminishing_returns_per_case": True,
            "diminishing_returns_curve": [1.0, 0.5, 0.25, 0.0]
        },
        "trinity_retaliation": {
            "vacant_role_mode": "derive_from_player_profile",
            "proxy_cover_enabled": True,
            "cooldown_ticks": 5,
            "max_events_per_case": 2,
            "stacking_rules": {
                "allow_same_tick_stack": False,
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
            "default_role": "forensics"
        },
        "ui_anomalies": {
            "enabled": True,
            "allowed_events": ["ui_anomaly_report_flicker"]
        }
    },
    "penalty_rules": {
        "random_interrogation_limit": 2,
        "dialogue_spam_limit": 3,
        "wrong_board_connection_limit": 3,
        "false_submission_limit": 2,
        "trust_loss_per_violation": 10,
        "route_lock_threshold": {
            "mode": "progressive_friction",
            "warning_at": 1,
            "trust_loss_at": 2,
            "delay_tick_cost_at": 3,
            "delay_ticks_per_violation": 2,
            "temporary_tool_disable_at": 4,
            "temporary_disable_duration_ticks": 3,
            "binary_lock_enabled": False
        }
    },
    "transition_context_hooks": [],
    "next_case_rules": [
        {
            "rule_id": "case04_success",
            "priority": 100,
            "required_flags_all": ["case04_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case05",
            "target_case_path": "cases/case05/case05.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي بعد ملاحقة أثر الثالوث في العقد المزور."
        },
        {
            "rule_id": "case04_fail",
            "priority": 10,
            "required_flags_all": ["case04_resolved_false"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case05",
            "target_case_path": "cases/case05/case05.json",
            "clarity_modifier": -5,
            "transition_reason": "فشل المحقق في كشف الاغتيال، مما يعزز قوة الثالوث ويمنع الرؤية في القادم."
        }
    ]
}

with open("d:/game/cases/case04/case04.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case04.json")
