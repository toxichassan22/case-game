import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-17-01"],
    "method_ids": ["method_syndicate_infiltration", "motive_syndicate_infiltration"]
  },
  "openableSources": [
    "CASE17_USB_MALWARE",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [],
    "inspect": [
      {
        "source_ref": "CASE17_USB_MALWARE",
        "source_type": "digital",
        "interaction_id": "CODE_ANALYSIS",
        "required_result": "clockmaker_signature_found",
        "verifies_evidence": True
      }
    ],
    "dialog": [],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-17-TG",
        "required_result": "egyptian_ip_metadata_verified"
      },
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-17-TARGETS",
        "required_result": "player_file_access_identified"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE17_USB", "source_type": "digital" },
    { "prefix": "CYBER-", "source_type": "report" },
    { "prefix": "CASE17_TELEGRAM", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case17/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 17")
