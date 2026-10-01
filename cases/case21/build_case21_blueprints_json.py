import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-21-01"],
    "method_ids": ["method_syndicate_silencing", "motive_ego"]
  },
  "openableSources": [
    "CASE21_TORN_LIST",
    "LAB-TOX-21",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [],
    "inspect": [
      {
        "source_ref": "CASE21_TORN_LIST",
        "source_type": "document",
        "interaction_id": "PAPER_TEAR_ANALYSIS",
        "required_result": "name_intentionally_removed",
        "verifies_evidence": True
      },
      {
        "source_ref": "LAB-TOX-21",
        "source_type": "report",
        "interaction_id": "TOXICOLOGY_REVIEW",
        "required_result": "signature_poison_used_openly",
        "verifies_evidence": True
      }
    ],
    "dialog": [],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-21-THESIS",
        "required_result": "thesis_matches_poison"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "FIN-", "source_type": "digital" },
    { "prefix": "CASE21_", "source_type": "document" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case21/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 21")
