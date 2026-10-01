import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-12-01"],
    "method_ids": ["method_proxy_family_murder", "motive_whisperer_manipulation"]
  },
  "openableSources": [
    "INT-MOHAMED-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-CYBER-12",
        "source_type": "report",
        "interaction_id": "FINANCIAL_TRACE",
        "required_result": "transfers_to_deceased",
        "verifies_evidence": True
      }
    ],
    "inspect": [],
    "dialog": [
      {
        "source_ref": "INT-MOHAMED-01",
        "interaction_id": "Q02",
        "required_result": "phrase_symmetry_breaking_repeated"
      },
      {
        "source_ref": "INT-MOHAMED-01",
        "interaction_id": "Q04",
        "required_result": "shadow_voice_therapy"
      }
    ],
    "timeline": []
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE12_", "source_type": "document" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case12/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 12")
