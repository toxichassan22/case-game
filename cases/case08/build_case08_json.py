import json
import os

os.makedirs("d:/game/cases/case08", exist_ok=True)

case_data = {
    "case_id": "case08",
    "title": "الوجه المقلوب",
    "crime_type": "digital_identity_theft",
    "victim_name": "ثروت الدسوقي",
    "overview": {
        "public_summary": "سرقة 1.2 مليون جنيه من حسابات بنكية لرجل متقاعد عبر تقنيات تخطي الـ OTP الحديثة.",
        "main_question": "هل المجرم هو شاب عشريني يتعامل بالقطعة أم عقل رياضي متطور في الخلفية؟",
        "stakes": "كشف أول ظهور رئيسي وتوقيع برمجي لأكثر أعضاء الثالوث هوساً بالتوقيت والنظام (صانع الساعات)."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "اختراق حسابات بنكية كبرى",
        "message": "شكوى من عميل VIP بأن كافة حساباته صُفرت إلكترونياً رغم حماية الهواتف. مباحث الإنترنت أحالت الملف لنا بسبب شكوك بوجود شبكة منظمة."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-08-01",
            "case_id": "case08",
            "title": "سجل المعاملات البنكية المتناظرة",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "معاملات سحب من 3 بنوك في 7 أيام متتالية، كلها نُفذت في الدقيقة 30 من كل ساعة.",
            "content_ref": "CASE08_BANK_RECORDS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_timeline",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "document",
                            "source_ref": "CASE08_BANK_RECORDS",
                            "interaction_id": "PATTERN_MATCH",
                            "expected_player_action": "inspect_object",
                            "required_result": "perfect_time_symmetry_found"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "السارق مهووس بالأنماط الرياضية والتناظر الزمني، وهو نمط يستحيل أن يقوم به لص مالي عادي.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "timing_obsession"],
            "route_weight": { "timeline": 0.80, "forensics": 0.0, "behavioral": 0.20 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-08-02",
            "case_id": "case08",
            "title": "كود البرنامج الخبيث (Malware)",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "ملف APK مسحوب من هاتف الضحية والمستخدم لاعتراض رسائل OTP.",
            "content_ref": "CASE08_MALWARE_APK",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["cyber"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_malware_analysis",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-CYBER-08",
                            "interaction_id": "REVERSE-ENGINEER",
                            "expected_player_action": "review_report",
                            "required_result": "clockmaker_variables_uncovered"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "يتضمن متغيرات بأسماء ماركات ساعات (rolex, seiko) وتوقيتات بمستوى ملي ثانية. بصمة رقمية فريدة تسمى 'صانع الساعات'.",
            "penalty_if_mishandled": ["penalty_police_trust_loss"],
            "tags": ["cyber", "clockmaker_signature", "forensics"],
            "route_weight": { "timeline": 0.0, "forensics": 0.80, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-08-03",
            "case_id": "case08",
            "title": "إفادة سيد التقنية",
            "type": "document",
            "evidence_tier": "supporting",
            "evidence_role": "prove",
            "summary": "سيد مصدوم من مستوى الكود المكتوب.",
            "content_ref": "CASE08_SAYED_CONFESSION",
            "locked": True,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": ["EVID-08-02"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_hacker_respect",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-SAYED-01",
                            "interaction_id": "Q04",
                            "expected_player_action": "interrogate",
                            "required_result": "sayed_admits_inferiority"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "يقر سيد بأنه مجرد موصل وأن العميل الأصلي أرسل الكود جاهزاً. 'ده شغل ناس بتحسب كل ملي ثانية.'",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "clockmaker"],
            "route_weight": { "timeline": 0.0, "forensics": 0.40, "behavioral": 0.60 },
            "grand_truth_axis": ["clockmaker"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-08-01",
            "name": "سيد ('الهاكر الحر')",
            "role_in_case": "Primary Target",
            "relationship_to_victim": "سارق الحسابات",
            "occupation": "هاكر مستقل",
            "public_profile": "شاب يعيش خلف شاشات متعددة ويقوم بأعمال قذرة في الدارك ويب.",
            "MBTI_Type": "INTP",
            "cognitive_profile": {
                "base_collapse_threshold": 4,
                "base_lawyer_up_threshold": 8,
                "aggression_tolerance": 3,
                "rapport_affinity": 6,
                "evidence_rigidity": 8
            },
            "pressure_response": "logic",
            "deception_style": "defensive",
            "speech_register": "professional",
            "favorite_phrases": ["أنا عمري ما كتبت كود بالمستوى ده"],
            "verbal_tells": ["يلمس لوحة المفاتيح التخيلية عند التوتر"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": ["Corporate Pawn"],
            "hidden_affiliations": ["Dark Web For Hire"]
        }
    ],
    "witnesses": [
        {
            "character_id": "WIT-08-01",
            "name": "خالد ثروت",
            "role_in_case": "Distraction",
            "relationship_to_victim": "ابن الضحية",
            "occupation": "موظف",
            "public_profile": "ابن عاق جزئياً يعاني من ضوائق مالية.",
            "MBTI_Type": "ESFP",
            "cognitive_profile": {
                "base_collapse_threshold": 3,
                "base_lawyer_up_threshold": 6,
                "aggression_tolerance": 5,
                "rapport_affinity": 5,
                "evidence_rigidity": 4
            },
            "pressure_response": "collapse",
            "deception_style": "passive",
            "speech_register": "street",
            "favorite_phrases": ["أنا محتاج فلوس آه، بس مش هاسرق أبويا"],
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
        "success": ["case08_resolved_true", "case08_identity_resolved", "clockmaker_digital_signature", "timing_obsession_noted"],
        "partial": ["case08_identity_resolved"],
        "failure": ["case08_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "استكشاف النمط الزمني الغريب للمعاملات المالية."
        },
        "forensics": {
            "description": "تحليل الهندسة العكسية لبرنامج الـ APK وتحديد المتغيرات الغريبة."
        },
        "behavioral": {
            "description": "استجواب سيد وإثبات أنه لا يمتلك المهارة البرمجية الكافية لكتابة الكود."
        }
    },
    "derived_route_profile": {
        "timeline": 0.40,
        "forensics": 0.40,
        "behavioral": 0.20,
        "raw_scores": {
            "timeline": 1.2,
            "forensics": 1.2,
            "behavioral": 0.6
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
        "accepted_true_motive_ids": ["motive_clockmaker_field_test"],
        "false_success_motive_ids": ["motive_petty_financial_hack", "motive_son_stole_inheritance"],
        "false_success_flag": "case08_resolved_false",
        "accepted_motive_ids": ["motive_clockmaker_field_test", "motive_petty_financial_hack"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 0,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": [],
            "cross_route_evidence_ids": ["EVID-08-01", "EVID-08-02"],
            "rejected_submission_reason_codes": ["missing_clockmaker_link"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "discovering_the_clockmaker_signature"
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
            "pressure_increment": 2,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-08-02"
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
            "default_role": "cyber"
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
            "rule_id": "case08_success",
            "priority": 100,
            "required_flags_all": ["case08_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case09",
            "target_case_path": "cases/case09/case09.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي للتحقيق."
        }
    ]
}

with open("d:/game/cases/case08/case08.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case08.json")

