# 🎭 Character Appearance Schedule

> **Purpose:** Tracks when each recurring NPC appears across the 59 cases  
> **Reference:** story.md - character map, schema.md - npc_global_memory

---

## Main Recurring Characters

### Dr. يحيى كريم (Dr. Yahya) - THE WHISPERER ⚠️

| Case | Role | Interaction Type | Notes |
|------|------|------------------|-------|
| **01** | Consultant | Optional consultation | First meeting - seems helpful |
| 05 | Indirect | behavioral evidence | "مكنش قدامي غير كده" phrase echo |
| 06 | Indirect | behavioral evidence | "كان لازم ينكسر التماثل" phrase |
| 08 | Indirect | behavioral evidence | Second phrase detection |
| **15** | Indirect | Prison visit revealed | Visited mass suicide prisoners |
| 20 | Indirect | File reference | Psychological profiles match |
| **33** | Investigation target | Full interrogation | Player suspects him |
| 38 | Indirect | Handwriting match | Archive files in his style |
| **44** | The Shadow revealed | Terminal dialogue | Confirmed as Whisperer |
| **57** | Surrendered member | Final testimony | Tells full Trinity history |
| 58 | Revelation participant | Job interview reveal | Part of the assessment |
| 59 | Ending-dependent | Varies by ending | Different roles per ending |

**Total Appearances:** 13 cases  
**Flag to Track:** `yahya_meets_player_case01`

---

### Chief Desk

| Case | Role | Interaction Type | Notes |
|------|------|------------------|-------|
| **01** | Case dispatcher | Inbox + dialogue | First contact - wants case closed |
| 05 | Institutional pressure | Dialogue hint | Hints at higher-ups |
| 10 | Arc 1 debrief | Post-case dialogue | Questions player's methods |
| 15 | Concerned | Dialogue | Worried about mass suicide PR |
| 20 | Arc 2 debrief | Post-case dialogue | More cautious with player |
| 27 | Obstructionist | Blocks access | Police corruption manifests |
| 35 | Compromised | System failure | Trinity attacks through him |
| 46 | Distrustful | Dialogue | After player doxxing |
| 48 | Tribunal participant | Observer | Watches player present case |
| 51 | Political opponent | Conflict | Uses innocent convictions against player |

**Total Appearances:** 10 cases  
**Flag to Track:** `chief_desk_attitude` (trust_level: -3 to +3)

---

### اللواء مجدي (Major General Magdy)

| Case | Role | Notes |
|------|------|-------|
| **11** | Antagonist | Ordered kidnapping of Dr. Omar |
| 14 | Indirect | Company name appears in documents |
| **27** | Antagonist | Orders cop killer to protect case15 secrets |
| 45 | Indirect | Real estate network connection |

**Total Appearances:** 4 cases

---

### الظل (The Shadow) - Voice of the Whisperer

| Case | Delivery Method | Message | Awareness Delta |
|------|-----------------|---------|-----------------|
| **10** | Terminal message | "10 cases. Still seeing the surface." | +5 |
| **20** | Terminal + glitch | "Starting to see. Will you like it?" | +8 |
| **30** | Terminal + glitch | "Discovered us or yourself?" | +10 |
| **40** | Encrypted terminal | "Know one. Two left... or one?" | +10 |
| **50** | Encrypted + innocent list | "Did you choose or did we choose you?" | +15 |
| **58** | Direct dialogue | "We were investigating you" | +20 |

**Total Appearances:** 6 cases  
**System:** shadowMessageSystem.ts handles delivery

---

## Minor Recurring Characters

### مروان حبيب (Marwan Habib) - Investigative Journalist

| Case | Role | Notes |
|------|------|-------|
| **22** | Victim | Murdered - was investigating Trinity |
| 24 | Carryover | Files referenced by engineer |
| 35 | Carryover | Investigation files help counter cyberattack |

**Total Appearances:** 3 cases (1 alive, 2 posthumous)

---

### Mustafa Radwan (Operations Manager)

| Case | Role | Notes |
|------|------|-------|
| **54** | Captured | Operations manager arrested |
| 55 | Interrogated | Provides Trinity logistics info |
| 57 | Reference | Map he provided used in final confrontation |

**Total Appearances:** 3 cases

---

## Character Memory System Implementation

Each recurring character must have an entry in `npc_global_memory`:

```typescript
interface NPCMemory {
  relationship_score: number; // -5 to +5
  trust_level: number; // 0-100
  resentment_flags: string[];
  wrongly_accused_case_ids: string[];
  helped_by_player_case_ids: string[];
  known_secrets: string[];
  last_seen_case_id: string | null;
  last_outcome_summary: string | null;
}
```

### Example: Dr. Yahya Memory Evolution

**After Case 01:**
```json
{
  "char_dr_yahya": {
    "relationship_score": 1,
    "trust_level": 60,
    "resentment_flags": [],
    "wrongly_accused_case_ids": [],
    "helped_by_player_case_ids": ["case01"],
    "known_secrets": ["player_investigative_style"],
    "last_seen_case_id": "case01",
    "last_outcome_summary": "Provided behavioral consultation"
  }
}
```

**After Case 33 (suspicion):**
```json
{
  "char_dr_yahya": {
    "relationship_score": -2,
    "trust_level": 35,
    "resentment_flags": ["yahya_under_suspicion"],
    "wrongly_accused_case_ids": [],
    "helped_by_player_case_ids": ["case01"],
    "known_secrets": ["player_investigative_style", "player_suspects_whisperer"],
    "last_seen_case_id": "case33",
    "last_outcome_summary": "Player investigated him - no proof found"
  }
}
```

**After Case 57 (revelation):**
```json
{
  "char_dr_yahya": {
    "relationship_score": -5,
    "trust_level": 0,
    "resentment_flags": ["yahya_under_suspicion", "whisperer_identity_clue_1", "whisperer_identity_confirmed"],
    "wrongly_accused_case_ids": [],
    "helped_by_player_case_ids": ["case01"],
    "known_secrets": ["player_investigative_style", "player_suspects_whisperer", "player_knows_trinity_truth"],
    "last_seen_case_id": "case57",
    "last_outcome_summary": "Revealed as Whisperer - surrendered voluntarily"
  }
}
```

---

## Appearance Validation

Run this to verify character appearances match story requirements:

```bash
node scripts/validate_character_appearances.mjs
```

This checks:
1. Dr. Yahya appears in Case 01 ✅
2. Shadow messages at cases 10, 20, 30, 40, 50, 58 ✅
3. Major General Magdy in cases 11 and 27 ✅
4. Marwan Habib killed in case 22 ✅
5. No character appears more than story specifies ✅

---

## Authoring Guidelines

When writing a new case:

1. **Check this document** for which recurring NPCs should appear
2. **Update their memory** based on previous interactions
3. **Add new appearances** to this schedule
4. **Ensure dialogue reflects** their relationship_score and trust_level
5. **Never contradict** established character knowledge
