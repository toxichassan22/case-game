import json
import os

os.makedirs("d:/game/cases/case10", exist_ok=True)

case_data = {
    "case_id": "case10",
    "title": "الشريك الصامت",
    "crime_type": "syndicate_assassination",
    "victim_name": "هشام المغربي",
    "overview": {
        "public_summary": "وفاة غرقاً لرئيس شركة عقارية كبرى في مسبح فيلته الخاصة بالقطامية.",
        "main_question": "هل يمتلك شريكه الغاضب القدرة على إيقاف شبكة الكاميرات وادعاء الغرق بحقنة مخدرة معقدة؟",
        "stakes": "ربط الخيوط النهائية للقوس الأول واكتشاف هوية الكيان الجامع لـ 'الخيميائي' و 'صانع الساعات'."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "غرق مستثمر كبري في ظروف غامضة",
        "message": "هشام المغربي وجد ميتاً داخل مسبحه. مباحث العاصمة أحالت لنا الملف لوجود شبهة تخدير سابق وغياب مقلق في تسجيلات الكاميرات."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-10-01",
            "case_id": "case10",
            "title": "تحليل السموم المتطابق",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "عينات الدم تظهر تخديره بمركب كيميائي نادر قبل غرقه.",
            "content_ref": "CASE10_TOXICOLOGY_REPORT",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_alchemist_match",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-MED-10",
                            "interaction_id": "COMPOUND-MATCH",
                            "expected_player_action": "review_report",
                            "required_result": "alchemist_compound_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المركب المخدر مطابق لترياق القضايا 01 و 05. الخيميائي وفر أداة الجريمة الصامتة.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_link"],
            "route_weight": { "timeline": 0.0, "forensics": 0.90, "behavioral": 0.10 },
            "grand_truth_axis": ["alchemist", "trinity"]
        },
        {
            "evidence_id": "EVID-10-02",
            "case_id": "case10",
            "title": "تعطل الكاميرات الزمني",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "نظام الحماية تعطل بشكل غامض لمدة 6 دقائق والسيرفر لم يسجل الدخول.",
            "content_ref": "CASE10_SECURITY_FOOTAGE_LOG",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_clockmaker_match",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "digital",
                            "source_ref": "CASE10_SECURITY_FOOTAGE_LOG",
                            "interaction_id": "DOWNTIME_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "symmetry_detected_0330"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الانقطاع بدأ الساعة 03:30 وانتهى 03:36. الكاميرات لم تكسر، بل تم إطفاؤها باستخدام كود متناظر. صانع الساعات مهد الطريق.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker_link"],
            "route_weight": { "timeline": 0.80, "forensics": 0.20, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker", "trinity"]
        },
        {
            "evidence_id": "EVID-10-03",
            "case_id": "case10",
            "title": "ملفات الشركة وغسيل الأموال",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "الشركة العقارية حولت 47 مليون جنيه لحسابات مشبوهة.",
            "content_ref": "CASE10_FINANCIAL_RECORDS",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_company_front",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-DOC-10",
                            "interaction_id": "FINANCIAL-AUDIT",
                            "expected_player_action": "review_report",
                            "required_result": "laundering_network_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "هذه الحسابات تتطابق مع تحويلات الهاكر في القضية 08 وتمويل تدمير الأرشيف في القضية 05.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "corporate_front", "trinity_network"],
            "route_weight": { "timeline": 0.20, "forensics": 0.60, "behavioral": 0.20 },
            "grand_truth_axis": ["trinity"]
        },
        {
            "evidence_id": "EVID-10-04",
            "case_id": "case10",
            "title": "اعترافات الشريك بالخوف",
            "type": "document",
            "evidence_tier": "supporting",
            "evidence_role": "prove",
            "summary": "سامح، شريكه، يقول أن الضحية كان مرعوباً ويريد الانسحاب.",
            "content_ref": "CASE10_SAMEH_INTERROGATION",
            "locked": True,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": ["EVID-10-03"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid04_nasser_link",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-SAMEH-01",
                            "interaction_id": "Q05",
                            "expected_player_action": "interrogate",
                            "required_result": "fear_of_the_network"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "يقول سامح 'الناس دي لو عرفوا إني عايز أمشي هيعملوا فيا زي ما عملوا في ناصر'. ناصر من Case 05 قُتل بدم بارد للتغطية.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "institutional_fear"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["trinity"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-10-01",
            "name": "سامح",
            "role_in_case": "Distraction",
            "relationship_to_victim": "شريك الضحية",
            "occupation": "مدير تنفيذي",
            "public_profile": "رجل أعمال محاصر بالديون، يفتقر للدهاء التقني أو الكيميائي اللازم للتنفيذ المعقد.",
            "MBTI_Type": "ESTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 4,
                "base_lawyer_up_threshold": 6,
                "aggression_tolerance": 5,
                "rapport_affinity": 2,
                "evidence_rigidity": 5
            },
            "pressure_response": "collapse",
            "deception_style": "defensive",
            "speech_register": "professional",
            "favorite_phrases": ["هشام ورطنا مع جهات مالناش سيطرة عليها"],
            "verbal_tells": ["يرتعش صوته عند ذكر الأموال"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": [],
            "hidden_affiliations": []
        }
    ],
    "witnesses": [],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case10_resolved_true", "arc1_complete", "trinity_first_identified", "shadow_first_message", "trinity_awareness_maxed"],
        "partial": ["arc1_complete"],
        "failure": ["case10_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تحليل توقيت تعطيل الكاميرات والربط مع الحسابات المتقاطعة."
        },
        "forensics": {
            "description": "اكتشاف السم المتطابق وغسيل الأموال في أوراق الشركة الحقيقية."
        },
        "behavioral": {
            "description": "دفع الشريك للانهيار والاعتراف بوجود 'الناس اللي فوق' وكشف الرابط مع جريمة ناصر الوهمية."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.45,
        "behavioral": 0.20,
        "raw_scores": {
            "timeline": 1.0,
            "forensics": 1.7,
            "behavioral": 1.1
        },
        "normalization_total": 3.8,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": False,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 4,
        "accepted_true_motive_ids": ["motive_trinity_liquidation"],
        "false_success_motive_ids": ["motive_partner_financial_dispute"],
        "false_success_flag": "case10_resolved_false",
        "accepted_motive_ids": ["motive_trinity_liquidation", "motive_partner_financial_dispute"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-10-04"],
            "cross_route_evidence_ids": ["EVID-10-01", "EVID-10-02"],
            "rejected_submission_reason_codes": ["missing_network_link"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "trinity_network_unified"
        ],
        "retaliation_rules": []
    },
    "hidden_systems": {
        "route_collaboration": {
            "minimum_required_chains": 1,
            "shared_evidence_completion_required": True,
            "critical_evidence_requires_alternative_paths": False,
            "minimum_alternative_trigger_sets_for_critical_evidence": 0
        },
        "evidence_reinterpretation_rules": [],
        "ui_feedback_rules": [],
        "soft_exposure_rules": [],
        "forensics_queue_pressure_rules": {
            "enabled": True,
            "pressure_increment": 2,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-10-01"
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
            "allowed_events": [
                {
                    "event_name": "EVENT_EVIDENCE_VERIFIED",
                    "requires_flag": "trinity_first_identified",
                    "behavior": "SHOW_SHADOW_MESSAGE"
                }
            ]
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
            "rule_id": "case10_success",
            "priority": 100,
            "required_flags_all": ["case10_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case11",
            "target_case_path": "cases/case11/case11.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم تلقائي للقوس السردي الثاني."
        }
    ]
}

with open("d:/game/cases/case10/case10.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case10.json")
