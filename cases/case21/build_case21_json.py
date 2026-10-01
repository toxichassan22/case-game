import json
import os

os.makedirs("d:/game/cases/case21", exist_ok=True)

case_data = {
    "case_id": "case21",
    "title": "الاسم الأول",
    "crime_type": "syndicate_alchemist_coverup",
    "victim_name": "د. فريد الطوخي (63 سنة)",
    "overview": {
        "public_summary": "العثور على أستاذ كيمياء عضوية مقتولاً داخل معمله بجامعة القاهرة بمادة صيدلانية.",
        "main_question": "لماذا تم استهداف باحث أكاديمي، وما علاقة السم المستخدم بتاريخه؟",
        "stakes": "هذه أول جريمة يرتكبها 'الخيميائي' بنفسه بشكل مباشر، وأي خطأ سيُضيع أقرب خيط لهويته."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "جريمة في الجامعة",
        "message": "دكتور كيميا في جامعة القاهرة مات مسموم في معمله. نفس المركبات اللي بنشوفها اليومين دول. الراجل كان بيدور في ورق قديم يخص طلابه. دور ورا الورق ده."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-21-01",
            "case_id": "case21",
            "title": "قائمة الخريجين الممزقة",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "قائمة بأسماء 12 خريج، ثلاثة محاطين بدائرة، اثنان مشطوبان، والاسم الأخير مقطوع تماماً.",
            "content_ref": "CASE21_TORN_LIST",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_torn_identity",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "document",
                            "source_ref": "CASE21_TORN_LIST",
                            "interaction_id": "PAPER_TEAR_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "name_intentionally_removed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الاسم الثالث المقطوع هو هوية الجاني 'الخيميائي'، والذي يبدو أنه كان تلميذاً للضحية. أزال اسمه ليخفي تاريخه.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_identity", "torn_name_clue"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-21-02",
            "case_id": "case21",
            "title": "سجلات رسائل الماجستير السابقة",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "سجل لأبحاث أشرف عليها الضحية قبل 15 سنة.",
            "content_ref": "FIN-ARCHIVE-UNIV",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_thesis_match",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-21-THESIS",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "thesis_matches_poison"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "تتطابق عناوين البحث المفقود في أرشيف الجامعة تماماً مع نوع السموم التي نتعامل معها. الخيميائي بنى كل جرائمه على أبحاث الجامعة الأساسية.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "alchemist_background", "academic_coverup"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-21-03",
            "case_id": "case21",
            "title": "دلالة طريقة القتل",
            "type": "physical",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "عدم محاولة الجاني إخفاء السم أو تغييره كالعادة.",
            "content_ref": "LAB-TOX-21",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_ego_killing",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "report",
                            "source_ref": "LAB-TOX-21",
                            "interaction_id": "TOXICOLOGY_REVIEW",
                            "expected_player_action": "inspect_object",
                            "required_result": "signature_poison_used_openly"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الخيميائي قتل أستاذه بنفس المركب المعقد كنوع من الرسائل السيكوباتية: 'التلميذ الذي لم تعترف به قد تفوق عليك'. إثارة الذعر والتحدي.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "alchemist_ego", "psychological_profiling"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["alchemist"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-21-01",
            "name": "الخيميائي (مجهول)",
            "role_in_case": "Culprit",
            "relationship_to_victim": "طالبه السابق.",
            "occupation": "قائد فرع الاغتيال الكيميائي في الثالوث",
            "public_profile": "غير معروف، ولكن له تاريخ أكاديمي في القاهرة.",
            "MBTI_Type": "INTP",
            "cognitive_profile": {
                "base_collapse_threshold": 10,
                "base_lawyer_up_threshold": 10,
                "aggression_tolerance": 8,
                "rapport_affinity": 1,
                "evidence_rigidity": 9
            },
            "pressure_response": "deflect",
            "deception_style": "omission",
            "speech_register": "formal",
            "favorite_phrases": [],
            "verbal_tells": [],
            "local_function": "suspect",
            "recurring_npc": True,
            "grand_truth_relevance": ["boss", "alchemist"],
            "hidden_affiliations": []
        }
    ],
    "witnesses": [],
    "related_persons": [],
    "required_flags": [],
    "outcome_flags": {
        "success": ["case21_resolved_true", "case21_professor_resolved", "alchemist_was_student", "torn_name_clue"],
        "partial": ["case21_professor_resolved"],
        "failure": ["case21_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استكشاف تواريخ تقديم رسائل الماجستير ومطابقتها للتطور الزمني لنشاط الثالوث."
        },
        "forensics": {
            "description": "فحص قصاصة الورق وحافة التمزيق لمعرفة إن كانت مقطوعة حديثاً في مسرح الجريمة."
        },
        "behavioral": {
            "description": "تقييم الدافع الرمزي والنرجسي لقتل الأستاذ باستخدام العلم المشترك."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.45,
        "behavioral": 0.20,
        "raw_scores": {
            "timeline": 1.05,
            "forensics": 1.35,
            "behavioral": 0.60
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
        "accepted_true_motive_ids": ["motive_syndicate_silencing", "motive_ego"],
        "false_success_motive_ids": ["motive_robbery", "motive_professional_jealousy"],
        "false_success_flag": "case21_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_silencing", "motive_robbery", "motive_professional_jealousy", "motive_ego"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-21-03"],
            "cross_route_evidence_ids": ["EVID-21-01", "EVID-21-02"],
            "rejected_submission_reason_codes": ["missing_alchemist_link"]
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
                "evidence_id": "EVID-21-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 85,
            "minimum_score": 85,
            "allow_score_decay": False,
            "early_detection_threshold": 90,
            "retaliation_thresholds": [95, 100],
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
            "allowed_events": ["GLITCH_TEXT_IN_REPORTS", "FAKE_BACKBUTTON", "AUDIO_DISTORTION"]
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
            "rule_id": "case21_success",
            "priority": 100,
            "required_flags_all": ["case21_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case22",
            "target_case_path": "cases/case22/case22.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي عبر القوس."
        }
    ]
}

with open("d:/game/cases/case21/case21.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case21.json")

