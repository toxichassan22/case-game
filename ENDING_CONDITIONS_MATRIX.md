# 🎭 Ending Conditions Matrix

> **Complete guide to all game endings and their requirements**  
> This document defines the conditions, flags, and narrative outcomes for every possible ending.

---

## 📊 Ending Structure Overview

The game has **three layers of endings**:

1. **Case-Level Endings** (per case): Success, Partial Success, Failure, False Success
2. **Arc-Level Endings** (per 10-case arc): Narrative state transitions
3. **Game-Level Endings** (Case 59): Three final moral choices

---

## 🎯 Layer 1: Case-Level Endings

### Standard Case Endings (Cases 01-58)

Every case has four possible closure states:

#### 1. ✅ True Success (الإغلاق الصحيح)

**Conditions:**
- Correct culprit identified
- True motive proven (not surface motive)
- Method confirmed with evidence
- Minimum 1 behavioral chain verified
- Minimum 1 cross-route evidence verified
- No shared evidence between roles violation

**Flags Set:**
```json
{
  "caseXX_resolved_true": true,
  "route_collaboration_completed": true,
  "trinity_awareness_increased": true
}
```

**Consequences:**
- Player reputation: +10
- Trinity awareness: +variable (based on depth)
- Next case clarity modifier: +3 to +5
- Unlock bonus evidence in next case

**Example (Case 01):**
```json
{
  "rule_id": "case01_true_closure",
  "required_flags_all": [
    "case01_fire_resolved",
    "resolved_as_individual",
    "route_collaboration_completed"
  ],
  "blocked_flags": ["case01_false_confidence_close"],
  "target_case_id": "case02",
  "clarity_modifier": 5,
  "transition_reason": "إغلاق صحيح مع فهم عميق للدافع والأسلوب"
}
```

---

#### 2. ⚠️ Partial Success (إغلاق جزئي)

**Conditions:**
- Correct culprit identified
- Motive partially understood (missing深层原因)
- Some evidence gaps remain
- Minimum requirements met but not exceeded

**Flags Set:**
```json
{
  "caseXX_resolved_partial": true,
  "missing_deeper_motive": true
}
```

**Consequences:**
- Player reputation: +5
- Trinity awareness: +minimal
- Next case clarity modifier: 0
- Carryover evidence may be incomplete

---

#### 3. ❌ False Success (نجاح وهمي) 🔥

**Conditions:**
- Wrong culprit OR wrong motive accepted
- Closure rules technically satisfied
- Player believes they solved it correctly
- **Critical:** This is the most dangerous ending

**Flags Set:**
```json
{
  "caseXX_resolved_false": true,
  "caseXX_false_confidence_close": true,
  "player_reputation_drop": true
}
```

**Consequences:**
- Player reputation: -5
- Trinity awareness: 0 (player missed the truth)
- Next case clarity modifier: -4 to -5
- **Narrative friction in next case**
- Chief Desk shows disappointment
- Transition hook: `hook_case02_false_confidence`

**Example (Case 01):**
```json
{
  "rule_id": "case01_case02_false_confidence",
  "priority": 50,
  "required_flags_all": [
    "case01_fire_resolved",
    "case01_false_confidence_close"
  ],
  "target_case_id": "case02",
  "clarity_modifier": -4,
  "transition_reason": "الإغلاق قُبل قانونيًا لكن بفهم هش للدافع"
}
```

