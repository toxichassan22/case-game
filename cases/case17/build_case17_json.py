import json
import os

os.makedirs("d:/game/cases/case17", exist_ok=True)

case_data = {
    "case_id": "case17",
    "title": "الباب الدوار",
    "crime_type": "syndicate_infiltration",
    "victim_name": "نظام الدولة (وزارة الداخلية)",
    "overview": {
        "public_summary": "تسريب بيانات 50 ألف مواطن من قواعد بيانات وزارة الداخلية إثر اختراق سيبراني.",
        "main_question": "لماذا تم تسريب البيانات علناً؟ هل هذا مجرد استعراض أم تغطية لشيء أعمق؟",
        "stakes": "اكتشاف أن الثالوث أصبح يتجسس على الشرطة واللاعب شخصياً داخل النظام."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "خرق أمني غير مسبوق",
        "message": "بيانات 50 ألف مواطن نزلت على الدارك ويب من سيرفرات الوزارة. قبضنا على طالب ركب فلاشة مجهولة في جهاز في الوزارة. حقق معاه واعرف شغال مع مين وقفلوا الثغرة دي."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-17-01",
            "case_id": "case17",
            "title": "البرمجية الخبيثة (Backdoor Code)",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "الكود المستخرج من الـ USB الذي تم تجميعه داخلياً.",
            "content_ref": "CASE17_USB_MALWARE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics", "cyber"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_clockmaker_code",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "digital",
                            "source_ref": "CASE17_USB_MALWARE",
                            "interaction_id": "CODE_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "clockmaker_signature_found"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "البرمجية ليست فقط لتسريب البيانات بل زرعت 'باب خلفي' (Backdoor). المتغيرات البرمجية تحمل أسماء (chronograph, pendulum). هذه بصمة 'صانع الساعات' (بمقارنة نفس المعمارية من القضية 8).",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "cyber", "clockmaker_trace", "backdoor"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-17-02",
            "case_id": "case17",
            "title": "البيانات الوصفية لحساب @clock_zero",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "الحساب الذي تواصل مع منفذ الاختراق عبر تيليجرام.",
            "content_ref": "CASE17_TELEGRAM_LOGS",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_egypt_ip",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-17-TG",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "egyptian_ip_metadata_verified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الحساب أُنشئ ومُحا فورياً، لكن التتبع الزمني لبيانات الوصف يثبت أن صانع الساعات يعمل محلياً من داخل مصر وليس هاكر دولي بعيد.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker_intel"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-17-03",
            "case_id": "case17",
            "title": "تمويه الاختراق وأهداف الباب الخلفي",
            "type": "report",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "القطاع الخفي من البيانات التي تعرضت للوصول غير المصرح به.",
            "content_ref": "CYBER-REPORT-17",
            "locked": True,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral", "cyber"],
            "depends_on_evidence_ids": ["EVID-17-01"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_player_targeted",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-17-TARGETS",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "player_file_access_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تسريب بيانات المواطنين كان تمويهاً مزعجاً للتغطية على هدف الاختراق الحقيقي للباب الخلفي: قراءة مذكرات وتقارير قسمك أنت. الثالوث يراقبك من الشاشة المقابلة.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "meta_narrative", "trinity_knows_player"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["trinity", "clockmaker"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-17-01",
            "name": "مروان",
            "role_in_case": "Proxy",
            "relationship_to_victim": "لا علاقة، قام برشوة حارس لزرع الفلاشة.",
            "occupation": "طالب قسيم هندسة (كلية الحاسبات)",
            "public_profile": "شاب ساذج، يظن نفسه جزءاً من حركة هاكتفيزم عابثة.",
            "MBTI_Type": "INTP",
            "cognitive_profile": {
                "base_collapse_threshold": 4,
                "base_lawyer_up_threshold": 8,
                "aggression_tolerance": 2,
                "rapport_affinity": 7,
                "evidence_rigidity": 3
            },
            "pressure_response": "confess_true",
            "deception_style": "minimal",
            "speech_register": "formal",
            "favorite_phrases": ["أنا كنت فاكرها حركة سياسية", "الراجل وعدني بفلوس وكورسات على الدارك ويب"],
            "verbal_tells": ["ارتباك، تجنب نظرات العين"],
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
        "success": ["case17_resolved_true", "case17_hack_resolved", "clockmaker_inside_system", "player_file_compromised", "clock_zero_username"],
        "partial": ["case17_hack_resolved"],
        "failure": ["case17_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تشفير الـ IP لإثبات مكان صانع الساعات المحلي وتأكيد هوية الحساب الرابط للحدث."
        },
        "forensics": {
            "description": "تفكيك كود البرمجية الخبيثة ومقاطعة بصمته مع معمارية الاختراقات السابقة."
        },
        "behavioral": {
            "description": "إدراك البعد النفسي لعمل الثالوث وأن الضرر الفعلي لا يمكن وقفه بسجن طالب الهندسة الذي لا حيلة له."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.35,
        "behavioral": 0.30,
        "raw_scores": {
            "timeline": 1.05,
            "forensics": 1.05,
            "behavioral": 0.9
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
        "accepted_true_motive_ids": ["motive_syndicate_infiltration"],
        "false_success_motive_ids": ["motive_hacktivist_prank", "motive_greed"],
        "false_success_flag": "case17_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_infiltration", "motive_hacktivist_prank", "motive_greed"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-17-03"],
            "cross_route_evidence_ids": ["EVID-17-01", "EVID-17-02"],
            "rejected_submission_reason_codes": ["missing_trinity_method_proof"]
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
                "evidence_id": "EVID-17-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 65,
            "minimum_score": 65,
            "allow_score_decay": False,
            "early_detection_threshold": 70,
            "retaliation_thresholds": [70, 80],
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
            "rule_id": "case17_success",
            "priority": 100,
            "required_flags_all": ["case17_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case18",
            "target_case_path": "cases/case18/case18.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case17/case17.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case17.json")


