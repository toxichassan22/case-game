import json
import os

os.makedirs("d:/game/cases/case20", exist_ok=True)

case_data = {
    "case_id": "case20",
    "title": "أول خيط",
    "crime_type": "syndicate_lair_discovery",
    "victim_name": "لا يوجد (عملية مداهمة)",
    "overview": {
        "public_summary": "مداهمة مصنع مهجور في حلوان بناءً على بلاغ مجهول يقود لاكتشاف معمل متطور للجرائم.",
        "main_question": "هل ترك الثالوث هذا المخبأ خلفه مضطراً أم أن الأدلة المتناثرة فيه فخ مصمم خصيصاً لنا؟",
        "stakes": "الحصول على أول اسم حقيقي لأحد قادة الثالوث ومعرفة أهدافهم الـ 5 القادمة (ختام القوس 2)."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "مداهمة ورشة حلوان (عاجل)",
        "message": "جالنا بلاغ عن مصنع ومخبأ بحلوان. المباحث دخلت لقت معمل كيميا وأجهزة كمبيوتر متكسرة وورق محروق. المكان كان شغال من ساعات بس. خش جمع كل حاجة نقدر نوصل بيها للناس دي."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-20-01",
            "case_id": "case20",
            "title": "المخلفات الكيميائية للمعمل",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "عسلات زجاجية وأنابيب ترسبت عليها رواسب معادن ثقيلة مطابقة للسموم المكتشفة في قضايا سابقة.",
            "content_ref": "CASE20_LAB_SWABS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_alchemist_lair",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "physical",
                            "source_ref": "CASE20_LAB_SWABS",
                            "interaction_id": "CHEMICAL_MATCH",
                            "expected_player_action": "inspect_object",
                            "required_result": "alchemist_base_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المعمل هنا كان المصدر الرئيسي لكل السموم والأدوية المغشوشة. هنا كان يعمل 'الخيميائي'.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_lab", "trinity_base"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-20-02",
            "case_id": "case20",
            "title": "فاتورة باسم 'طارق الأنصاري'",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "فاتورة شراء مكونات إلكترونية عُثر عليها بين الأنقاض المتبقية.",
            "content_ref": "CASE20_TAREK_INVOICE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics", "timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_clockmaker_identity",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-20-TAREK",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "tarek_engineer_profile_created"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "طارق الأنصاري (58 سنة)، مهندس اتصالات سابق. أول اشتباه حقيقي بشخصية 'صانع الساعات'. العنوان مسجل بشقة فارغة انتقل منها.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "forensics", "clockmaker_identity"],
            "route_weight": { "timeline": 0.5, "forensics": 0.5, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-20-03",
            "case_id": "case20",
            "title": "USB مشفر تشفيراً عسكرياً",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "فلاش درايف تم التقاطه من قسم الكمبيوتر المحطم في الورشة.",
            "content_ref": "CASE20_ENCRYPTED_USB",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["cyber"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_usb_vaulted",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "digital",
                            "source_ref": "CASE20_ENCRYPTED_USB",
                            "interaction_id": "DECRYPTION_ATTEMPT",
                            "expected_player_action": "inspect_object",
                            "required_result": "military_encryption_flagged"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "يحتوي على البيانات الأصلية، ولكنه مغلق بتشفير لا يكسر حالياً ويجب الاحتفاظ به حتى نجد المفتاح.",
            "penalty_if_mishandled": [],
            "tags": ["cyber", "carryover", "clockmaker_data"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-20-04",
            "case_id": "case20",
            "title": "قائمة الـ 19 اسماً المحترقة جزئياً",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "قائمة ورقية أُنقذت من برميل حريق في قسم الأرشيف.",
            "content_ref": "CASE20_TARGET_LIST",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid04_future_targets",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-20-TARGETS",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "future_targets_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "القائمة تضم 14 اسم لأشخاص ماتوا (جرائمنا السابقة)، وهناك 5 أسماء لم يتم شطبها. هذه قائمة أهداف 'المُلقن' الخمسة المستقبلية.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "whisperer_planning", "future_targets_carryover"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-20-01",
            "name": "مجهول (فرار الثالوث)",
            "role_in_case": "Culprit",
            "relationship_to_victim": "لا ضحية مباشرة.",
            "occupation": "شبكة الثالوث مجتمعة",
            "public_profile": "غير متواجدين في المسرح.",
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
        "success": ["case20_resolved_true", "case20_lair_discovered", "arc2_complete", "tarek_ansari_name", "encrypted_usb_collected", "five_future_targets"],
        "partial": ["case20_lair_discovered", "arc2_complete"],
        "failure": ["case20_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استكشاف تواريخ الأسماء وأحداث الاختفاء لربط الـ 14 هدفاً بالجرائم الماضية."
        },
        "forensics": {
            "description": "جمع مخلفات الأدلة السريرية من المعمل والفاتورة وفحص تشفير الـ USB."
        },
        "behavioral": {
            "description": "فهم مغزى تقسيم المخبأ لثلاثة أجنحة، وقراءة دلالة ترك قائمة الأهداف كرسالة تحدٍ."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.35,
        "behavioral": 0.30,
        "raw_scores": {
            "timeline": 1.05,
            "forensics": 1.05,
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
        "minimum_evidence_count": 4,
        "accepted_true_motive_ids": ["motive_syndicate_taunt"],
        "false_success_motive_ids": ["motive_evidence_destruction"],
        "false_success_flag": "case20_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_taunt", "motive_evidence_destruction"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 3,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-20-04"],
            "cross_route_evidence_ids": ["EVID-20-01", "EVID-20-02", "EVID-20-03"],
            "rejected_submission_reason_codes": ["missing_trinity_lair_validation"]
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
            "minimum_required_chains": 2,
            "shared_evidence_completion_required": True,
            "critical_evidence_requires_alternative_paths": False,
            "minimum_alternative_trigger_sets_for_critical_evidence": 0
        },
        "evidence_reinterpretation_rules": [],
        "ui_feedback_rules": [],
        "soft_exposure_rules": [],
        "forensics_queue_pressure_rules": {
            "enabled": True,
            "pressure_increment": 5,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "QUEUE_EVIDENCE",
                "evidence_id": "EVID-20-03"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 80,
            "minimum_score": 80,
            "allow_score_decay": False,
            "early_detection_threshold": 85,
            "retaliation_thresholds": [90, 100],
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
            "rule_id": "case20_success_arc3",
            "priority": 100,
            "required_flags_all": ["case20_resolved_true", "arc2_complete"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case21",
            "target_case_path": "cases/case21/case21.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم تلقائي نحو القوس الروائي الثالث عقب استخراج القائمة."
        }
    ]
}

with open("d:/game/cases/case20/case20.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case20.json")


