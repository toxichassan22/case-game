import json
import os

os.makedirs("d:/game/cases/case05", exist_ok=True)

case_data = {
    "case_id": "case05",
    "title": "الأرشيف",
    "crime_type": "institutional_forgery_homocide",
    "victim_name": "ناصر عبد العال",
    "overview": {
        "public_summary": "موظف أرشيف في السجل المدني يعثر عليه ميتاً بأزمة قلبية في مكتبه المغلق من الداخل صباحاً.",
        "main_question": "هل يقتل الموظفون الحكوميون الصامتون لأسباب طبيعية فقط؟",
        "stakes": "كشف أول شبكة تزوير مؤسسية ضخمة مدعومة من كيانات عليا (الثالوث)."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "وفاة في السجل المدني",
        "message": "استدعاء عاجل. مكتب السجل المدني بوسط البلد. موظف أرشيف توفي في مكتبه. مديرية الأمن تطلب حسماً سريعاً للاضطراب الذي سببه الحادث في المبنى."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-05-01",
            "case_id": "case05",
            "title": "أثر وخز الإبرة",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "نقطة صغيرة خلف الأذن اليسرى لا تُلاحظ إلا بالفحص الدقيق.",
            "content_ref": "CASE05_BODY_NECK",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_tox_screen",
                    "availability_mode": "delayed",
                    "delay_ticks": 2,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-TOX-05",
                            "interaction_id": "RESULT-READY",
                            "expected_player_action": "review_report",
                            "required_result": "artificial_cardiac_arrest_toxin"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "سم كيميائي متطور مصمم خصيصاً لاصطناع أزمة قلبية طبيعية (بصمة الخيميائي).",
            "penalty_if_mishandled": ["penalty_police_trust_loss"],
            "tags": ["forensics", "alchemist", "murder_weapon"],
            "route_weight": { "timeline": 0.0, "forensics": 0.80, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-05-02",
            "case_id": "case05",
            "title": "USB الأرشيف السري",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "فلاش درايف مخفي في تجويف سري حفره ناصر في درجه.",
            "content_ref": "CASE05_HIDDEN_USB",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["cyber"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_decryption",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "digital",
                            "source_ref": "CASE05_HIDDEN_USB",
                            "interaction_id": "DECRYPT",
                            "expected_player_action": "inspect_object",
                            "required_result": "forgery_network_uncovered"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "يحتوي على نسخ لـ 47 وثيقة مزورة بالكامل مرتبطة بشركة 'مصر الجديدة للاستثمار'.",
            "penalty_if_mishandled": [],
            "tags": ["cyber", "institutional_corruption", "carryover"],
            "route_weight": { "timeline": 0.0, "forensics": 0.50, "behavioral": 0.0 },
            "grand_truth_axis": ["institutional_corruption"]
        },
        {
            "evidence_id": "EVID-05-03",
            "case_id": "case05",
            "title": "سيجارة الممر",
            "type": "physical",
            "evidence_tier": "supporting",
            "evidence_role": "prove",
            "summary": "عقب سيجارة ماركة LM تُركت في الممر الجانبي الضيق تحت النافذة.",
            "content_ref": "CASE05_CIGARETTE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_dna",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-DNA-05",
                            "interaction_id": "DNA-MATCH",
                            "expected_player_action": "review_report",
                            "required_result": "dna_matches_essam"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الـ DNA يتطابق مع عصام القاضي، مما يضعه في مسار الهروب المباشر.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "timeline", "suspect_link"],
            "route_weight": { "timeline": 0.40, "forensics": 0.60, "behavioral": 0.0 },
            "grand_truth_axis": []
        },
        {
            "evidence_id": "EVID-05-04",
            "case_id": "case05",
            "title": "سجل الانصراف المتأخر",
            "type": "document",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "عصام القاضي سجل خروج الساعة 11 مساءً بخلاف مواعيد العمل الرسمية.",
            "content_ref": "CASE05_ATTENDANCE_LOG",
            "locked": False,
            "requires_warrant": False,
            "state": "verified",
            "requires_route_collaboration": [],
            "depends_on_evidence_ids": [],
            "completion_triggers": [],
            "upgraded_summary": None,
            "penalty_if_mishandled": [],
            "tags": ["timeline", "behavioral"],
            "route_weight": { "timeline": 0.80, "forensics": 0.0, "behavioral": 0.20 },
            "grand_truth_axis": []
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-05-01",
            "name": "عصام القاضي",
            "role_in_case": "Primary Target",
            "relationship_to_victim": "زميل في التوثيق",
            "occupation": "موظف أرشيف",
            "public_profile": "موظف عادي يتلقى 8 آلاف جنيه شهرياً من 'الشركة' رشوة.",
            "MBTI_Type": "ISFP",
            "cognitive_profile": {
                "base_collapse_threshold": 4,
                "base_lawyer_up_threshold": 6,
                "aggression_tolerance": 2,
                "rapport_affinity": 3,
                "evidence_rigidity": 8
            },
            "pressure_response": "collapse",
            "deception_style": "defensive",
            "speech_register": "street",
            "favorite_phrases": ["أنا ماليش دعوة، دول مبيسيبوش حد"],
            "verbal_tells": ["ارتجاف اليدين", "الخوف عند ذكر جهات كبرى"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": ["Corporate Pawn"],
            "hidden_affiliations": ["Maser El-Gedida Investments"]
        }
    ],
    "witnesses": [
        {
            "character_id": "WIT-05-01",
            "name": "مدير السجل المدني",
            "role_in_case": "Administrator",
            "relationship_to_victim": "مديره المباشر",
            "occupation": "إداري حكومي",
            "public_profile": "يهتم بصورة المكتب ولا يبحث عن مشاكل.",
            "MBTI_Type": "ESTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 8,
                "base_lawyer_up_threshold": 4,
                "aggression_tolerance": 6,
                "rapport_affinity": 5,
                "evidence_rigidity": 5
            },
            "pressure_response": "anger",
            "deception_style": "direct",
            "speech_register": "formal",
            "favorite_phrases": ["الموضوع منتهي وربنا يرحمه"],
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
        "success": ["case05_correct_closure", "institutional_corruption_seed", "usb_evidence_collected", "alchemist_fourth_application"],
        "partial": ["case05_resolved_partial"],
        "failure": ["case05_missed_murder", "institutional_corruption_hidden"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تأكيد تواجد عصام في المبنى خلال حدوث الوفاة من السجلات."
        },
        "forensics": {
            "description": "العثور على الإبرة واختبار DNA على السيجارة."
        },
        "behavioral": {
            "description": "استجواب عصام ودفعه للاعتراف بتمويله من الشركة خوفاً من الجهات الأكبر."
        }
    },
    "derived_route_profile": {
        "timeline": 0.40,
        "forensics": 0.40,
        "behavioral": 0.20,
        "raw_scores": {
            "timeline": 1.2,
            "forensics": 1.9,
            "behavioral": 0.2
        },
        "normalization_total": 4.0,
        "formula_version": "v1_weighted_state_normalized",
        "computed_from_evidence": True
    },
    "closure_rules": {
        "requires_culprit": True,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_conceal_forgery"],
        "false_success_motive_ids": ["motive_natural_heart_attack"],
        "false_success_flag": "case05_missed_murder",
        "accepted_motive_ids": ["motive_conceal_forgery", "motive_natural_heart_attack"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 0,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": True,
            "behavioral_chain_evidence_ids": [],
            "cross_route_evidence_ids": ["EVID-05-01"],
            "rejected_submission_reason_codes": ["missing_murder_weapon"]
        }
    },
    "trinity_hooks": {
        "awareness_sources": [
            "detecting_cardiac_toxin",
            "finding_massive_forgery_usb"
        ],
        "retaliation_rules": []
    },
    "hidden_systems": {
        "route_collaboration": {
            "minimum_required_chains": 1,
            "shared_evidence_completion_required": True,
            "critical_evidence_requires_alternative_paths": False,
            "minimum_alternative_trigger_sets_for_critical_evidence": 1
        },
        "evidence_reinterpretation_rules": [],
        "soft_exposure_rules": [],
        "forensics_queue_pressure_rules": {
            "enabled": True,
            "pressure_increment": 2,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-05-01"
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
            "rule_id": "case05_success",
            "priority": 100,
            "required_flags_all": ["case05_correct_closure"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case06",
            "target_case_path": "cases/case06/case06.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي للتحقيق."
        }
    ]
}

with open("d:/game/cases/case05/case05.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case05.json")
