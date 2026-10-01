import json
import os

os.makedirs("d:/game/cases/case15", exist_ok=True)

case_data = {
    "case_id": "case15",
    "title": "الزنزانة الخامسة",
    "crime_type": "syndicate_message",
    "victim_name": "5 محتجزين (بينهم ضحية بقرار من اللاعب)",
    "overview": {
        "public_summary": "وفاة 5 محتجزين في زنزانة قسم شرطة حلوان بشكل غامض في نفس الوقت.",
        "main_question": "كيف تُم اختراق قسم شرطة بالكامل لقتل 5 أشخاص؟ وما علاقة اللاعب بأحد الضحايا؟",
        "stakes": "اكتشاف أن الثالوث يراقبقرارات اللاعب ويعمل كفريق متكامل لأول مرة."
    },
    "inbox_brief": {
        "sender": "HQ",
        "subject": "كارثة في حلوان",
        "message": "5 مساجين ماتوا في سريرهم في القسم الساعة 3:30 الفجر. الموضوع هيقلب رأي عام. روح هناك فوراً والموضوع ميتسربش للإعلام."
    },
    "evidence_list": [
        {
            "evidence_id": "EVID-15-01",
            "case_id": "case15",
            "title": "تحليل طعام الحجز",
            "type": "report",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "معمل السموم حلل بقايا وجبة العدس التي أُكلت في الزنزانة.",
            "content_ref": "LAB-TOX-15",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["forensics"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid01_alchemist_food",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_EVIDENCE_VERIFIED",
                            "source_type": "report",
                            "source_ref": "LAB-TOX-15",
                            "interaction_id": "FOOD_ANALYSIS",
                            "expected_player_action": "review_report",
                            "required_result": "tasteless_toxin_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "السم المستخدم لا طعم له ولا لون، صُمم خصيصاً ليُبتلع دون مقاومة. هذا عمل 'الخيميائي'.",
            "penalty_if_mishandled": [],
            "tags": ["forensics", "alchemist_weapon"],
            "route_weight": { "timeline": 0.0, "forensics": 1.0, "behavioral": 0.0, "cyber": 0.0 },
            "grand_truth_axis": ["alchemist"]
        },
        {
            "evidence_id": "EVID-15-02",
            "case_id": "case15",
            "title": "سجل كاميرات القسم",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "prove",
            "summary": "سجلات أمنية تظهر تعطلاً غريباً لكاميرا ممر المطبخ.",
            "content_ref": "CASE15_CCTV",
            "locked": False,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid02_clockmaker_outage",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-15-CCTV",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "six_minute_outage_verified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "الكاميرات فُصلت برمجياً بشكل دقيق لمدة 6 دقائق فقط (03:27 إلى 03:33). تغطية مثالية، بصمة 'صانع الساعات'.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker_trace", "six_minutes"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-15-03",
            "case_id": "case15",
            "title": "مكالمة النقيب يحيى",
            "type": "digital",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "الضابط المناوب تلقى مكالمة وقتيبة أبعدته عن الممر.",
            "content_ref": "CASE15_PHONE_LOGS",
            "locked": True,
            "requires_warrant": True,
            "state": "partial",
            "requires_route_collaboration": ["timeline"],
            "depends_on_evidence_ids": ["EVID-15-02"],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid03_spoofed_call",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                            "source_type": "timeline",
                            "source_ref": "TIMELINE-BOARD",
                            "interaction_id": "LINK-15-PHONE",
                            "expected_player_action": "lock_timeline_event",
                            "required_result": "spoofed_caller_id_verified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "المكالمة ظهرت للضابط من 'وزارة الداخلية'، لكن السجل الرقمي يؤكد أن الرقم مخادع (Spoofed). تم تشتيت الضابط عمداً في لحظة إطفاء الكاميرات.",
            "penalty_if_mishandled": [],
            "tags": ["timeline", "cyber", "clockmaker_trace"],
            "route_weight": { "timeline": 1.0, "forensics": 0.0, "behavioral": 0.0 },
            "grand_truth_axis": ["clockmaker"]
        },
        {
            "evidence_id": "EVID-15-04",
            "case_id": "case15",
            "title": "رسالة الحائط",
            "type": "physical",
            "evidence_tier": "critical",
            "evidence_role": "context",
            "summary": "رسالة مكتوبة بالحبر على حائط الزنزانة بجوار جثة المريض المألوف: 'مبروك. إنت اللي حطيته هنا.'",
            "content_ref": "CASE15_WALL_MESSAGE",
            "locked": False,
            "requires_warrant": False,
            "state": "partial",
            "requires_route_collaboration": ["behavioral"],
            "depends_on_evidence_ids": [],
            "completion_triggers": [
                {
                    "trigger_id": "trig_evid04_whisperer_msg",
                    "availability_mode": "immediate",
                    "delay_ticks": 0,
                    "scheduled_on_event": "EVENT_EVIDENCE_VERIFIED",
                    "logic_operator": "all",
                    "conditions": [
                        {
                            "event_name": "EVIDENCE_INSPECTED",
                            "source_type": "physical",
                            "source_ref": "CASE15_WALL_MESSAGE",
                            "interaction_id": "MESSAGE_ANALYSIS",
                            "expected_player_action": "inspect_object",
                            "required_result": "whisperer_taunt_identified"
                        }
                    ],
                    "on_complete": "upgrade_to_verified"
                }
            ],
            "upgraded_summary": "هذه الرسالة ليست للمتوفى، بل للمحقق شخصياً. 'المُلقن' يلعب لعبة نفسية ويستغل ذنب اللاعب في قرارات سابقة.",
            "penalty_if_mishandled": [],
            "tags": ["behavioral", "whisperer_intel", "meta_message"],
            "route_weight": { "timeline": 0.0, "forensics": 0.0, "behavioral": 1.0 },
            "grand_truth_axis": ["whisperer", "trinity"]
        }
    ],
    "suspects": [
        {
            "character_id": "SUSP-15-01",
            "name": "عم سيد",
            "role_in_case": "Distraction",
            "relationship_to_victim": "طباخ قسم الشرطة",
            "occupation": "عامل مقهى ومطبخ (عهدة)",
            "public_profile": "رجل كبير في السن، غافل ومطيع، ليس لديه أي دافع للقتل.",
            "MBTI_Type": "ISFJ",
            "cognitive_profile": {
                "base_collapse_threshold": 3,
                "base_lawyer_up_threshold": 8,
                "aggression_tolerance": 2,
                "rapport_affinity": 7,
                "evidence_rigidity": 3
            },
            "pressure_response": "confess_false",
            "deception_style": "none",
            "speech_register": "informal",
            "favorite_phrases": ["يا بيه أنا حطيت الأكل وروحت نمت", "العفو يا فندم"],
            "verbal_tells": ["ارتجاف اليدين، البكاء"],
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
        "success": ["case15_resolved_true", "case15_cell_resolved", "trinity_coordinated_attack", "trinity_knows_player", "case15_pattern_set"],
        "partial": ["case15_cell_resolved"],
        "failure": ["case15_resolved_false"]
    },
    "solution_paths": {
        "timeline": {
            "description": "إثبات اختراق المنظومة الأمنية والمكالمات في نفس توقيت القتل."
        },
        "forensics": {
            "description": "تحديد طبيعة السم الفائقة التي لا يمكن لطباخ بسيط تحضيرها."
        },
        "behavioral": {
            "description": "إدراك البعد النفسي لرسالة المُلقن وأن الحادث بأكمله استعراض قوة."
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
        "minimum_evidence_count": 4,
        "accepted_true_motive_ids": ["motive_trinity_message"],
        "false_success_motive_ids": ["motive_accidental_poisoning", "motive_cook_negligence"],
        "false_success_flag": "case15_resolved_false",
        "accepted_motive_ids": ["motive_trinity_message", "motive_accidental_poisoning", "motive_cook_negligence"],
        "validate_closure": {
            "minimum_behavioral_chain_verified": 1,
            "minimum_cross_route_verified": 2,
            "no_shared_evidence_between_roles": False,
            "behavioral_chain_evidence_ids": ["EVID-15-04"],
            "cross_route_evidence_ids": ["EVID-15-01", "EVID-15-02"],
            "rejected_submission_reason_codes": ["missing_trinity_link"]
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
                "evidence_id": "EVID-15-01"
            },
            "deterministic_variants": []
        },
        "trinity_awareness": {
            "starting_score": 55,
            "minimum_score": 55,
            "allow_score_decay": False,
            "early_detection_threshold": 60,
            "retaliation_thresholds": [60, 70],
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
            "rule_id": "case15_success",
            "priority": 100,
            "required_flags_all": ["case15_resolved_true"],
            "required_flags_any": [],
            "blocked_flags": [],
            "target_case_id": "case16",
            "target_case_path": "cases/case16/case16.json",
            "clarity_modifier": 0,
            "transition_reason": "تقدم طبيعي."
        }
    ]
}

with open("d:/game/cases/case15/case15.json", "w", encoding="utf-8") as f:
    json.dump(case_data, f, ensure_ascii=False, indent=2)

print("Successfully built case15.json")


