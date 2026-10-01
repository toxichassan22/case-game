# 📊 Case Routing Matrix

> **Purpose:** Documents all branching case paths and flag combinations  
> **Reference:** schema.md - next_case_rules, story.md - case progression

---

## Static Case Progression (Cases 01-09)

| From Case | To Case | Required Flags | Priority | Notes |
|-----------|---------|----------------|----------|-------|
| case01 | case02 | `is_clockmaker_suspicious_1` + success | 100 | Clockmaker path |
| case01 | case02 | `case01_false_confidence_close` | 90 | False confidence path |
| case01 | case02 | success (no special flags) | 50 | Clean resolution |
| case01 | case02 | failure | 10 | Failure pressure path |
| case02 | case03 | default | 10 | Linear progression |
| case03 | case04 | default | 10 | Linear progression |
| case04 | case05 | default | 10 | Linear progression |
| case05 | case06 | default | 10 | Linear progression |
| case06 | case07 | default | 10 | Linear progression |
| case07 | case08 | default | 10 | Linear progression |
| case08 | case09 | default | 10 | Linear progression |
| case09 | case10 | default | 10 | Linear progression |

---

## Dynamic Case Branching (Cases 10+)

### Case 10 → Case 11
- **Trigger:** `arc1_completed` flag
- **Special:** First Shadow message delivered
- **No branching** - linear progression

### Case 15 (Mass Suicide Event)
- **Triggers:**
  - `trinity_pattern_detected`
  - `trinity_awareness_rising` (score → 25)
- **No branching** - mandatory story beat

### Case 20 → Case 21
- **Trigger:** `arc2_completed` flag
- **Special:** Second Shadow message
- **No branching** - linear progression

### Case 30 (Mirror Case)
- **Triggers:**
  - `trinity_mirror_case_executed`
  - `penrose_triangle_first_sighting`
  - Trinity awareness → 50
- **No branching** - mandatory story beat

### Case 40 - First Trinity Member Revealed ⚡
**BRANCHING POINT** - Location depends on player's least-used route

| Player's Least-Used Route | Revealed Member | Location | Flag Set |
|---------------------------|-----------------|----------|----------|
| timeline | Clockmaker | Control room with surveillance screens | `first_trinity_member_identified=clockmaker` |
| forensics | Alchemist | Secret laboratory | `first_trinity_member_identified=alchemist` |
| behavioral | Whisperer (Dr. Yahya) | Psychology clinic | `first_trinity_member_identified=whisperer` |

**Implementation:**
```json
{
  "rule_id": "case40_clockmaker_reveal",
  "priority": 100,
  "required_flags_all": ["route_timeline_favored"],
  "blocked_flags": [],
  "target_case_id": "case40_clockmaker",
  "transition_reason": "Player avoided timeline route - Clockmaker revealed"
},
{
  "rule_id": "case40_alchemist_reveal",
  "priority": 100,
  "required_flags_all": ["route_forensics_favored"],
  "blocked_flags": [],
  "target_case_id": "case40_alchemist",
  "transition_reason": "Player avoided forensics route - Alchemist revealed"
},
{
  "rule_id": "case40_whisperer_reveal",
  "priority": 100,
  "required_flags_all": ["route_behavioral_favored"],
  "blocked_flags": [],
  "target_case_id": "case40_whisperer",
  "transition_reason": "Player avoided behavioral route - Whisperer revealed"
}
```

### Case 41 - Second Trinity Member
- **Depends on:** Which member was revealed in Case 40
- **Branches to:**
  - `case41_second_member_alchemist` (if Clockmaker revealed first)
  - `case41_second_member_clockmaker` (if Alchemist revealed first)
  - `case41_second_member_clockmaker_or_alchemist` (if Whisperer revealed first)

### Case 47 - Third Seat Discovery
- **Mandatory** - reveals the vacant seat
- **Flag:** `empty_third_seat_discovered`
- **No branching**

### Case 49 - Dual Chase ⚡
**BRANCHING POINT** - Player chooses one location

| Player Choice | Captured Member | Escaped Member | Flag Set |
|---------------|-----------------|----------------|----------|
| Port (maritime) | Member A | Member B | `one_member_captured=port`, `one_member_escaped=airport` |
| Airport | Member B | Member A | `one_member_captured=airport`, `one_member_escaped=port` |

**Implementation:**
```json
{
  "rule_id": "case49_chase_port",
  "priority": 100,
  "required_flags_all": ["player_pursuit_choice=port"],
  "target_case_id": "case49_port_capture",
  "transition_reason": "Player chose to chase at port"
},
{
  "rule_id": "case49_chase_airport",
  "priority": 100,
  "required_flags_all": ["player_pursuit_choice=airport"],
  "target_case_id": "case49_airport_capture",
  "transition_reason": "Player chose to chase at airport"
}
```

### Case 53 - Triple Crisis ⚡
**BRANCHING POINT** - Three simultaneous crimes, player chooses one

| Player Choice | Crime Type | Trinity Member | Information Gained |
|---------------|-----------|----------------|-------------------|
| Cairo | Limited bombing | Clockmaker | Digital infrastructure intel |
| Alexandria | Kidnapping | Whisperer | Psychological manipulation files |
| Aswan | Poisoning | Alchemist | Chemical compound source |

**Flag Impact:**
- `player_choice_of_focus=cairo` / `alexandria` / `aswan`
- `partial_evidence_gap` - missing intel from unvisited locations
- Affects Case 58/59 available information

---

## Ending Branching (Cases 58-59)

See **ENDING_CONDITIONS.md** for complete matrix.

---

## Soft-Lock Prevention Rules

1. **Every case MUST have a default path** with lowest priority
2. **No case can be unreachable** from Case 01
3. **All branches must converge** by Case 58 (job interview reveal)
4. **Dynamic cases (40, 41, 47, 49, 53) must always resolve** to a valid next_case_id
5. **Flag validation** must run before case transition to prevent invalid states

---

## Routing Validation Script

Run this to verify no orphaned cases:

```bash
node scripts/validate_case_reachability.mjs
```

This script:
1. Builds a graph of all case transitions
2. Starts from case01 and traverses all paths
3. Reports any unreachable cases
4. Verifies all branches have default paths
5. Checks for circular dependencies

---

## Case Count by Arc

| Arc | Cases | Type | Branching Points |
|-----|-------|------|------------------|
| Arc 1 (Foundation) | 01-10 | Mostly linear | 0 |
| Arc 2 (Doubt) | 11-20 | Linear | 0 |
| Arc 3 (Reflection) | 21-30 | Linear | 0 |
| Arc 4 (Chase) | 31-40 | 1 major branch | Case 40 |
| Arc 5 (Revelation) | 41-50 | 2 branches | Cases 41, 49 |
| Arc 6 (Endgame) | 51-59 | 3 branches + 4 endings | Cases 53, 58, 59 |

**Total Unique Case Variants:** ~75 (including branches)  
**Total Endings:** 4 (A, B, C, D)
