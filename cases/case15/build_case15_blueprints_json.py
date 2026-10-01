import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-15-01"],
    "method_ids": ["method_syndicate_message", "motive_trinity_message"]
  },
  "openableSources": [
    "CASE15_WALL_MESSAGE",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-TOX-15",
        "source_type": "report",
        "interaction_id": "FOOD_ANALYSIS",
        "required_result": "tasteless_toxin_identified",
        "verifies_evidence": True
      }
    ],
    "inspect": [
      {
        "source_ref": "CASE15_WALL_MESSAGE",
        "source_type": "physical",
        "interaction_id": "MESSAGE_ANALYSIS",
        "required_result": "whisperer_taunt_identified",
        "verifies_evidence": True
      }
    ],
    "dialog": [],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-15-CCTV",
        "required_result": "six_minute_outage_verified"
      },
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-15-PHONE",
        "required_result": "spoofed_caller_id_verified"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE15_WALL_MESSAGE", "source_type": "physical" },
    { "prefix": "CASE15_PHONE", "source_type": "digital" },
    { "prefix": "CASE15_CCTV", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case15/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 15")