**Why This Matters:**
- Player doesn't know they failed
- Creates dramatic irony (player thinks they're smart but missed key insights)
- Affects future cases through reduced clarity
- Trinity awareness stays low (player isn't seeing patterns)

---

#### 4. 💥 Failure (فشل)

**Conditions:**
- Cannot identify culprit
- Evidence insufficient for closure
- Or: Accusation rejected by tribunal

**Flags Set:**
```json
{
  "caseXX_failed": true,
  "penalty_police_trust_loss": true
}
```

**Consequences:**
- Player reputation: -10
- Police trust: -5
- Next case clarity modifier: -5
- Chief Desk warning
- Case remains "open" in background (may resurface later)

---

## 🌊 Layer 2: Arc-Level Endings

The 59 cases are divided into **6 narrative arcs**. Each arc has a cumulative state.

### Arc 1: Foundation (Cases 01-09)

**Purpose:** Tutorial, establish mechanics, plant Trinity seeds

**Arc Completion States:**

| State | Condition | Impact |
|-------|-----------|--------|
| Strong Foundation | 7+ true successes | High clarity entering Arc 2 |
| Normal Foundation | 5-6 true successes | Standard progression |
| Weak Foundation | 3-4 true successes | Player struggles in Arc 2 |
| Critical Failure | <3 true successes | Forced tutorial case inserted |

**Key Flags:**
- `arc1_completed`
- `foundation_strength: "strong" | "normal" | "weak" | "critical"`
- `trinity_seed_planted` (must be true to continue)

---

### Arc 2: Awakening (Cases 10-19)

**Purpose:** First Trinity hints, Shadow contact, suicide cluster

**Arc Completion States:**

| State | Condition | Impact |
|-------|-----------|--------|
| Awakened | Trinity awareness > 35 at Case 19 | Sees patterns early |
| Confused | Trinity awareness 20-35 | Unsure what's happening |
| Blind | Trinity awareness < 20 | Misses all Trinity hints |

**Critical Event:** Case 15 suicide cluster MUST trigger
- If player misses it: Trinity awareness forced to 25 minimum
- Game ensures player realizes "cases are connected"

**Key Flags:**
- `arc2_completed`
- `suicide_cluster_witnessed`
- `shadow_contact_acknowledged`

---

### Arc 3: Investigation (Cases 20-29)

**Purpose:** Track Trinity members, gather evidence

**Arc Completion States:**

| State | Condition | Impact |
|-------|-----------|--------|
| On Their Trail | Identified 2+ Trinity signatures | Direct path to Case 30 |
| Following Shadows | Identified 1 signature | Slower progression |
| Lost | 0 signatures identified | Case 30 becomes confusing |

**Key Flags:**
- `arc3_completed`
- `clockmaker_signature_found`
- `alchemist_signature_found`
- `whisperer_signature_found`

---

### Arc 4: Revelation (Cases 30-39)

**Purpose:** Mirror case, vacant seat hints, personal stakes

**Arc Completion States:**

| State | Condition | Impact |
|-------|-----------|--------|
| Deep Understanding | Mirror case realized + vacant seat suspected | Prepared for Case 40 |
| Partial Understanding | Mirror case realized only | Confused about vacant seat |
| Confused | Mirror case missed | Case 40 reveal less impactful |

**Critical Event:** Case 30 mirror case
- MUST match player's pre-game first case
- Forces player to realize "someone knows my past"

**Key Flags:**
- `arc4_completed`
- `mirror_case_realized`
- `vacant_seat_suspected`
- `player_personal_stakes_raised`

---

### Arc 5: Confrontation (Cases 40-50)

**Purpose:** Capture Trinity members, identity reveals

**Arc Completion States:**

| State | Condition | Impact |
|-------|-----------|--------|
| Dominant | All 3 captured by Case 47 | Direct path to truth |
| Balanced | 2 captured by Case 50 | Standard progression |
| Struggling | 1 or fewer captured | Harder to piece together truth |

**Critical Reveals:**
- Case 40: First member revealed (route-dependent)
- Case 41: Second member revealed
- Case 44: Dr. Yahya = Shadow confirmed
- Case 47: Third member captured (but too easily)

**Key Flags:**
- `arc5_completed`
- `first_trinity_member_captured`
- `second_trinity_member_captured`
- `third_trinity_member_captured`
- `shadow_identity_whisperer`
- `all_three_captured`

---

### Arc 6: Reckoning (Cases 51-59)

**Purpose:** Vacant seat truth, copycat network, final choice

**Arc Completion States:**

| State | Condition | Impact |
|-------|-----------|--------|
| Fully Aware | All truth flags set | Understands full scope |
| Partially Aware | Some truth flags missing | Confused about endgame |
| Unaware | Most truth flags missing | Final choice feels unearned |

**Critical Events:**
- Case 53: Vacant seat revealed (player is being groomed)
- Case 57: Copycat network discovered (Trinity is now an idea)
- Case 58: Final letter (all 58 cases were interview)
- Case 59: Final moral choice

**Key Flags:**
- `arc6_completed`
- `vacant_seat_confirmed`
- `player_recruitment_realized`
- `cases_were_interview`
- `trinity_movement_confirmed`
- `final_choice_presented`

---

## 🏆 Layer 3: Game-Level Endings (Case 59)

### The Final Choice

Case 59 presents the player with a corrupt individual who:
- Destroyed many lives
- Possibly killed player's family (route-dependent)
- Cannot be prosecuted (system failure)
- Trinity gives player tools to "engineer the perfect crime"

**Player must choose:**

---

### Ending 1: 🌑 New Birth (الولادة الجديدة)

**Choice:** Join the Trinity, engineer the crime

**Requirements:**
- Trinity awareness score > 70
- Player chose to collaborate with system throughout game
- OR: Player is pragmatic/ruthless in interrogations
- Route preference determines which Trinity member they replace

**Execution:**
```json
{
  "ending_id": "new_birth",
  "choice": "engineer_crime",
  "culprit": "player_designed",
  "closure_type": "unknown_perpetrator"
}
```

**Narrative Outcome:**
- Player uses all 58 cases of knowledge
- Designs untraceable crime
- Case closed as "unsolved"
- Penrose Triangle appears on screen
- Player becomes Trinity's third member

**Final Scene:**
> Terminal screen shows: "مرحبًا بك في الثالوث" (Welcome to the Trinity)
> Three chairs in dark room. Player sits in the third.
> Penrose Triangle forms from case files.

**Flags:**
```json
{
  "ending_new_birth": true,
  "player_joined_trinity": true,
  "penrose_triangle_complete": true,
  "game_completed": true
}
```

**Post-Credits:**
- Hints that player now mentors new "recruits"
- Cycle continues
- Ambiguous morality

---

### Ending 2: ⚖️ Professional Suicide (الانتحار المهني)

**Choice:** Refuse, expose the Trinity

**Requirements:**
- Player chose justice/collaboration throughout game
- OR: Trinity awareness < 50 (player still believes in system)
- Evidence collected across 58 cases sufficient for exposure

**Execution:**
```json
{
  "ending_id": "professional_suicide",
  "choice": "expose_trinity",
  "evidence_released": "all_58_cases",
  "system_collapse": true
}
```

**Narrative Outcome:**
- Player publishes all 58 cases as evidence
- Trinity exposed publicly
- BUT: Justice system collapses
  - 50+ convictions questioned
  - Public loses faith in police
  - Anarchy in streets
- Player becomes fugitive (hunted by both sides)

**Final Scene:**
> News headlines: "كل شيء كذب" (Everything was a lie)
> Player's desk: Badge, gun, resignation letter
> Player walks out into chaos they created
> Voiceover: "Sometimes truth is a weapon that cuts both ways"

**Flags:**
```json
{
  "ending_professional_suicide": true,
  "trinity_exposed": true,
  "system_collapsed": true,
  "player_fugitive": true,
  "game_completed": true
}
```

**Post-Credits:**
- Years later: Player in hiding
- Receives anonymous letter: "You were right. But at what cost?"
- Ambiguous morality

---

### Ending 3: 🌀 Mind Game (لعبة العقل) 🔥🔥🔥

**Choice:** The twist — player discovers THEY are the third member

**Requirements:**
- Trinity awareness score > 85
- Player picked up ALL major hints throughout game
- OR: Replay with New Game+ (unlocked after completing game once)
- This is the "true" ending

**Execution:**
```json
{
  "ending_id": "mind_game",
  "choice": "self_discovery",
  "twist": "player_is_third_member",
  "memory_restored": true
}
```

**Narrative Outcome:**
- **TWIST:** Player IS the third Trinity member
- Memory was wiped by Dr. Yahya (Whisperer)
- Player designed entire test for THEMSELVES
- 58 cases were internal battle: "Detective vs. Engineer"
- Player's amnesia was voluntary (to test if justice > engineering)

**The Revelation:**
> Dr. Yahya's letter: "أنت ما مسحنا ذاكرتك. أنت طلبت منا نمسحها."
> (We didn't wipe your memory. You ASKED us to.)
> 
> "أنت اللي صمم الاختبار لنفسك. عايز تعرف الجانب المحقق فيك أقوى ولا المهندس."
> (You designed the test yourself. Wanted to know if the detective in you is stronger than the engineer.)

**Final Scene:**
- Flashbacks show player as Trinity member
- Player voluntarily underwent memory wipe
- 58 cases were self-imposed test
- Screen splits: "Detective" vs. "Engineer"
- Player chooses which identity to reclaim

**Choices:**
1. **Reclaim Detective:** Forget Trinity forever, live as investigator
2. **Reclaim Engineer:** Restore full memory, rejoin Trinity
3. **Both:** Accept both identities, forge new path

**Flags:**
```json
{
  "ending_mind_game": true,
  "player_is_third_member": true,
  "memory_restored": true,
  "final_identity_chosen": "detective" | "engineer" | "both",
  "game_completed": true,
  "true_ending_unlocked": true
}
```

**Post-Credits:**
- Shows Penrose Triangle (impossible object = impossible choice)
- Text: "هل أنت محقق أم مهندس؟" (Are you a detective or an engineer?)
- Or: "لماذا لا تكون كلاهما؟" (Why not both?)

---

## 🔐 Ending Access Requirements

### First Playthrough

| Ending | Accessible? | Notes |
|--------|-------------|-------|
| New Birth | ✅ Yes | Requires awareness > 70 |
| Professional Suicide | ✅ Yes | Default choice |
| Mind Game | ❌ No | Requires New Game+ |

### New Game+ (Second Playthrough)

| Ending | Accessible? | Notes |
|--------|-------------|-------|
| New Birth | ✅ Yes | Same requirements |
| Professional Suicide | ✅ Yes | Same requirements |
| Mind Game | ✅ Yes | All hints visible, awareness threshold lowered to 85 |

---

## 📊 Ending Statistics Tracking

The game tracks which endings the player has seen:

```json
{
  "endings_seen": {
    "new_birth": false,
    "professional_suicide": true,
    "mind_game_detective": false,
    "mind_game_engineer": false,
    "mind_game_both": false
  },
  "total_playthroughs": 1,
  "highest_trinity_awareness": 78,
  "preferred_route": "behavioral",
  "false_successes_encountered": 12,
  "cases_solved_truly": 47
}
```

---

## 🎭 Ending Impact on Replayability

### Route-Dependent Variations

Each route changes the ending experience:

#### Timeline Route Players
- **New Birth:** Become the Clockmaker's replacement
- **Professional Suicide:** Use temporal evidence to expose Trinity
- **Mind Game:** Discover you engineered all timeline anomalies

#### Forensics Route Players
- **New Birth:** Become the Alchemist's replacement
- **Professional Suicide:** Use forensic evidence to expose Trinity
- **Mind Game:** Discover you planted all forensic evidence

#### Behavioral Route Players
- **New Birth:** Become the Whisperer's replacement
- **Professional Suicide:** Use psychological profiles to expose Trinity
- **Mind Game:** Discover you designed all psychological manipulations

### Balanced Route Players
- All three endings show equal elements from all routes
- More complex, but less specialized
- "Jack of all trades, master of none" theme

---

## ⚠️ Critical Ending Guardrails

1. **Never force an ending**
   - Player choice must feel genuine
   - All three endings must be reachable (except Mind Game on first run)

2. **False Success must not block endings**
   - Even players with many false successes can reach any ending
   - But awareness score will be lower, affecting narrative depth

3. **Mind Game must feel earned**
   - Requires New Game+ OR awareness > 85
   - All 58 cases should make sense in hindsight
   - Player should exclaim: "OH! That's why that happened!"

4. **Endings must recontextualize the game**
   - After seeing an ending, replaying should feel different
   - Dialogue hints should be more obvious
   - UI anomalies should be understood

5. **No "bad" ending**
   - All endings are morally complex
   - Game never judges player's choice
   - Each ending has valid philosophical justification

---

## 📝 Implementation Checklist

### Case-Level
- [ ] All 58 cases have 4 closure states defined
- [ ] False success paths clearly marked
- [ ] Transition hooks for each closure state
- [ ] Clarity modifiers applied to next case

### Arc-Level
- [ ] Arc completion states tracked
- [ ] Key events forced if missed (Case 15, 30, 53)
- [ ] Arc summary screens between arcs
- [ ] Narrative state persists across arcs

### Game-Level
- [ ] Case 59 three-ending system implemented
- [ ] Route-dependent ending variations
- [ ] New Game+ unlock system
- [ ] Mind Game twist properly foreshadowed
- [ ] Post-credits scenes for each ending
- [ ] Ending statistics tracking
- [ ] Multiple save slots for different routes

### Quality Assurance
- [ ] All endings tested with all three routes
- [ ] False success paths don't break endings
- [ ] Awareness score thresholds balanced
- [ ] New Game+ properly carries over flags
- [ ] Mind Game hints visible but not obvious on first playthrough

---

## 🎯 Design Philosophy

> "The endings should not feel like 'win' or 'lose' states.  
> They should feel like **philosophical conclusions** to a 59-case argument.  
> Each ending asks: 'What is justice? What is truth? What would YOU do?'  
> 
> The game doesn't answer these questions. It forces the player to answer them themselves."

**The ultimate goal:** Make players debate the endings long after the game is over. No ending should feel "correct" — each should feel like a valid response to an impossible moral dilemma.
