import json
import os

case_data = {
    "case_id": "case03",
    "title": "حبة رصاص",
    "crime_type": "chemical_poisoning",
    "victim_name": "حسن توفيق المنصوري",
    "overview": {
        "public_summary": "وفاة تبدو طبيعية إثر أزمة قلبية حادة بسبب التاريخ المرضي، هكذا قرر الإسعاف. لكن الابنة تصر على وجود شبهة جنائية بسبب خلافات مالية محتدمة.",
        "main_question": "هل مات حسن المنصوري بقلبه أم بدواء قلبه؟",
        "stakes": "إقفال القضية كوفاة طبيعية يسمح لسم قاتل وتجارة موت صامتة بالتوغل في المدينة عبر 'الخيميائي'."
    },
    "inbox_brief": {
        "sender": "سمر المنصوري",
        "subject": "طلبي للشرطة في وفاة والدي طبيعيا كذب!",
        "message": "أبي لم يمت وفاة طبيعية! جاء الإسعاف ورفضوا الاستماع لي. لقد كان هناك شجار بينه وبين ابن عمي عادل قبل وفاته بقليل. أرجوكم، افحصوا جثته مجدداً ومسرح الجريمة قبل دفنه."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-03-01",
            "case_id": "case03",
            "title": "علبة الديجوكسين المهندسة",
            "type": "object",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "شريط دواء ديجوكسين. الجرعة الأولى فارغة (مُشروطة صباحا)، والثانية فارغة أيضا (تناولها الساعة 8 مساءا).",
            "content_ref": "CASE03_MED_BOX",
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
                            "source_ref": "LAB-TOX-03",
                            "interaction_id": "RESULT-READY",
                            "expected_player_action": "review_report",
                            "required_result": "cyanide_analog_detected"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تقرير السموم يثبت أن الكبسولة لم تحتو على ديجوكسين، بل على 'Cyanide-Analog-B12'، سم مصمم بعناية ليحاكي الأزمة القلبية ولا يظهر في التحليل العام. تغليف الشريط يحتوي على خطوط مائلة عند حوافه (بصمة الخيميائي).",
            "penalty_if_mishandled": ["penalty_police_trust_loss"],
            "tags": ["forensics", "grand_truth_seed", "alchemist", "murder_weapon"],
            "route_weight": {
                "timeline": 0.10,
                "forensics": 0.60,
                "behavioral": 0.30
            },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-03-02",
            "case_id": "case03",
            "title": "سجل هاتف الضحية والمكالمات الواردة",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "سجل مكالمات الضحية يُظهر اتصال لم يرد عليه من 'عادل المنصوري' في تمام الساعة 8:15 مساءً.",
            "content_ref": "CASE03_VICTIM_PHONE",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": [],
            "tags": ["timeline", "behavioral"],
            "route_weight": {
                "timeline": 0.50,
                "forensics": 0.0,
                "behavioral": 0.50
            },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-03-03",
            "case_id": "case03",
            "title": "سجلات الحوالات الوهمية",
            "type": "document",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "إيصالات تحويلات بقيمة 50 ألف جنيه من محفظة عادل قبل 5 أيام من الجريمة لأرقام غير مسجلة.",
            "content_ref": "CASE03_ADEL_FINANCE",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": ["delay_tick_cost_at"],
            "tags": ["timeline", "motive"],
            "route_weight": {
                "timeline": 0.40,
                "forensics": 0.40,
                "behavioral": 0.20
            },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-03-04",
            "case_id": "case03",
            "title": "بقعة الماء المجهرية",
            "type": "object",
            "evidence_tier": "flavor",
            "evidence_role": "context",
            "summary": "بقعة ماء جافة بجوار ساق طاولة المعيشة، تتعارض كلياً مع طبيعة الضحية المهووسة بالنظام.",
            "content_ref": "CASE03_WATER_STAIN",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": [],
            "tags": ["timeline", "behavioral"],
            "route_weight": {
                "timeline": 0.20,
                "forensics": 0.10,
                "behavioral": 0.20
            },
            "grand_truth_axis": []
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-03-01",
            "name": "عادل المنصوري",
            "role_in_case": "Primary Target",
            "relationship_to_victim": "ابن أخ הضحية والمقترض لدیه",
            "occupation": "عاطل / مقامر كريبتو",
            "public_profile": "رجل مهزوز وغارق في الديون وعلاقات مشبوهة.",
            "MBTI_Type": "ESTP",
            "cognitive_profile": {
                "base_collapse_threshold": 6,
                "base_lawyer_up_threshold": 5,
                "aggression_tolerance": 2,
                "rapport_affinity": -1,
                "evidence_rigidity": 8
            },
            "pressure_response": "collapse",
            "deception_style": "passive",
            "speech_register": "street",
            "favorite_phrases": ["ده قضاء ربنا يا بيه", "نقصني إيه عشان أعمل كده"],
            "verbal_tells": ["النظر للأسفل عند التحدث عن تفاصيل الزمن", "التعرق الغزير عند ذكر الدواء"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": ["used by Alchemist"],
            "hidden_affiliations": ["Dark Web users"]
        }
    ],
    "witnesses": [
        {
            "character_id": "WIT-03-01",
            "name": "سمر المنصوري",
            "role_in_case": "Reporter / Daughter",
            "relationship_to_victim": "الابنة",
            "occupation": "مديرة موارد بشرية",
            "public_profile": "حازمة ومدققة في شؤون والدها الطبية.",
            "MBTI_Type": "ISTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 8,
                "base_lawyer_up_threshold": 8,
                "aggression_tolerance": 4,
                "rapport_affinity": 5,
                "evidence_rigidity": 5
            },
            "pressure_response": "attack",
            "deception_style": "protective",
            "speech_register": "formal",
            "favorite_phrases": ["أبويا كان راجل منظم جدا", "مستحيل يكون مات كده"],
            "verbal_tells": ["النفي القاطع لأي تهاون من الضحية"],
            "local_function": "witness",
            "recurring_npc": False,
            "grand_truth_relevance": [],
            "hidden_affiliations": []
        }
    ],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case03_resolved_true", "alchemist_file_opened", "middleman_ahmed_tagged"],
        "partial": ["case03_resolved_partial", "player_reputation_drop"],
        "failure": ["case03_resolved_false", "samar_enemy", "alchemist_invisible", "player_reputation_drop"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استخدام بقعة الماء وتناقض موعد اتصال عادل مع موعد شرب الدواء لإثبات انتظاره لوفاة عمه."
        },
        "forensics": {
            "description": "إرسال الشريط المتبقي للفحص المجهري والسموم لكشف السم المُصمم بدلاً من الديجوكسين والتغليف المُعدل."
        },
        "behavioral": {
            "description": "انهيار عادل من خلال استجوابه ودفعه للاعتراف بصفقة הـ 50 ألف جنيه وشراء السم من المندوب 'أحمد'."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.45,
        "behavioral": 0.20,
        "raw_scores": {
            "timeline": 1.2,
            "forensics": 1.1,
            "behavioral": 1.2
        },
        "normalization_total": 3.5,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": True,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_adel_debts_extortion"],
        "false_success_motive_ids": ["motive_natural_heart_attack"],
        "false_success_flag": "case03_resolved_false",
        "accepted_motive_ids": ["motive_adel_debts_extortion", "motive_natural_heart_attack"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 0,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": True,
            "behavioral_chain_evidence_ids": [],
            "cross_route_evidence_ids": ["EVID-03-01"],
            "rejected_submission_reason_codes": ["missing_chemical_evidence"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "detecting_alchemist_printing_on_blister_pack",
            "choosing_manipulated_motive_over_direct_murder"
        ],
        "retaliation_rules": [
            {
                "type": "evidence_tampering",
                "condition": "trinity_awareness_score_exceeds_threshold",
                "primary_actor": "Alchemist",
                "backup_actor": "None"
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
                "before_evidence_verified": "EVID-03-01"
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
            "default_role": "timeline"
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
            "rule_id": "case03_success",
            "priority": 100,
            "required_flags_all": ["case03_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case04",
            "target_case_path": "cases/case04/case04.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي بعد إثبات جريمة الاغتيال المكتملة وفتح ملف الخيميائي."
        },
        {
            "rule_id": "case03_fail",
            "priority": 10,
            "required_flags_all": ["case03_resolved_false"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case04",
            "target_case_path": "cases/case04/case04.json",
            "clarity_modifier": -5,
            "transition_reason": "فشل المحقق في كشف المؤامرة، القضية القادمة تبدأ بتعتيم أكبر."
        }
    ]
}

with open("d:/game/cases/case03/case03.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case03.json")
