import json
import os

os.makedirs("d:/game/cases/case13", exist_ok=True)

case_data = {
    "case_id": "case13",
    "title": "الغريق",
    "crime_type": "syndicate_assassination",
    "victim_name": "كمال صلاح",
    "overview": {
        "public_summary": "العثور على جثة ضابط متقاعد في النيل قرب كورنيش المعادي، يشتبه في غرق عرضي أو انتحار.",
        "main_question": "إلى أي مدى وصل كمال في تحقيقاته الفردية عن الشبكة، ولماذا توجب قتله الآن؟",
        "stakes": "الحصول على ملاحظات كمال التي تضيق الخناق على 'المُلقن' وتثبت أن الثالوث بدأ يتخلص من المحققين."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "غريق المعادي - زميل سابق",
        "message": "كمال صلاح، ضابط سابق أُحيل للتقاعد، وُجد غريقاً في النيل. زوجته السابقة تطالب بالتأمين وهناك شبهة جنائية. كمال كان يسأل أسئلة غريبة قبل موته."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-13-01",
            "case_id": "case13",
            "title": "تقرير السموم المتقدم",
            "type": "report",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "الطب الشرعي وجد آثار مركب كيميائي غير מألوف يسبب شللاً عضلياً فورياً.",
            "content_ref": "LAB-TOX-13",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_paralysis_toxin",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-TOX-13",
                            "interaction_id": "CHEMICAL_ANALYSIS",
                            "expected_player_action": "review_report",
                            "required_result": "paralysis_toxin_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "هذا السم يضمن غرق الضحية دون مقاومة لتبدو وكأنها حادثة عرضية. هذا تعقيد يحمل بصمة الخيميائي.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_toxin", "murder_weapon"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0, "cyber": 0.0 },
            "grand_truth_axis": ["alchemist", "murder"]
        },
        {
            "evidence_id": "EVID-13-02",
            "case_id": "case13",
            "title": "مذكرات كمال",
            "type": "document",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "نوتة محترقة جزئياً كانت في جيب كمال، تحتوي ملاحظات حول أشخاص ينهارون بعد تحسن مريب.",
            "content_ref": "CASE13_KAMAL_NOTES",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_whisperer_institution",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "document",
                            "source_ref": "CASE13_KAMAL_NOTES",
                            "interaction_id": "PAGES_RESTORED",
                            "expected_player_action": "review_document",
                            "required_result": "institution_link_found"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "كمال استنتج أن 'المُلقن' ليس مستشاراً حراً، بل موظف في مؤسسة صحية أو نفسية يمتلك صلاحيات للوصول إلى المرضى والتلاعب بهم رسمياً.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "whisperer_intel", "carryover_potential"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer"]
        },
        {
            "evidence_id": "EVID-13-03",
            "case_id": "case13",
            "title": "سجلات كاميرات الكورنيش",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "سجلات صيانة أنظمة مراقبة النيل في منطقة المعادي.",
            "content_ref": "CASE13_CCTV_LOGS",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_six_minutes_blind",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "BOARD_CONNECTION_MADE",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-13-CCTV",
                            "expected_player_action": "connect_evidence",
                            "required_result": "six_minute_outage_verified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الكاميرات لم تتعطل مصادفة، بل تم إطفاؤها برمجياً لمدة 6 دقائق بالضبط. هذا تغطية مقصودة لمكان رمي الجثة من تنفيذ صانع الساعات.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker_trace"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-13-01",
            "name": "نهى زوجة كمال السابقة",
            "role_in_case": "Distraction",
            "relationship_to_victim": "الزوجة السابقة والمستفيدة من التأمين",
            "occupation": "مديرة مبيعات",
            "public_profile": "سيدة عملية، على خلاف مادي دائم مع كمال بسبب النفقة ومصاريف الأولاد.",
            "MBTI_Type": "ESTJ",
            "cognitive_profile": {
                "base_collapse_threshold": 6,
                "base_lawyer_up_threshold": 4,
                "aggression_tolerance": 7,
                "rapport_affinity": 3,
                "evidence_rigidity": 5
            },
            "pressure_response": "lawyer_up",
            "deception_style": "defensive",
            "speech_register": "formal",
            "favorite_phrases": ["أنا ماليش دعوة بمشاكله"],
            "verbal_tells": ["التكتف وتقاطع الأذرع"],
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
        "success": ["case13_resolved_true", "case13_drowned_resolved", "whisperer_narrowed_to_institution", "kamal_notes_collected", "trinity_kills_investigators"],
        "partial": ["case13_drowned_resolved"],
        "failure": ["case13_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "إثبات انقطاع الكاميرات المتعمد لنفي احتمالية الغرق العرضي أو الانتحار العفوي."
        },
        "forensics": {
            "description": "تحديد السم المسبب للشلل الذي يمنع الضحية من السباحة."
        },
        "behavioral": {
            "description": "استخراج أهمية كمال كتهديد للثالوث من خلال قراءة مذكراته."
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
        "requires_culprit": False,
        "requires_motive": True,
        "requires_method_or_opportunity": True,
        "minimum_evidence_count": 3,
        "accepted_true_motive_ids": ["motive_trinity_assassination"],
        "false_success_motive_ids": ["motive_insurance_fraud", "motive_accidental_drowning"],
        "false_success_flag": "case13_resolved_false",
        "accepted_motive_ids": ["motive_insurance_fraud", "motive_accidental_drowning", "motive_trinity_assassination"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-13-02"],
            "cross_route_evidence_ids": ["EVID-13-01", "EVID-13-03"],
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
                "action": "REVIEW_EVIDENCE",
                "before_evidence_verified": "EVID-13-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 40,
            "minimum_score": 40,
            "allow_score_decay": False,
            "early_detection_threshold": 45,
            "retaliation_thresholds": [50, 60],
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
            "rule_id": "case13_success",
            "priority": 100,
            "required_flags_all": ["case13_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case14",
            "target_case_path": "cases/case14/case14.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case13/case13.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case13.json")

