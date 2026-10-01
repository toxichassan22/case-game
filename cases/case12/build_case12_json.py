import json
import os

os.makedirs("d:/game/cases/case12", exist_ok=True)

case_data = {
    "case_id": "case12",
    "title": "الصوت في الدار",
    "crime_type": "proxy_family_murder",
    "victim_name": "عائلة محمد (زوجة وطفلان)",
    "overview": {
        "public_summary": "أب يقتل عائلته بسكين مطبخ ويحاول الانتحار في شقة سكنية بحي المنيل.",
        "main_question": "لماذا يردد الأب نفس العبارة الغريبة التي سمعناها في قضية انتحار سابقة؟",
        "stakes": "إثبات قدرة أحد أعضاء الثالوث (المُلقن) على التلاعب بقرارات البشر ودفعهم نحو جرائم وحشية كبدلاء."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "مجزرة عائلية في المنيل",
        "message": "استلمنا بلاغاً بجريمة قتل بشعة. محاسب ذبح زوجته وأطفاله ونجا من الانتحار بصعوبة. يبدو أنه كان يتلقى علاجاً نفسياً غريباً مؤخراً."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-12-01",
            "case_id": "case12",
            "title": "عبارة 'انسكار التماثل'",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "الأب ردد جملة: 'كان لازم ينكسر التماثل' في المستشفى.",
            "content_ref": "CASE12_HOSPITAL_TRANSCRIPT",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_phrase_match",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-MOHAMED-01",
                            "interaction_id": "Q02",
                            "expected_player_action": "interrogate",
                            "required_result": "phrase_symmetry_breaking_repeated"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "نفس العبارة الدقيقة استخدمها المنتحر في القضية 06 لتبرير موته. هذا دليل قاطع على وجود مصدر تلقين واحد (المُلقن).",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "whisperer_link", "case06_link"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0, "cyber": 0.0 },
            "grand_truth_axis": ["whisperer"]
        },
        {
            "evidence_id": "EVID-12-02",
            "case_id": "case12",
            "title": "وصف جلسات الظلام",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "الجاني يصف تلقي الاستشارات في غرفة مظلمة من شخص مجهول الوجه.",
            "content_ref": "CASE12_CLINIC_DESCRIPTION",
            "locked": True,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": ["EVID-12-01"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_whisperer_profile",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-MOHAMED-01",
                            "interaction_id": "Q04",
                            "expected_player_action": "interrogate",
                            "required_result": "shadow_voice_therapy"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المُلقن لا يظهر وجهه إطلاقاً، يستخدم البيئة المظلمة والصوت الهادئ لكسر دفاعات الضحايا النفسية وتحويلهم لقتلة.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "manipulation_tactic"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        },
        {
            "evidence_id": "EVID-12-03",
            "case_id": "case12",
            "title": "تحويلات مالية لأموات",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "الأب حول أتعاب جلساته إلى حساب بنكي مشبوه.",
            "content_ref": "CASE12_BANK_TRANSFERS",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_dead_accounts",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-CYBER-12",
                            "interaction_id": "FINANCIAL_TRACE",
                            "expected_player_action": "review_report",
                            "required_result": "transfers_to_deceased"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تم تحويل 8000 جنيه لحساب مسجل باسم شخص متوفٍ، وهو نفس التكتيك المستخدم لتمويل أنشطة القضية 05.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "trinity_finance"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["trinity"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-12-01",
            "name": "محمد الأب",
            "role_in_case": "Proxy",
            "relationship_to_victim": "الزوج والمهاجم",
            "occupation": "محاسب",
            "public_profile": "شخص مسالم ودائم الهدوء تم تدمير بنياته الدفاعية تماما.",
            "MBTI_Type": "ISFJ",
            "cognitive_profile": {
                "base_collapse_threshold": 2,
                "base_lawyer_up_threshold": 9,
                "aggression_tolerance": 2,
                "rapport_affinity": 8,
                "evidence_rigidity": 3
            },
            "pressure_response": "collapse",
            "deception_style": "truthful_but_broken",
            "speech_register": "informal",
            "favorite_phrases": ["كان لازم أرحمهم التماثل لازم ينكسر"],
            "verbal_tells": ["التحديق في الفراغ بشكل مرعب"],
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
        "success": ["case12_resolved_true", "case12_family_resolved", "whisperer_escalation", "whisperer_second_confirmed"],
        "partial": ["case12_family_resolved"],
        "failure": ["case12_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تتبع خط الفلوس لإثبات أن جلسات العلاج كانت مدفوعة لحساب تابع للشبكة الكبرى."
        },
        "forensics": {
            "description": "لا حاجة لمسار جنائي طبي معقد طالما توفرت الأدلة النفسية الكافية."
        },
        "behavioral": {
            "description": "استجواب مكثف لمحمد يربطه ذهنياً بما حدث في قضية سابقة ليثبت تأثير المُلقن الخارجي."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.05,
        "behavioral": 0.60,
        "raw_scores": {
            "timeline": 1.0,
            "forensics": 0.1,
            "behavioral": 1.9
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
        "accepted_true_motive_ids": ["motive_whisperer_manipulation"],
        "false_success_motive_ids": ["motive_financial_stress", "motive_temporary_insanity"],
        "false_success_flag": "case12_resolved_false",
        "accepted_motive_ids": ["motive_whisperer_manipulation", "motive_temporary_insanity"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 2,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-12-01", "EVID-12-02"],
            "cross_route_evidence_ids": ["EVID-12-03"],
            "rejected_submission_reason_codes": ["missing_external_manipulator"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "whisperer_pattern_identified"
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
            "enabled": False,
            "pressure_increment": 0,
            "requires_player_facing_explanation": False,
            "trigger_when": {},
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 35,
            "minimum_score": 35,
            "allow_score_decay": False,
            "early_detection_threshold": 40,
            "retaliation_thresholds": [40, 50, 60],
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
            "default_role": "behavioral"
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
            "rule_id": "case12_success",
            "priority": 100,
            "required_flags_all": ["case12_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case13",
            "target_case_path": "cases/case13/case13.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case12/case12.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case12.json")


