import json
import os

os.makedirs("d:/game/cases/case18", exist_ok=True)

case_data = {
    "case_id": "case18",
    "title": "القناع",
    "crime_type": "syndicate_assassination",
    "victim_name": "وائل حسان (ممثل مسرحي)",
    "overview": {
        "public_summary": "وفاة غامضة لممثل مسرحي أثناء العرض أمام مئات المشاهدين.",
        "main_question": "كيف تُنفذ جريمة قتل أمام 200 شاهد دون أن يلاحظ أحد؟ وما سر المسرحية الممنوعة؟",
        "stakes": "إدراك أن الثالوث يقتل أي شخص يحاول كشفه علناً، وتجميع هيكل الشبكة الفلسفي."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "جريمة في نص المسرح",
        "message": "ممثل مات على المسرح امبارح بالليل. الناس افتكرتها حتة من المسرحية لحد ما مكملش. الإسعاف جات متأخر. المسرح متقمع والفرقة كلها مشتبه فيها."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-18-01",
            "case_id": "case18",
            "title": "كوب الماء المسموم",
            "type": "report",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "تقرير معمل جنائي يشرح تركيبة المادة المضافة للماء.",
            "content_ref": "LAB-TOX-18",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_alchemist_water",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "report",
                            "source_ref": "LAB-TOX-18",
                            "interaction_id": "WATER_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "alchemist_toxin_matches"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تم وضع مادة قاتلة ولا طعم لها في الماء. السم صُمم ليعمل ببطء وتظهر أعراضه بعد 30 دقيقة. بصمة الخيميائي.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_weapon"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-18-02",
            "case_id": "case18",
            "title": "نص مسرحية 'الثالوث'",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "ملف نصي على لاب توب الضحية يحمل اسم مسرحية قيد التطوير.",
            "content_ref": "CASE18_PLAY_SCRIPT",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_play_revealed",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-18-SCRIPT",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "trinity_play_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المسرحية تتحدث عن 3 أسياد يتحكمون بمدينة (الكيميائي، المهندس، المعالج). الممثل استوحى القصة من معلومات الصحفية (تحقيق القضية 11). قُتل لإسكات الحكاية.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "intel_gather", "case11_link"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["trinity"]
        },
        {
            "evidence_id": "EVID-18-03",
            "case_id": "case18",
            "title": "اعتراف عامل الدعائم نبيل",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "إفادة العامل المسؤول عن تجهيز الكواليس وماء العرض.",
            "content_ref": "INT-NABIL-01",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_nabil_blackmail",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-NABIL-01",
                            "interaction_id": "Q_POISON",
                            "expected_player_action": "interrogate",
                            "required_result": "blackmail_motive_revealed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "نبيل وضع المسحوق وهو مرعوب خوفاً من فضيحة فديو يمتلكه مبتز مجهول. لكنه كان يعتقد أنه يضع مليناً كنوع من إحراج زميله على المسرح. الثالوث يسلح البسطاء بالصدفة.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "proxy_weaponization", "whisperer_blackmail"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-18-01",
            "name": "نبيل",
            "role_in_case": "Proxy",
            "relationship_to_victim": "عامل دعائم في المسرح.",
            "occupation": "عامل كواليس (Stagehand)",
            "public_profile": "رجل بسيط، مكروه من بعض الممثلين، لكنه غير عنيف.",
            "MBTI_Type": "ISFP",
            "cognitive_profile": {
                "base_collapse_threshold": 2,
                "base_lawyer_up_threshold": 9,
                "aggression_tolerance": 2,
                "rapport_affinity": 8,
                "evidence_rigidity": 2
            },
            "pressure_response": "confess_true",
            "deception_style": "minimal",
            "speech_register": "informal",
            "favorite_phrases": ["أنا حطيت ملين بس عشان أفضحوا", "هددوني بفيديو بنتي"],
            "verbal_tells": ["بكاء هستيري", "ضرب الرأس"],
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
        "success": ["case18_resolved_true", "case18_theater_resolved", "trinity_silences_storytellers", "play_script_collected", "blackmail_as_weapon"],
        "partial": ["case18_theater_resolved"],
        "failure": ["case18_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تفعيل جدول المواعيد خلف الكواليس لإثبات لحظة التسميم."
        },
        "forensics": {
            "description": "إثبات قاتلية السم وطبيعته المتقدمة التي لا يمتلكها عامل كواليس."
        },
        "behavioral": {
            "description": "فهم فلسفة الثالوث من النص المسرحي، واستخلاص دافع הابتزاز من نبيل."
        }
    },
    "derived_route_profile": {
        "timeline": 0.10,
        "forensics": 0.45,
        "behavioral": 0.45,
        "raw_scores": {
            "timeline": 0.3,
            "forensics": 1.35,
            "behavioral": 1.35
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
        "accepted_true_motive_ids": ["motive_syndicate_silencing"],
        "false_success_motive_ids": ["motive_workplace_jealousy", "motive_accidental_death"],
        "false_success_flag": "case18_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_silencing", "motive_workplace_jealousy", "motive_accidental_death"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 2,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-18-02", "EVID-18-03"],
            "cross_route_evidence_ids": ["EVID-18-01"],
            "rejected_submission_reason_codes": ["missing_trinity_play_link"]
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
                "evidence_id": "EVID-18-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 70,
            "minimum_score": 70,
            "allow_score_decay": False,
            "early_detection_threshold": 75,
            "retaliation_thresholds": [75, 85],
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
            "allowed_events": ["GLITCH_TEXT_IN_REPORTS"]
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
            "rule_id": "case18_success",
            "priority": 100,
            "required_flags_all": ["case18_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case19",
            "target_case_path": "cases/case19/case19.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case18/case18.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case18.json")


