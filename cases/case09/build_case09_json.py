import json
import os

os.makedirs("d:/game/cases/case09", exist_ok=True)

case_data = {
    "case_id": "case09",
    "title": "الساعة الحادية عشرة",
    "crime_type": "evidence_tampering_bombing",
    "victim_name": "أرشيف الشرطة (لا يوجد ضحايا بشرية)",
    "overview": {
        "public_summary": "انفجار محدود بدقة متناهية يدمر غرفة أدلة سرية تابعة للشرطة في مبنى مهجور.",
        "main_question": "لماذا تم تدمير غرفة أدلة قضايا قديمة في أجزاء من الثانية بتوقيت متناظر (11:11)؟",
        "stakes": "كشف الرابط النهائي الذي يربط الجرائم المتباعدة ليؤكد وجود 'صانع الساعات'."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "انفجار في مبنى بمنطقة شبرا",
        "message": "لا ضحايا، لكن المبنى كان مخزناً سرياً لحفظ أدلة القضايا القديمة المعلقة. تم تدمير غرفة معينة وبقيت رسالة غامضة على الحائط. هناك شكوك بتورط داخلي."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-09-01",
            "case_id": "case09",
            "title": "شريحة الـ Arduino من حطام القنبلة",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "لوحة معالجة محترقة جزئياً كانت متصلة بمؤقت تفجير.",
            "content_ref": "CASE09_BOMB_DEBRIS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics", "cyber"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_arduino_match",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-CYBER-09",
                            "interaction_id": "HARDWARE-ANALYSIS",
                            "expected_player_action": "review_report",
                            "required_result": "batch_number_matches_case08"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الرقم التسلسلي يثبت أنها من نفس الشحنة المستخدمة لبناء البرنامج الخبيث في القضية 08. الفاعل هنا مبرمج ومهندس في آن واحد.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "cyber", "clockmaker_link"],
            "route_weight": { "timeline": 0.0, "forensics": 0.50, "behavioral": 0.0, "cyber": 0.50 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-09-02",
            "case_id": "case09",
            "title": "سجل توقيت الانفجار والقضايا السابقة",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "العبوة انفجرت الساعة 11:11. ملفات القضايا التي دُمرت حدثت كلها في 03:30، 11:11، و 12:21.",
            "content_ref": "CASE09_TIMING_LOGS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_timing_pattern",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-09-01-08",
                            "expected_player_action": "connect_evidence",
                            "required_result": "clockmaker_time_symmetry_unlocked"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تسلسل رياضي متناظر مرعب يطابق انقطاع الكاميرات في القضية 01 والمعاملات في 08. القاتل مهووس بالأنماط.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "clockmaker_link"],
            "route_weight": { "timeline": 0.90, "forensics": 0.0, "behavioral": 0.10 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-09-03",
            "case_id": "case09",
            "title": "رسالة الحائط",
            "type": "digital",
            "evidence_tier": "supporting",
            "evidence_role": "prove",
            "summary": "مكتوب بالرش: 'الساعة الحادية عشرة'.",
            "content_ref": "CASE09_WALL_GRAFFITI",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": "إعلان صريح للوجود. المهاجم يعلم أننا نبحث عنه ويترك بصمته.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": []
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-09-01",
            "name": "النقيب مجدي",
            "role_in_case": "Distraction",
            "relationship_to_victim": "مسؤول الحراسة السابق",
            "occupation": "ضابط شرطة",
            "public_profile": "ضابط معروف بالإهمال وله تجاوزات إدارية، بعض الأدلة المحترقة كانت تدينه.",
            "MBTI_Type": "ESTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 6,
                "base_lawyer_up_threshold": 4,
                "aggression_tolerance": 7,
                "rapport_affinity": 3,
                "evidence_rigidity": 8
            },
            "pressure_response": "anger",
            "deception_style": "defensive",
            "speech_register": "formal",
            "favorite_phrases": ["أنتم بتحاولوا تلبسوهالي عشان تغطوا على فشلكم"],
            "verbal_tells": ["النظر بعيداً عند سؤاله عن محتوى القضايا المدمرة"],
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
        "success": ["case09_resolved_true", "case09_bombing_resolved", "clockmaker_pattern_confirmed", "two_unknown_suspects_linked", "symmetric_time_pattern"],
        "partial": ["case09_bombing_resolved"],
        "failure": ["case09_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "ربط التوقيت 11:11 بتوقيتات القضايا السابقة المدمرة وبقضايا اللعبة الماضية."
        },
        "forensics": {
            "description": "تحليل الأجهزة الإلكترونية لربط شريحة الـ Arduino من القنبلة بالبرنامج الخبيث."
        },
        "behavioral": {
            "description": "استجواب مجدي لإثبات عدم قدرته التقنية وراء القنبلة واعتباره مجرد غطاء للأحداث."
        }
    },
    "derived_route_profile": {
        "timeline": 0.50,
        "forensics": 0.40,
        "behavioral": 0.10,
        "raw_scores": {
            "timeline": 1.5,
            "forensics": 1.2,
            "behavioral": 0.3
        },
        "normalization_total": 3.0,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": False,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_clockmaker_coverup"],
        "false_success_motive_ids": ["motive_police_corruption_coverup"],
        "false_success_flag": "case09_resolved_false",
        "accepted_motive_ids": ["motive_clockmaker_coverup", "motive_police_corruption_coverup"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 0,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": [],
            "cross_route_evidence_ids": ["EVID-09-01", "EVID-09-02"],
            "rejected_submission_reason_codes": ["missing_clockmaker_pattern"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "linking_clockmaker_events"
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
                "target_evidence_id": "EVID-09-02",
                "recompute_each_tick": True,
                "state_predicates_true": [
                    {
                        "fact_type": "global_flag",
                        "ref": "timing_obsession_noted", 
                        "equals": True
                    }
                ],
                "on_true": {
                    "set_evidence_summary": "التسلسل الزمني متطابق مع الاختراقات البنكية. صانع الساعات يوقع جرائمه بهذه الطريقة.",
                    "set_evidence_tags": ["clockmaker_signature"],
                    "set_flags": ["clockmaker_pattern_confirmed"]
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
                "before_evidence_verified": "EVID-09-01"
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
            "rule_id": "case09_success",
            "priority": 100,
            "required_flags_all": ["case09_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case10",
            "target_case_path": "cases/case10/case10.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي للتحقيق."
        }
    ]
}

with open("d:/game/cases/case09/case09.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case09.json")

