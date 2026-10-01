import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-19-01"],
    "method_ids": ["method_syndicate_artifacts_smuggling", "motive_syndicate_funding"]
  },
  "openableSources": [
    "CASE19_LAND_DEED",
    "INT-SAFWAT-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [],
    "inspect": [
      {
        "source_ref": "CASE19_LAND_DEED",
        "source_type": "document",
        "interaction_id": "INK_ANALYSIS",
        "required_result": "forgery_ink_matches_case05",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-SAFWAT-01",
        "interaction_id": "Q_PROTECTION",
        "required_result": "protection_fear_revealed"
      }
    ],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-19-MAGHRABY",
        "required_result": "maghraby_funding_confirmed"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "FIN-", "source_type": "digital" },
    { "prefix": "CASE19_LAND", "source_type": "document" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case19/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 19")
