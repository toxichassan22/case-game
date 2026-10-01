import json
import os

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-03-01"],
    "method_ids": ["method_chemical_poisoning", "method_cyanide_analog"]
  },
  "openableSources": [
    "INT-ADEL-01",
    "INT-SAMAR-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-TOX-03",
        "source_type": "report",
        "interaction_id": "RESULT-READY",
        "required_result": "cyanide_analog_detected",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE03_VICTIM_PHONE",
        "source_type": "digital",
        "interaction_id": "CALL-LOG",
        "required_result": "dummy_call_logged",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE03_ADEL_FINANCE",
        "source_type": "document",
        "interaction_id": "TRANSFER-RECEIPT",
        "required_result": "transfer_to_middleman_confirmed",
        "verifies_evidence": True
      }
    ],
    "inspect": [
      {
        "source_ref": "CASE03_MED_BOX",
        "source_type": "object",
        "interaction_id": "INSPECT",
        "required_result": "packaging_anomaly_detected",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE03_WATER_STAIN",
        "source_type": "object",
        "interaction_id": "INSPECT",
        "required_result": "water_drop_spotted",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-ADEL-01",
        "interaction_id": "Q05",
        "required_result": "confession_of_purchase"
      },
      {
        "source_ref": "INT-SAMAR-01",
        "interaction_id": "Q02",
        "required_result": "victim_health_confirmed"
      }
    ],
    "timeline": [
      {
        "interaction_id": "LOCK-EVENT-04",
        "required_result": "adel_call_after_poisoning"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE03_", "source_type": "object" },
    { "prefix": "DIG-", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case03/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 03")
