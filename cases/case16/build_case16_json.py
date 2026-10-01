import json
import os

os.makedirs("d:/game/cases/case16", exist_ok=True)

case_data = {
    "case_id": "case16",
    "title": "الخيط الأحمر",
    "crime_type": "syndicate_extortion",
    "victim_name": "منال عباس",
    "overview": {
        "public_summary": "صاحبة مصنع بالإسكندرية تتلقى تهديدات معقدة واختفاء مؤقت لابنتها.",
        "main_question": "هل هذا ابتزاز محلي عادي أم امتداد للشبكة خارج العاصمة؟",
        "stakes": "إدراك أن الثالوث يتوسع وطنياً ويستخدم جرائمه كأدوات ترهيب نفسية."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "مأمورية سريعة للإسكندرية",
        "message": "سيدة أعمال اسمها منال عباس بلغت عن تهديدات واختفاء بنتها لمدة 6 ساعات. الموضوع شكله أكبر من مجرمين عاديين لأن التقنيات المستخدمة غريبة جداً."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-16-01",
            "case_id": "case16",
            "title": "الوثائق الضريبية المزورة",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "ملف يثبت تهرباً ضريبياً لمنال عباس، يُستخدم لابتزازها.",
            "content_ref": "CASE16_TAX_DOCS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_ink_analysis",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "physical",
                            "source_ref": "CASE16_TAX_DOCS",
                            "interaction_id": "INK_SPECTROSCOPY",
                            "expected_player_action": "inspect_object",
                            "required_result": "trinity_ink_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الحبر المستخدم في التوقيعات المزورة مطابق تماماً لتركيبة الحبر المستخرج من قضايا التزوير السابقة في القاهرة (القضية 5 و 7). المزور واحد.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "forgery", "past_case_link"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist", "forgery"]
        },
        {
            "evidence_id": "EVID-16-02",
            "case_id": "case16",
            "title": "سجلات الـ GPS للابنة",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "البيانات الجغرافية لهاتف ابنة منال خلال فترة اختفائها.",
            "content_ref": "CASE16_DAUGHTER_PHONE",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_gps_spoofed",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-16-GPS",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "gps_spoofing_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الابنة لم تُختطف إلى الصحراء. تم اعتراض إشارة قمر الـ GPS لجهازها (GPS Spoofing) لإظهار موقع وهمي بينما كانت في مقهى قريب، لإثارة رعب الأم. بصمة صانع الساعات.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker_trace"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-16-03",
            "case_id": "case16",
            "title": "رسائل التهديد",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "نصوص الرسائل المرسلة لمنال، والتي تطلب مبلغاً كبيراً في حساب بيتكوين.",
            "content_ref": "CASE16_THREAT_SMS",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_whisperer_psy_ops",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "digital",
                            "source_ref": "CASE16_THREAT_SMS",
                            "interaction_id": "TEXT_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "whisperer_manipulation_tactics"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الرسائل لا تحتوي على وعيد فج، بل تستخدم أسلوباً نفسياً متطوراً: التشكيك والتلميحات واللعب على غريزة الأمومة. هذا هو 'المُلقن' بأسلوبه المميز.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "whisperer_intel"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        },
        {
            "evidence_id": "EVID-16-04",
            "case_id": "case16",
            "title": "اعترافات وائل",
            "type": "document",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "أقوال المُنفذ الميداني (وائل) الذي تم القبض عليه.",
            "content_ref": "INT-WAEL-01",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid04_wael_threatened",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-WAEL-01",
                            "interaction_id": "Q_MOTIVE",
                            "expected_player_action": "interrogate",
                            "required_result": "past_crimes_as_threat"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "وائل مجرد أداة مرعوبة. المشغّلون على تيليجرام هددوه بأن يكون مصيره كمصير الصحفية التي قُتلت في القاهرة. الثالوث يرتكب الجرائم ويستخدمها كدعاية لإرهاب الآخرين.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "trinity_fear_tactics", "case11_reference"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["trinity"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-16-01",
            "name": "وائل",
            "role_in_case": "Proxy",
            "relationship_to_victim": "مجرم مأجور لترويع الضحية",
            "occupation": "عاطل / مجرم محلي",
            "public_profile": "شخص له سوابق بسيطة، ارتبك جداً عند تنفيذ عملية بهذا الحجم الموازي والتقني.",
            "MBTI_Type": "ESTP",
            "cognitive_profile": {
                "base_collapse_threshold": 3,
                "base_lawyer_up_threshold": 9,
                "aggression_tolerance": 4,
                "rapport_affinity": 6,
                "evidence_rigidity": 2
            },
            "pressure_response": "confess_true",
            "deception_style": "defensive",
            "speech_register": "informal_slang",
            "favorite_phrases": ["أنا ماليش دعوة بالتقيل ده", "هما اللي قالولي هقتلوني زي الصحفية"],
            "verbal_tells": ["التلفت السريع حوله", "القسم المبالغ فيه"],
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
        "success": ["case16_resolved_true", "trinity_operates_nationally", "gps_spoofing_confirmed", "trinity_uses_past_crimes_as_threats", "manal_safe"],
        "partial": ["manal_safe"],
        "failure": ["case16_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "تشفير مكان الابنة لإثبات التلاعب التقني وعلاقته بصانع الساعات."
        },
        "forensics": {
            "description": "استخدام التحليل الطيفي لاكتشاف بصمة التزوير الخاصة بالخيميائي في أوراق التهديد."
        },
        "behavioral": {
            "description": "قراءة البعد النفسي في إفادة وائل والرسائل الموجهة لإيصال التهديد لمرحلة متقدمة."
        }
    },
    "derived_route_profile": {
        "timeline": 0.35,
        "forensics": 0.30,
        "behavioral": 0.35,
        "raw_scores": {
            "timeline": 1.05,
            "forensics": 0.9,
            "behavioral": 1.05
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
        "accepted_true_motive_ids": ["motive_syndicate_extortion"],
        "false_success_motive_ids": ["motive_local_blackmail", "motive_personal_vendetta"],
        "false_success_flag": "case16_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_extortion", "motive_local_blackmail", "motive_personal_vendetta"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-16-03", "EVID-16-04"],
            "cross_route_evidence_ids": ["EVID-16-01", "EVID-16-02"],
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
            "pressure_increment": 2,
            "requires_player_facing_explanation": True,
            "trigger_when": {
                "action": "QUEUE_EVIDENCE",
                "evidence_id": "EVID-16-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 60,
            "minimum_score": 60,
            "allow_score_decay": False,
            "early_detection_threshold": 65,
            "retaliation_thresholds": [65, 75],
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
            "rule_id": "case16_success",
            "priority": 100,
            "required_flags_all": ["case16_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case17",
            "target_case_path": "cases/case17/case17.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case16/case16.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case16.json")


