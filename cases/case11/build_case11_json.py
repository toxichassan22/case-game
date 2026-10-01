import json
import os

os.makedirs("d:/game/cases/case11", exist_ok=True)

case_data = {
    "case_id": "case11",
    "title": "الصدى",
    "crime_type": "syndicate_liquidation",
    "victim_name": "سارة الشريف",
    "overview": {
        "public_summary": "العثور على جثة صحفية استقصائية في شقتها بوسط البلد، يُشتبه بجرعة دوائية زائدة.",
        "main_question": "لماذا تم إسكات سارة، وماذا وجدت في تحقيقاتها الموازية؟",
        "stakes": "إدراك أن الثالوث يراقب ويُصفي من يقترب، واكتساب معلومات استخباراتية حيوية (عملية التماثل)."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "وفاة صحفية بجرعة أدوية",
        "message": "لا توجد علامات عنف في شقة سارة الشريف. عائلتها تنفي أي محاولات انتحار. هناك شيء غامض في حاسوبها الذي تم تفريغه."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-11-01",
            "case_id": "case11",
            "title": "المقال غير المنشور",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "ملف نصي على لابتوب الضحية يكشف شبكة 'الثالوث'.",
            "content_ref": "CASE11_SARAH_ARTICLE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_trinity_echo",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "digital",
                            "source_ref": "CASE11_SARAH_ARTICLE",
                            "interaction_id": "ARTICLE_ANALYSIS",
                            "expected_player_action": "review_document",
                            "required_result": "symmetry_operation_found"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "سارة وصلت للـ 'خيميائي' و'صانع الساعات' وسمّت منظومتهم 'عملية التماثل'. قتلولها لأنها عرفت أكثر مما ينبغي.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "trinity_intel", "carryover_potential"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0, "cyber": 0.0 },
            "grand_truth_axis": ["trinity"]
        },
        {
            "evidence_id": "EVID-11-02",
            "case_id": "case11",
            "title": "سجلات صيدلانية",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "الأدوية المسببة للوفاة ليست مسجلة باسم سارة في أي روشتة.",
            "content_ref": "CASE11_MEDICAL_HISTORY",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_forced_overdose",
                    "availability_mode": "delayed",
                    "delay_ticks": 1,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-MED-11",
                            "interaction_id": "TOXICOLOGY_REVIEW",
                            "expected_player_action": "review_report",
                            "required_result": "no_medical_history_match"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الجرعة فُرضت عليها. شخص ما تمكن من دخول شقتها بصمت وأجبرها على تعاطي الأدوية ليبدو كأنه انتحار.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "staged_suicide"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["murder"]
        },
        {
            "evidence_id": "EVID-11-03",
            "case_id": "case11",
            "title": "كاميرا المبنى",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "لقطة عابرة لشخص يغادر المبنى وقت الوفاة. بنيته الجسمانية تبدو مألوفة.",
            "content_ref": "CASE11_CCTV_FOOTAGE",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_shadow_match",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-11-01",
                            "expected_player_action": "connect_evidence",
                            "required_result": "shadow_silhouette_matched"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الظل يطابق بنية الشخص المحترق جزئياً في فيديو القضية 01. المنفذ الميداني هو نفسه في كلتا الجريمتين.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "shadow_operative", "case01_link"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["trinity", "shadow"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-11-01",
            "name": "رئيس التحرير",
            "role_in_case": "Distraction",
            "relationship_to_victim": "مدير العمل",
            "occupation": "صحفي",
            "public_profile": "رجل بيروقراطي يكره المشاكل. رفض نشر تحقيقاتها السابقة لتجنب الصدام مع الأمن.",
            "MBTI_Type": "ISTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 3,
                "base_lawyer_up_threshold": 5,
                "aggression_tolerance": 4,
                "rapport_affinity": 5,
                "evidence_rigidity": 6
            },
            "pressure_response": "collapse",
            "deception_style": "evasive",
            "speech_register": "formal",
            "favorite_phrases": ["أنا كنت بحاول أحميها من نفسها"],
            "verbal_tells": ["النظر للساعة باستمرار"],
            "local_function": "suspect",
            "recurring_npc": False,
            "grand_truth_relevance": [],
            "hidden_affiliations": []
        }
    ],
    "witnesses": [],
    "related_persons": [],
    "required_flags": ["arc1_complete"],
    "outcome_flags": {
        "success": ["case11_resolved_true", "trinity_independently_confirmed", "operation_symmetry_named", "sarah_article_collected"],
        "partial": ["case11_journalist_resolved"],
        "failure": ["case11_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "ربط ظل كاميرا سارة بالكاميرا من القضية 01 لتأكيد هوية المنفذ."
        },
        "forensics": {
            "description": "إثبات عدم وجود تاريخ طبي للأدوية لتأكيد نظرية القتل."
        },
        "behavioral": {
            "description": "قراءة المقال بعناية لاكتشاف أسماء العملية وتأكيد نظرية الشبكة ليكون دافع القتل."
        }
    },
    "derived_route_profile": {
        "timeline": 0.40,
        "forensics": 0.30,
        "behavioral": 0.30,
        "raw_scores": {
            "timeline": 1.2,
            "forensics": 0.9,
            "behavioral": 0.9
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
        "accepted_true_motive_ids": ["motive_trinity_silencing"],
        "false_success_motive_ids": ["motive_suicide", "motive_editor_dispute"],
        "false_success_flag": "case11_resolved_false",
        "accepted_motive_ids": ["motive_trinity_silencing", "motive_suicide", "motive_editor_dispute"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 1,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-11-01"],
            "cross_route_evidence_ids": ["EVID-11-02", "EVID-11-03"],
            "rejected_submission_reason_codes": ["missing_silencing_motive"]
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
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-11-02"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 30,
            "minimum_score": 30,
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
            "rule_id": "case11_success",
            "priority": 100,
            "required_flags_all": ["case11_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case12",
            "target_case_path": "cases/case12/case12.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case11/case11.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case11.json")

