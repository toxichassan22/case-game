import json
import os

os.makedirs("d:/game/cases/case07", exist_ok=True)

case_data = {
    "case_id": "case07",
    "title": "الحبر السري",
    "crime_type": "institutional_forgery_assault",
    "victim_name": "عزة سالم",
    "overview": {
        "public_summary": "اعتداء بالضرب على موظفة أرشيف بالشهر العقاري ليلاً وسرقة 6 ملفات محددة.",
        "main_question": "لماذا تُسرق عقود عقارية مسجلة بالفعل، ومن المستفيد من إخفائها؟",
        "stakes": "ربط خيوط شبكة تزوير مؤسسية ضخمة والحصول على أول دليل دامغ على عمل منظم (الثالوث)."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "اقتحام الشهر العقاري بالمعادي",
        "message": "موظفة بالمستشفى بعد اعتداء عليها في مكتبها. مسروقات محددة جداً. اذهب لمعاينة المكان وتحديد المعتدي بأسرع وقت."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-07-01",
            "case_id": "case07",
            "title": "كاميرا مراقبة الممر",
            "type": "digital",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "تظهر الكاميرا رجلاً ضخماً يقتحم المكتب الساعة 11:45 ويخرج 12:10 بيده ملفات.",
            "content_ref": "CASE07_CAM_HALLWAY",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": [],
            "tags": ["timeline", "suspect_link"],
            "route_weight": { "timeline": 0.80, "forensics": 0.0, "behavioral": 0.20 },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-07-02",
            "case_id": "case07",
            "title": "شهادة عزة (الوشم والسجائر)",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "عزة تؤكد المعتدي كان تفوح منه رائحة تبغ مستورد (كابتن) ويحمل وشماً لعقرب على يده اليمنى.",
            "content_ref": "CASE07_AZZA_STATEMENT",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_suspect_match",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-GABER-01",
                            "interaction_id": "Q02",
                            "expected_player_action": "interrogate",
                            "required_result": "scorpion_tattoo_and_smoke_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "مواصفات المعتدي تتطابق كلياً مع جابر عبد الحليم، مندوب الشركة العقارية.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "suspect_link"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 0.90 },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-07-03",
            "case_id": "case07",
            "title": "النسخ الضوئية للعقود (Flash Drive)",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "فلاش ميموري لعزة يحتوي على صور العقود الستة المسروقة قبل ضياعها.",
            "content_ref": "CASE07_AZZA_USB",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["cyber"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_contract_analysis",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-DOC-07",
                            "interaction_id": "INK-ANALYSIS",
                            "expected_player_action": "review_report",
                            "required_result": "institutional_forgery_ink_detected"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "العقود تحمل توقيعات مزورة. نوع الحبر المستخدم متطابق لتكوين حبر وثائق 'مصر الجديدة' (من Case 05).",
            "penalty_if_mishandled": ["penalty_police_trust_loss"],
            "tags": ["cyber", "forensics", "institutional_corruption", "carryover_link"],
            "route_weight": { "timeline": 0.0, "forensics": 0.80, "behavioral": 0.0 },
            "grand_truth_axis": ["institutional_corruption"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-07-01",
            "name": "جابر عبد الحليم",
            "role_in_case": "Primary Target",
            "relationship_to_victim": "المعتدي (بدون معرفة سابقة)",
            "occupation": "سائق / مندوب شركة",
            "public_profile": "مندوب معاملات بأجر لشركة عقارية وسوابق شغب.",
            "MBTI_Type": "ESTP",
            "cognitive_profile": {
                "base_collapse_threshold": 3,
                "base_lawyer_up_threshold": 8,
                "aggression_tolerance": 7,
                "rapport_affinity": 2,
                "evidence_rigidity": 5
            },
            "pressure_response": "anger",
            "deception_style": "defensive",
            "speech_register": "street",
            "favorite_phrases": ["أنا ماليش دعوة، دول ناس ما تتقدرش"],
            "verbal_tells": ["تحريك اليد اليمنى لإخفاء الوشم عند سؤاله عن المكتب"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": ["Corporate Pawn"],
            "hidden_affiliations": ["Institutional Forgery Ring"]
        }
    ],
    "witnesses": [
        {
            "character_id": "WIT-07-01",
            "name": "عزة سالم",
            "role_in_case": "Victim",
            "relationship_to_victim": "الضحية نفسها",
            "occupation": "موظفة أرشيف",
            "public_profile": "سيدة أعمال قوية الإرادة وتفاصيل ذاكرتها دقيقة.",
            "MBTI_Type": "ISTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 9,
                "base_lawyer_up_threshold": 3,
                "aggression_tolerance": 8,
                "rapport_affinity": 7,
                "evidence_rigidity": 8
            },
            "pressure_response": "logic",
            "deception_style": "direct",
            "speech_register": "formal",
            "favorite_phrases": ["أنا ست بمية راجل، مش هسيب حقي"],
            "verbal_tells": [],
            "local_function": "witness",
            "recurring_npc": False,
            "grand_truth_relevance": [],
            "hidden_affiliations": []
        }
    ],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case07_resolved_true", "case07_assault_resolved", "forgery_network_confirmed", "same_ink_pattern", "cooperative_evidence_first"],
        "partial": ["case07_assault_resolved"],
        "failure": ["case07_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تأكيد اقتحام جابر في 11:45 من الكاميرا."
        },
        "forensics": {
            "description": "التحليل الكيميائي لصور العقود في الفلاش ميموري ومطابقتها بحبر التزوير."
        },
        "behavioral": {
            "description": "استجواب جابر ودفعه للاعتراف بوجود شركاء أكبر باستخدام شهادة عزة عن الوشم والسجائر."
        }
    },
    "derived_route_profile": {
        "timeline": 0.30,
        "forensics": 0.40,
        "behavioral": 0.30,
        "raw_scores": {
            "timeline": 1.1,
            "forensics": 1.2,
            "behavioral": 1.5
        },
        "normalization_total": 3.8,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": True,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_conceal_forgery_network"],
        "false_success_motive_ids": ["motive_petty_theft"],
        "false_success_flag": "case07_resolved_false",
        "accepted_motive_ids": ["motive_conceal_forgery_network", "motive_petty_theft"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-07-02"],
            "cross_route_evidence_ids": ["EVID-07-03"],
            "rejected_submission_reason_codes": ["missing_forgery_link"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "linking_ink_between_cases"
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
        "evidence_reinterpretation_rules": [
             {
                "target_evidence_id": "EVID-07-03",
                "recompute_each_tick": True,
                "state_predicates_true": [
                    {
                        "fact_type": "global_flag",
                        "ref": "usb_evidence_collected",
                        "equals": True
                    }
                ],
                "on_true": {
                    "set_evidence_summary": "العقود مزورة بنفس حبر شبكة 'مصر الجديدة' (القضية 05)، مما يؤكد الطابع المؤسسي وتورط منظمة كبرى.",
                    "set_evidence_tags": ["forgery_network_confirmed"],
                    "set_flags": ["forgery_network_confirmed"]
                }
            }
        ],
        "soft_exposure_rules": [],
        "forensics_queue_pressure_rules": {
            "enabled": True,
            "pressure_increment": 2,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-07-03"
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
            "allowed_events": []
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
            "rule_id": "case07_success",
            "priority": 100,
            "required_flags_all": ["case07_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case08",
            "target_case_path": "cases/case08/case08.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي للتحقيق."
        }
    ]
}

with open("d:/game/cases/case07/case07.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case07.json")

