import json
import os

os.makedirs("d:/game/cases/case22", exist_ok=True)

case_data = {
    "case_id": "case22",
    "title": "السلسلة",
    "crime_type": "syndicate_coordinated_operation",
    "victim_name": "متعدد (سرقة مخزن، حريق مكتب، اختفاء موظف)",
    "overview": {
        "public_summary": "ثلاثة بلاغات متفرقة في القاهرة خلال 3 أيام: سرقة مخزن أدوية بطريقة احترافية، حريق غامض في مكتب محاسبة، واختفاء مريب لموظف حكومي.",
        "main_question": "هل هذه الحوادث المتزامنة خيوط لعصابات مختلفة أم أنها حركة واحدة لوحش متعدد الأذرع؟",
        "stakes": "إدراك أن الثالوث يمكنه إدارة عمليات لوجستية متزامنة، مما يرفع مستوى الخطورة من مجرد قتلة مأجورين إلى منظمة هيكلية."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "3 ملفات متلخبطة",
        "message": "عندي 3 ملفات من أقسام شبرا والدقي والوزارة. سرقة مخزن وتسريب حريق واختفاء موظف. كل قسم شغال مع نفسه بس أنا حاسس إن في ريحة واحدة فيهم. بص عليهم يمكن تلاقي الخيط اللي بيربطهم."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-22-01",
            "case_id": "case22",
            "title": "الجدول الزمني للعمليات المتزامنة",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "نطاق زمني يحدد توقيت حدوث الجرائم الثلاث في 72 ساعة متتالية.",
            "content_ref": "TIMELINE-BOARD",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_event_chain",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-22-CHAIN",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "three_day_logistics_pattern_established"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الأحداث لم تقع صدفة: الخيميائي يحصل على مواده الخام، صانع الساعات يحرق أرشيف التدقيق المالي باستخدام مؤقت، والمُلقن يضمن صمت موظف التموين بالاختفاء القسري التطوعي.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "orchestrated_strike", "trinity_logistics"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["boss"]
        },
        {
            "evidence_id": "EVID-22-02",
            "case_id": "case22",
            "title": "قوائم الجرد المسروقة",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "قائمة بالأدوية المفقودة من مخزن شبرا.",
            "content_ref": "CASE22_STOLEN_MEDS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_alchemist_supplies",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "document",
                            "source_ref": "CASE22_STOLEN_MEDS",
                            "interaction_id": "INVENTORY_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "compound_ingredients_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الأدوية المسروقة لا تتميز بقيمة بيع عالية في السوق السوداء، بل هي المواد الخام التفاعلية اللازمة لإنتاج السم المعدل الخاص بالخيميائي.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "supply_chain", "alchemist_prep"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-22-03",
            "case_id": "case22",
            "title": "رسالة هاتف الموظف المختفي",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "رسالة مشفرة تركها موظف التموين لزوجته قبل اختفائه بساعة.",
            "content_ref": "FIN-MISSING-MESSAGE",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_whisperer_persuasion",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "digital",
                            "source_ref": "FIN-MISSING-MESSAGE",
                            "interaction_id": "TEXT_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "voluntary_disappearance_induced"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الرسالة تتضمن عبارت طمأنة غريبة: 'قالولي لو مشيت مش هيحصلي حاجة'. هذا هو أسلوب المُلقن تماماً؛ إجبار الضحايا على التخلص من أنفسهم من خلال اللعب على مخاوفهم.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "psychological_manipulation", "whisperer_tactic"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-22-01",
            "name": "قيادة الثالوث",
            "role_in_case": "Culprit",
            "relationship_to_victim": "تدبير وتنسيق",
            "occupation": "إدارة العمليات التكتيكية",
            "public_profile": "غير متواجدين.",
            "MBTI_Type": "INTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 10,
                "base_lawyer_up_threshold": 10,
                "aggression_tolerance": 10,
                "rapport_affinity": 0,
                "evidence_rigidity": 10
            },
            "pressure_response": "bargain",
            "deception_style": "deflection",
            "speech_register": "formal",
            "favorite_phrases": [],
            "verbal_tells": [],
            "local_function": "suspect",
            "recurring_npc": True,
            "grand_truth_relevance": ["boss"],
            "hidden_affiliations": []
        }
    ],
    "witnesses": [],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case22_resolved_true", "case22_chain_resolved", "trinity_orchestrated_ops", "supply_chain_identified"],
        "partial": ["case22_chain_resolved"],
        "failure": ["case22_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استكشاف الترابط الاستراتيجي والزمني بين الثلاث عمليات لإثبات المنهجية."
        },
        "forensics": {
            "description": "تحليل المركبات المسروقة لتأكيد أنها الأساس الكيميائي لاغتيالات الخيميائي."
        },
        "behavioral": {
            "description": "فك شفرة الاستلاب النفسي لموظف وزارة التموين وفهم ديناميكية الترهيب للملُقن."
        }
    },
    "derived_route_profile": {
        "timeline": 0.40,
        "forensics": 0.30,
        "behavioral": 0.30,
        "raw_scores": {
            "timeline": 1.20,
            "forensics": 0.90,
            "behavioral": 0.90
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
        "accepted_true_motive_ids": ["motive_syndicate_logistics"],
        "false_success_motive_ids": ["motive_random_crime_wave", "motive_unrelated_incidents"],
        "false_success_flag": "case22_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_logistics", "motive_random_crime_wave", "motive_unrelated_incidents"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-22-03"],
            "cross_route_evidence_ids": ["EVID-22-01", "EVID-22-02"],
            "rejected_submission_reason_codes": ["missing_orchestra_link"]
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
            "pressure_increment": 3,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "QUEUE_EVIDENCE",
                "evidence_id": "EVID-22-02"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 90,
            "minimum_score": 90,
            "allow_score_decay": False,
            "early_detection_threshold": 95,
            "retaliation_thresholds": [100],
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
            "allowed_events": ["GLITCH_TEXT_IN_REPORTS", "FAKE_BACKBUTTON"]
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
            "rule_id": "case22_success",
            "priority": 100,
            "required_flags_all": ["case22_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case23",
            "target_case_path": "cases/case23/case23.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي عبر القوس."
        }
    ]
}

with open("d:/game/cases/case22/case22.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case22.json")
