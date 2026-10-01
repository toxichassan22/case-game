import json
import os

os.makedirs("d:/game/cases/case14", exist_ok=True)

case_data = {
    "case_id": "case14",
    "title": "الميزانية",
    "crime_type": "institutional_corruption",
    "victim_name": "مرضى مستشفى إمبابة (5 مصابين)",
    "overview": {
        "public_summary": "تدهور حالة 5 مرضى في مستشفى حكومي بعد إعطائهم أدوية جديدة مغشوشة.",
        "main_question": "هل هذه مجرد شركة أدوية مهملة جديدة، أم أن فارما لينك عادت بجلد جديد؟",
        "stakes": "إدراك أن الثالوث يتأقلم ويجدد أذرعه التشغيلية، واكتشاف المنسق الأوسط 'أحمد'."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "طوارئ في إمبابة",
        "message": "عناية مركزة استقبلت 5 حالات تسمم من داخل نفس المستشفى. الأطباء شاكين في توريدة أدوية لشركة اسمها 'ميدي كير'. افتح تحقيق في الميناء والمخازن فوراً."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-14-01",
            "case_id": "case14",
            "title": "عبوات 'ميدي كير' المغشوشة",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "عينات من الأدوية المعطاة للمرضى الخمسة، التغليف يبدو سليماً لكن البارکود مزيف.",
            "content_ref": "CASE14_MEDICARE_SAMPLES",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_fake_barcode",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "physical",
                            "source_ref": "CASE14_MEDICARE_SAMPLES",
                            "interaction_id": "BARCODE_CHECK",
                            "expected_player_action": "inspect_evidence",
                            "required_result": "barcode_unregistered"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الأرقام التسلسلية غير مسجلة في هيئة الدواء. نفس تقنية التزوير المتطورة المكتشفة في عبوات 'فارما لينك' (قضية 03).",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "counterfeit_drugs"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist", "corruption"]
        },
        {
            "evidence_id": "EVID-14-02",
            "case_id": "case14",
            "title": "مقارنة كيميائية طيفية",
            "type": "report",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "تحليل معملي للمادة الفعالة داخل العبوات الجديدة المشبوهة.",
            "content_ref": "LAB-CHEM-14",
            "locked": True,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": ["EVID-14-01"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_alchemist_signature",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-CHEM-14",
                            "interaction_id": "SPECTRAL_MATCH_03",
                            "expected_player_action": "review_report",
                            "required_result": "chemical_signature_matched"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "شكل البلورات وتوزيع الشوائب يطابق تماماً عينات القضية 03 المرفوعة سابقاً. الصيدلي (الخيميائي) الذي يركب هذه السموم هو شخص واحد.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_trace", "case03_link"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-14-03",
            "case_id": "case14",
            "title": "إفادة حمدي عن المندوب",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "مدير المشتريات اعترف باسم المندوب الذي سلم الشحنة.",
            "content_ref": "INT-HAMDY-01",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_ahmed_middleman",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-HAMDY-01",
                            "interaction_id": "Q_SALES_REP",
                            "expected_player_action": "interrogate",
                            "required_result": "ahmed_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "مندوب المبيعات يُدعى 'أحمد'. نفس الاسم، نفس الوصف الشكلي. هذه ليست شركة منفصلة، الشبكة غيرت اسمها فقط والمنسق ما زال يعمل.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "ahmed_middleman", "carryover_potential"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["trinity"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-14-01",
            "name": "حمدي - مدير المشتريات",
            "role_in_case": "Proxy",
            "relationship_to_victim": "مسؤول عن جلب الدواء",
            "occupation": "مدير مشتريات المستشفى",
            "public_profile": "موظف حكومي حذر، يغطي على جرائمه بالأوراق الرسمية.",
            "MBTI_Type": "ISTP",
            "cognitive_profile": {
                "base_collapse_threshold": 4,
                "base_lawyer_up_threshold": 6,
                "aggression_tolerance": 5,
                "rapport_affinity": 4,
                "evidence_rigidity": 6
            },
            "pressure_response": "evade",
            "deception_style": "bureaucratic",
            "speech_register": "informal",
            "favorite_phrases": ["كل حاجة ماشية قانوني والورق موجود"],
            "verbal_tells": ["هز الكتفين والتململ"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": ["proxy"],
            "hidden_affiliations": []
        }
    ],
    "witnesses": [],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case14_resolved_true", "case14_budget_resolved", "pharma_network_regenerating", "ahmed_middleman_identified", "five_victims_critical"],
        "partial": ["case14_budget_resolved"],
        "failure": ["case14_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تجاهل مسار الجريمة والتركيز على تطابق الأوصاف والأزمنة لإثبات تكرار الجريمة."
        },
        "forensics": {
            "description": "إظهار التطابق الكيميائي الصارخ بين المادة الفعالة الآن ومادة فارما لينك."
        },
        "behavioral": {
            "description": "استخراج الاعترافات من حمدي حول التهديد الموجه لعائلته وإثبات هوية المنسق."
        }
    },
    "derived_route_profile": {
        "timeline": 0.10,
        "forensics": 0.50,
        "behavioral": 0.40,
        "raw_scores": {
            "timeline": 0.3,
            "forensics": 1.5,
            "behavioral": 1.2
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
        "accepted_true_motive_ids": ["motive_syndicate_profit", "motive_ahmed_bribery"],
        "false_success_motive_ids": ["motive_administrative_negligence"],
        "false_success_flag": "case14_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_profit", "motive_ahmed_bribery", "motive_administrative_negligence"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-14-03"],
            "cross_route_evidence_ids": ["EVID-14-01", "EVID-14-02"],
            "rejected_submission_reason_codes": ["missing_alchemist_signature"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "trinity_intel_gathered"
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
            "pressure_increment": 4,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "QUEUE_EVIDENCE",
                "evidence_id": "EVID-14-02"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 45,
            "minimum_score": 45,
            "allow_score_decay": False,
            "early_detection_threshold": 50,
            "retaliation_thresholds": [50, 60],
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
            "rule_id": "case14_success",
            "priority": 100,
            "required_flags_all": ["case14_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case15",
            "target_case_path": "cases/case15/case15.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case14/case14.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case14.json")

