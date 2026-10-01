import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-04-NONE"],
    "method_ids": ["method_covert_assassination_forgery"]
  },
  "openableSources": [
    "INT-EMAD-01",
    "INT-TAMER-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-TOX-04",
        "source_type": "report",
        "interaction_id": "RESULT-READY",
        "required_result": "synthetic_epinephrine_detected",
        "verifies_evidence": True
      },
      {
        "source_ref": "LAB-DOC-04",
        "source_type": "report",
        "interaction_id": "INK-ANALYSIS",
        "required_result": "thermal_aging_detected",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE04_CCTV_LOG",
        "source_type": "digital",
        "interaction_id": "NETWORK-SCAN",
        "required_result": "six_minute_blindspot_found",
        "verifies_evidence": True
      }
    ],
    "inspect": [
      {
        "source_ref": "CASE04_BODY_NECK",
        "source_type": "physical",
        "interaction_id": "MICROSCOPIC-EXAM",
        "required_result": "puncture_mark_found",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE04_KEYSET",
        "source_type": "object",
        "interaction_id": "DUSTING",
        "required_result": "keys_wiped_clean",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE04_FORGED_DEED",
        "source_type": "document",
        "interaction_id": "INSPECT-DEED",
        "required_result": "anomalous_signature_detected",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-EMAD-01",
        "interaction_id": "Q03",
        "required_result": "exclusive_archive_access_confirmed"
      },
      {
        "source_ref": "INT-TAMER-01",
        "interaction_id": "Q02",
        "required_result": "clockmaker_cyber_signature_confirmed"
      }
    ],
    "timeline": [
      {
        "interaction_id": "LOCK-EVENT-05",
        "required_result": "cctv_blindspot_aligns_with_murder"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE04_BODY", "source_type": "physical" },
    { "prefix": "CASE04_KEYSET", "source_type": "object" },
    { "prefix": "CASE04_FORGED_DEED", "source_type": "document" },
    { "prefix": "CASE04_CCTV", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case04/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 04")
