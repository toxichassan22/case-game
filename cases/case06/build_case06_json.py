import json
import os

os.makedirs("d:/game/cases/case06", exist_ok=True)

case_data = {
    "case_id": "case06",
    "title": "كسر التماثل",
    "crime_type": "psychological_manipulation_homicide",
    "victim_name": "يوسف نبيل",
    "overview": {
        "public_summary": "مبرمج شاب يُنقل أنه شنق نفسه في شقته تاركاً رسالة وداع منمقة. جريمة تبدو مثالية في انتحارها.",
        "main_question": "هل الانتحار كان بقرار حر، أم صُنع وصُمم له؟",
        "stakes": "كشف أخطر أذرع الثالوث (المُلقن) الذي يقتل عبر التدمير النفسي دون أن يترك دليلاً مادياً وراءه."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "انتحار مبرمج بالزمالك",
        "message": "قضية انتحار واضحة. فقط قم بمعاينة الشقة والتصديق على التقرير لحفظ القضية ونقل الجثمان."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-06-01",
            "case_id": "case06",
            "title": "الحبل النايلون",
            "type": "physical",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "حبل نايلون 8mm حديث الشراء جداً، لا يناسب أغراض الشقة.",
            "content_ref": "CASE06_ROPE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_rope_receipt",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "physical",
                            "source_ref": "CASE06_ROPE",
                            "interaction_id": "TRACING",
                            "expected_player_action": "inspect_object",
                            "required_result": "recent_cash_purchase_unrelated_to_victim"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "مشتري الحبل شخص بقبعة لم يتم التعرف عليه، مما ينفي تخطيط الضحية المسبق للشنق.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "timeline"],
            "route_weight": { "timeline": 0.40, "forensics": 0.60, "behavioral": 0.0 },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-06-02",
            "case_id": "case06",
            "title": "رسالة الوداع المفلسفة",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "رسالة طويلة على لابتوب يوسف تتحدث عن 'إعادة تأطير' و 'كسر التماثل'.",
            "content_ref": "CASE06_SUICIDE_NOTE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_linguistics",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-LING-06",
                            "interaction_id": "SEMANTIC-ANALYSIS",
                            "expected_player_action": "review_report",
                            "required_result": "stylistic_mismatch_detected"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الأسلوب اللغوي لا يتطابق الإطلاقاً مع كتابات يوسف السابقة. المصطلحات السيكولوجية دُست عليه.",
            "penalty_if_mishandled": ["penalty_police_trust_loss"],
            "tags": ["behavioral", "forgery", "whisperer"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 0.90 },
            "grand_truth_axis": ["whisperer"]
        },
        {
            "evidence_id": "EVID-06-03",
            "case_id": "case06",
            "title": "دفتر ملاحظات يوسف",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "دفتر يسجل توجيهات من 'أستاذ وليد' تقنعه بأنه عبء على الجميع.",
            "content_ref": "CASE06_NOTEBOOK",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "whisperer"],
            "route_weight": { "timeline": 0.10, "forensics": 0.0, "behavioral": 0.90 },
            "grand_truth_axis": ["whisperer"]
        },
        {
            "evidence_id": "EVID-06-04",
            "case_id": "case06",
            "title": "لغز اختفاء وليد",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "د. هاني أحال يوسف لمدرب حياة 'وليد'. لا يوجد له رقم هاتف أو عيادة معلومة.",
            "content_ref": "CASE06_WALID_SEARCH",
            "locked": True,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["cyber"],
            "depends_on_evidence_ids": ["EVID-06-03"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid04_digital_ghost",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_INTERROGATION_NODE_UNLOCKED",
                            "source_type": "interrogation",
                            "source_ref": "INT-HANY-01",
                            "interaction_id": "Q04",
                            "expected_player_action": "interrogate",
                            "required_result": "ghost_identity_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المدرب شبح رقمي تماماً. د. هاني خُدع لإحالة حالة هشة إليه لتدميرها.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "whisperer"],
            "route_weight": { "timeline": 0.50, "forensics": 0.0, "behavioral": 0.50 },
            "grand_truth_axis": ["whisperer"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-06-NONE",
            "name": "المُلقن (أستاذ وليد)",
            "role_in_case": "Primary Target",
            "relationship_to_victim": "مدرب حياة غامض",
            "occupation": "متلاعب نفسي",
            "public_profile": "كيان غير مادي يدفع الأشخاص للانتحار ببراعة.",
            "MBTI_Type": "INFJ",
            "cognitive_profile": {
                "base_collapse_threshold": 10,
                "base_lawyer_up_threshold": 10,
                "aggression_tolerance": 10,
                "rapport_affinity": -10,
                "evidence_rigidity": 10
            },
            "pressure_response": "silence",
            "deception_style": "passive",
            "speech_register": "formal",
            "favorite_phrases": ["كان لازم ينكسر التماثل"],
            "verbal_tells": [],
            "local_function": "suspect",
            "recurring_npc": True,
            "grand_truth_relevance": ["Core Trinity Members"],
            "hidden_affiliations": ["The Shadow"]
        }
    ],
    "witnesses": [
        {
            "character_id": "WIT-06-01",
            "name": "د. هاني",
            "role_in_case": "Facilitator (Unwitting)",
            "relationship_to_victim": "طביب نفسي معالج",
            "occupation": "طبيب نفسي",
            "public_profile": "طبيب ذو ممارسات مهملة يثق بالوسطاء دون تدقيق.",
            "MBTI_Type": "ESTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 5,
                "base_lawyer_up_threshold": 7,
                "aggression_tolerance": 3,
                "rapport_affinity": 5,
                "evidence_rigidity": 6
            },
            "pressure_response": "collapse",
            "deception_style": "defensive",
            "speech_register": "formal",
            "favorite_phrases": ["أنا صرفتله دواء عادي", "أنا اتخدعت زيه"],
            "verbal_tells": ["التعرق عند سؤاله عن كارت وليد"],
            "local_function": "witness",
            "recurring_npc": False,
            "grand_truth_relevance": [],
            "hidden_affiliations": []
        },
        {
            "character_id": "WIT-06-02",
            "name": "كريم طارق",
            "role_in_case": "Partner",
            "relationship_to_victim": "شريك بالشركة",
            "occupation": "CEO لشركة تكنولوجيا",
            "public_profile": "رجل أعمال جشع لكن لا يصل لدرجة الاغتيال.",
            "MBTI_Type": "ENTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 7,
                "base_lawyer_up_threshold": 9,
                "aggression_tolerance": 6,
                "rapport_affinity": 4,
                "evidence_rigidity": 5
            },
            "pressure_response": "anger",
            "deception_style": "direct",
            "speech_register": "professional",
            "favorite_phrases": ["أنا ماليش مصلحة يموت"],
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
        "success": ["case06_whisperer_first_sighting", "case06_symmetry_phrase_recorded", "whisperer_method_documented"],
        "partial": ["case06_suicide_accepted_with_doubts"],
        "failure": ["case06_suicide_accepted", "whisperer_invisible"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استكشاف اختفاء وليد وبحث الـ 4:30 فجراً."
        },
        "forensics": {
            "description": "فحص الحبل للتأكيد على أنه مشتريات حديثة غريبة."
        },
        "behavioral": {
            "description": "التناقض اللغوي في رسالة الانتحار مع لغة المبرمج، وتسجيلات التلاعب في دفتره."
        }
    },
    "derived_route_profile": {
        "timeline": 0.20,
        "forensics": 0.10,
        "behavioral": 0.70,
        "raw_scores": {
            "timeline": 0.9,
            "forensics": 0.6,
            "behavioral": 2.3
        },
        "normalization_total": 3.8,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": False,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_psychological_manipulation_murder"],
        "false_success_motive_ids": ["motive_clinical_depression_suicide"],
        "false_success_flag": "case06_suicide_accepted",
        "accepted_motive_ids": ["motive_psychological_manipulation_murder", "motive_clinical_depression_suicide"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 0,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-06-02", "EVID-06-03"],
            "cross_route_evidence_ids": [],
            "rejected_submission_reason_codes": ["missing_behavioral_manipulation_link"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "discovering_the_symmetry_phrase",
            "identifying_whisperer_ghost_profile"
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
        "soft_exposure_rules": [],
        "forensics_queue_pressure_rules": {
            "enabled": True,
            "pressure_increment": 1,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-06-02"
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
            "rule_id": "case06_success",
            "priority": 100,
            "required_flags_all": ["case06_whisperer_first_sighting"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case07",
            "target_case_path": "cases/case07/case07.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي بعد إدراك وجود المُلقن."
        }
    ]
}

with open("d:/game/cases/case06/case06.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case06.json")

