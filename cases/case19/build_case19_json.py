import json
import os

os.makedirs("d:/game/cases/case19", exist_ok=True)

case_data = {
    "case_id": "case19",
    "title": "الحفرة",
    "crime_type": "syndicate_artifacts_smuggling",
    "victim_name": "عم حسن (حارس أمن متوفى)",
    "overview": {
        "public_summary": "العثور على جثة حارس موقع أثري في سقارة بجوار نفق تنقيب عميق.",
        "main_question": "هل هذا مجرد اعتداء لصوص مقابر أم مشروع تنقيب محمي بأوراق رسمية؟",
        "stakes": "اكتشاف البعد المالي والاقتصادي لشبكة الثالوث (تزوير العقود أبعد من مجرد عقارات)."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "جريمة في سقارة",
        "message": "حارس موقع آثار مضروب على راسه ميت. لقينا جنبه نفق حفر طوله 30 متر مجهز بمعدات ثقيلة مش شغل هواة. اقبضوا على اللي بيحفروا واعرفوا مين بيمولهم."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-19-01",
            "case_id": "case19",
            "title": "عقود مساحة الحفر",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "سندات ملكية أرض الموقع المسجلة باسم شركة 'مصر الجديدة للاستثمار'.",
            "content_ref": "CASE19_LAND_DEED",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_ink_match",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "document",
                            "source_ref": "CASE19_LAND_DEED",
                            "interaction_id": "INK_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "forgery_ink_matches_case05"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الورق مزور باستخدام نفس المعدات والحبر الكيميائي الموجود في قضايا الأراضي القديمة (القضية 5 و 7). الأرض مسروقة لتغطية تنقيب الآثار بحماية كاذبة.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "forgery_network", "alchemist_ink"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-19-02",
            "case_id": "case19",
            "title": "سجلات التحويلات المالية للمقاول",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "إيصالات دفع سنوية بقيمة 120 ألف جنيه من المقاول للشركة.",
            "content_ref": "FIN-TRANSFERS-19",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_maghraby_link",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-19-MAGHRABY",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "maghraby_funding_confirmed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المنقب (صفوت) يدفع هذه المبالغ لشركة المغربي (من القضية 10) كإيجار وحماية للأرض المتنازع عليها، مما يكشف مصدر دخل آخر للثالوث لتمويل عملياتهم.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "financial_crime", "trinity_economics"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["engineer"]
        },
        {
            "evidence_id": "EVID-19-03",
            "case_id": "case19",
            "title": "اعتراف صفوت الإمام",
            "type": "document",
            "evidence_tier": "supporting",
            "evidence_role": "context",
            "summary": "أقوال المنقب عن الدعم اللوجستي وحماية 'ناس كبار'.",
            "content_ref": "INT-SAFWAT-01",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_safwat_fear",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_INTERROGATION_NODE_UNLOCKED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "INTERROGATION_COMPLETED",
                            "source_type": "interrogation",
                            "source_ref": "INT-SAFWAT-01",
                            "interaction_id": "Q_PROTECTION",
                            "expected_player_action": "interrogate",
                            "required_result": "protection_fear_revealed"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "صفوت قتل الحارس عندما فاجأه، لكنه لم يخطط للتنقيب وحدُه؛ لقد استند إلى أوراق منحها إياه 'حيتان' زعموه أنها أراضيهم، مماثلة لعقلية الضحايا السابقين المغرر بهم.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "proxy_weaponization", "engineer_influence"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-19-01",
            "name": "صفوت الإمام",
            "role_in_case": "Culprit",
            "relationship_to_victim": "قاتل، ضرب الحارس الذي ضبطه ينقب.",
            "occupation": "تاجر آثار وحفار (السوق السوداء)",
            "public_profile": "مهرب مخضرم ذو سوابق، يتجنب القتل عادة إلا عند الضرورة.",
            "MBTI_Type": "ESTP",
            "cognitive_profile": {
                "base_collapse_threshold": 5,
                "base_lawyer_up_threshold": 7,
                "aggression_tolerance": 4,
                "rapport_affinity": 4,
                "evidence_rigidity": 5
            },
            "pressure_response": "bargain",
            "deception_style": "deflection",
            "speech_register": "casual",
            "favorite_phrases": ["الورق اللي معايا سليم", "أنا بدفع إيجاري لشركة محترمة"],
            "verbal_tells": ["التلفت المستمر", "فرك اليدين"],
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
        "success": ["case19_resolved_true", "case19_artifacts_resolved", "trinity_economics_mapped", "forgery_covers_antiquities"],
        "partial": ["case19_artifacts_resolved"],
        "failure": ["case19_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "توصيل الحوالات المالية بشركة المغربي المزورة لإثبات غسيل الأموال."
        },
        "forensics": {
            "description": "مضاهاة حبر عقود الأرض مع أراشيف القضايا 5 و 7 لمعرفة المصدر الحقيقي."
        },
        "behavioral": {
            "description": "الضغط على صفوت لكشف شبكة الحماية الموهومة واعترافه بتأجير الأرض المننهوبة."
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
        "accepted_true_motive_ids": ["motive_syndicate_funding", "motive_greed"],
        "false_success_motive_ids": ["motive_accidental_death", "motive_personal_dispute"],
        "false_success_flag": "case19_resolved_false",
        "accepted_motive_ids": ["motive_syndicate_funding", "motive_accidental_death", "motive_personal_dispute", "motive_greed"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-19-03"],
            "cross_route_evidence_ids": ["EVID-19-01", "EVID-19-02"],
            "rejected_submission_reason_codes": ["missing_trinity_financial_link"]
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
                "evidence_id": "EVID-19-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 75,
            "minimum_score": 75,
            "allow_score_decay": False,
            "early_detection_threshold": 80,
            "retaliation_thresholds": [85, 90],
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
            "rule_id": "case19_success",
            "priority": 100,
            "required_flags_all": ["case19_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case20",
            "target_case_path": "cases/case20/case20.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case19/case19.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case19.json")


