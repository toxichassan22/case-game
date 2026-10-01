# 🎮 Case 01 Playability Guide

> **Complete guide to making Case 01 fully playable for first-time players**  
> This document covers tutorial flow, beginner scenarios, and completion checklist.

---

## 📋 What Was Fixed for Playability

### ✅ Completed Fixes

1. **Dr. Yahya Integration**
   - Added to `blueprints.json` openable sources
   - Added 3 dialogue responses (Q01, Q02, Q03)
   - Players can now consult him for behavioral analysis

2. **Chief Desk Enhanced**
   - Added 2 extra dialogue options (Q-CHIEF-02, Q-CHIEF-03)
   - Hints about institutional pressure
   - Mentions previous fires (Trinity seed)

3. **Burned CCTV Video**
   - Added blueprint for `EVID-CARRYOVER-CCTV-BURNED-VIDEO`
   - Players can review this carryover evidence

4. **Tutorial Hints**
   - Added L0 hint welcoming first-time players
   - Explains 3 investigation routes
   - Suggests starting point (SCN-03)

---

## 🎯 Tutorial Flow for First-Time Players

### Step 1: Case Introduction (Auto)
```
📧 Inbox Brief appears:
From: Chief Desk
Subject: حريق داخل صيدلية - وفاة مالك
Message: الدفاع المدني يرجح ماسًا كهربائيًا مبدئيًا. راجع الملف قبل إغلاقه كحادث.
```

### Step 2: First Hint (L0 - Tutorial Message)
```
💬 Welcome Message:
"مرحبًا بك في قضيتك الأولى. لديك 3 مسارات:
- الزمني (Timeline): تتبع الأحداث والتوقيتات
- الجنائي (Forensics): فحص الأدلة المادية
- والسلوكي (Behavioral): تحليل أقوال المشتبهين

ابدأ بمراجعة تقرير مسرح الجريمة SCN-03."
```

### Step 3: Suggested Investigation Path

#### **Path A: Forensics Route (Recommended for beginners)**
1. Review `SCN-03` (Fire origin report) → Reveals fire started in office, not storage
2. Review `SCN-04` (Soot analysis) → Shows door was locked from outside
3. Inspect `OBJ-01` (Torn black ledger) → Discover financial records
4. Review `SCN-05` (Chemical analysis) → Confirms accelerant used

#### **Path B: Behavioral Route**
1. Talk to Chief Desk → Request additional files (`REQ-EVIDENCE-01`)
2. Interrogate Sharif → Ask Q03 (Why mention storage before report?)
3. Get behavioral slip → `preemptive_origin_claim_logged`
4. Consult Dr. Yahya → Get psychological analysis

#### **Path C: Timeline Route**
1. Review `DB-01` (Key access log) → See who had keys
2. Review `DB-06` (Trip trace) → Break Layla's alibi
3. Lock timeline event `LOCK-EVENT-03` → Confirm Sharif at scene
4. Review `DB-07` (GPS records) → Contradict Sharif's alibi

### Step 4: Evidence Chain Building

#### **Required for True Closure:**
- ✅ At least 1 behavioral chain:
  - `EVID-PARTIAL-FALSE-ORIGIN-STORY` (Sharif's lie about fire origin)
  - OR `EVID-PARTIAL-BLACK-LEDGER` (Ledger slip)
  
- ✅ At least 1 cross-route evidence:
  - `EVID-PARTIAL-LOCK` (Door locked from outside)
  - OR `SCN-05` (Chemical analysis)

### Step 5: Case Closure
```
🔒 Attempt Case Closure:
- Suspect: شريف نبيل السيوفي (char_sharif)
- Motive: motive_embezzlement_black_ledger
- Method: method_arson_front_door
- Evidence: [SCN-03, EVID-PARTIAL-FALSE-ORIGIN-STORY, EVID-PARTIAL-LOCK]
```

---

## 🎮 Beginner Scenarios

### Scenario 1: Full Success (True Closure)
**Difficulty:** ⭐⭐⭐  
**Time:** ~30 minutes  
**Route:** Balanced (all 3 routes)

**Steps:**
```
1. Talk to Chief Desk → REQ-EVIDENCE-01 (Unlock OBJ-01, OBJ-02, CCTV evidence)
2. Review SCN-03 (Fire origin: office, not storage)
3. Interrogate Sharif → Q03 (Why mention storage?)
   → Result: preemptive_origin_claim_logged ✅
4. Review SCN-03 again (Verify evidence)
5. Inspect OBJ-02 (Spare key found)
6. Review DB-06 (Trip trace: breaks Layla's alibi)
7. Interrogate Sharif → Q06 (Who had side door key?)
   → Result: key_access_statement_recorded ✅
8. Review SCN-04 (Soot: door locked from outside)
9. Lock Timeline Event → LOCK-EVENT-03 (Sharif at 20:41)
10. Attempt Case Closure with:
    - Suspect: char_sharif
    - Motive: motive_embezzlement_black_ledger
    - Method: method_arson_front_door
    - Evidence: [SCN-03, EVID-PARTIAL-FALSE-ORIGIN-STORY, EVID-PARTIAL-LOCK]

✅ Result: TRUE CLOSURE
Flags: case01_fire_resolved, route_collaboration_completed, is_clockmaker_suspicious_1
```

### Scenario 2: False Success (Wrong Motive)
**Difficulty:** ⭐⭐  
**Time:** ~20 minutes  
**Route:** Forensics + Behavioral (missing depth)

**Steps:**
```
1. Talk to Chief Desk → REQ-EVIDENCE-01
2. Request deep metadata recovery → EVID-SUP-CCTV-CORRUPTION
3. Review SCN-03
4. Interrogate Sharif → Q03
5. Review SCN-03 (Verify)
6. Inspect OBJ-02
7. Review DB-06
8. Interrogate Sharif → Q06
9. Review SCN-04
10. Lock LOCK-EVENT-03
11. Attempt Case Closure with:
    - Suspect: char_sharif
    - Motive: motive_insurance ❌ (WRONG!)
    - Method: method_arson_front_door
    - Evidence: [SCN-03, EVID-PARTIAL-FALSE-ORIGIN-STORY, EVID-PARTIAL-LOCK]

⚠️ Result: FALSE SUCCESS
Flags: case01_false_confidence_close
Consequence: Case 02 starts with clarity debuff (-4)
```

### Scenario 3: Missing Behavioral Chain
**Difficulty:** ⭐  
**Time:** ~15 minutes  
**Route:** Forensics only

**Steps:**
```
1. Talk to Chief Desk → REQ-EVIDENCE-01
2. Review SCN-03
3. Review SCN-03 (Verify)
4. Inspect OBJ-02
5. Review DB-06
6. Interrogate Sharif → Q06
7. Review SCN-04
8. Lock LOCK-EVENT-03
9. Attempt Case Closure with:
    - Suspect: char_sharif
    - Motive: motive_insurance ❌
    - Method: method_arson_front_door
    - Evidence: [SCN-03, SCN-04, EVID-PARTIAL-LOCK]
    - Missing: Behavioral chain! ❌

❌ Result: CLOSURE REJECTED
Reason: "You need at least 1 behavioral chain to close this case."
Hint: Review Sharif's statements for contradictions.
```

---

## ✅ Case Completion Checklist

### **Evidence to Review** (Minimum 5)
- [ ] `SCN-03` - Fire origin report (office, not storage)
- [ ] `SCN-04` - Soot analysis (door locked from outside)
- [ ] `SCN-05` - Chemical analysis (accelerant found)
- [ ] `OBJ-01` - Torn black ledger fragments
- [ ] `OBJ-02` - Spare key in Layla's bag
- [ ] `DB-01` - Key access log
- [ ] `DB-06` - Trip trace (breaks Layla's alibi)
- [ ] `EVID-PARTIAL-LOCK` - Partial lock evidence
- [ ] `EVID-PARTIAL-FALSE-ORIGIN-STORY` - Sharif's lie
- [ ] `EVID-SUP-CCTV-CORRUPTION` - CCTV corruption (Trinity seed)

### **Interrogations to Conduct** (Minimum 2)
- [ ] `INT-SHARIF-01 / Q03` - Why mention storage before report?
  - Result: `preemptive_origin_claim_logged`
- [ ] `INT-SHARIF-01 / Q06` - Who had side door key?
  - Result: `key_access_statement_recorded`
- [ ] `INT-SHARIF-01 / Q09` - Why mention ledger?
  - Result: `ledger_slip_logged`
- [ ] `INT-LAYLA-01 / Q02` - Did you enter father's office?
  - Result: `layla_office_entry_logged`
- [ ] `INT-DR-YAHYA-01 / Q01` - What about Sharif's behavior?
  - Result: `yahya_behavioral_analysis_shared`

### **Timeline Events to Lock** (Minimum 1)
- [ ] `LOCK-EVENT-03` - Confirm Sharif at side door (20:41)
- [ ] `LOCK-EVENT-05` - Sharif's alleged sighting (21:05)
- [ ] `LOCK-EVENT-06` - CCTV corruption (21:01)

### **Behavioral Chains to Build** (Minimum 1)
- [ ] **Chain 1:** SCN-03 + INT-SHARIF-01/Q03 → `EVID-PARTIAL-FALSE-ORIGIN-STORY`
- [ ] **Chain 2:** OBJ-01 + INT-SHARIF-01/Q09 → `EVID-PARTIAL-BLACK-LEDGER`

### **Cross-Route Evidence** (Minimum 1)
- [ ] `EVID-PARTIAL-LOCK` (Requires: SCN-04 + INT-SHARIF-01/Q06 + LOCK-EVENT-03)
- [ ] `SCN-05` (Requires: SCN-03 + DB-01)

### **Optional: Trinity Awareness**
- [ ] Review `EVID-SUP-CCTV-CORRUPTION` → +4 awareness
- [ ] Request deep metadata recovery → +3 awareness
- [ ] Notice corruption predates fire → `is_clockmaker_suspicious_1` flag
- [ ] Keep burned CCTV video → `kept_case01_cctv_burned_video` flag

### **Closure Requirements**
- [ ] Correct suspect: `char_sharif`
- [ ] True motive: `motive_embezzlement_black_ledger` (NOT `motive_insurance`)
- [ ] Correct method: `method_arson_front_door`
- [ ] Minimum 1 behavioral chain verified
- [ ] Minimum 1 cross-route evidence verified

---

## 🎓 Tutorial Tips for New Players

### **Understanding the 3 Routes**

#### 🕐 Timeline Route
- **Goal:** Build chronological sequence of events
- **Tools:** Timeline board, GPS records, key logs
- **Key Evidence:** DB-01, DB-06, DB-07, LOCK-EVENTs
- **Playstyle:** Like solving a puzzle - fit pieces together

#### 🔬 Forensics Route  
- **Goal:** Prove physical facts about the crime
- **Tools:** Lab reports, object inspection, chemical analysis
- **Key Evidence:** SCN-03, SCN-04, SCN-05, OBJ-01, OBJ-02
- **Playstyle:** Like CSI - let the evidence speak

#### 🧠 Behavioral Route
- **Goal:** Catch suspects in lies and contradictions
- **Tools:** Interrogation, psychological analysis
- **Key Evidence:** INT-SHARIF dialogues, EVID-PARTIAL chains
- **Playstyle:** Like detective work - read people

### **Common Mistakes to Avoid**

1. ❌ **Closing case with wrong motive**
   - Insurance fraud is a RED HERRING
   - Real motive: Embezzlement (black ledger)
   
2. ❌ **Skipping behavioral chain**
   - You MUST interrogate suspects
   - Physical evidence alone is NOT enough
   
3. ❌ **Ignoring Dr. Yahya**
   - He provides crucial behavioral insights
   - Hints at Trinity patterns (Q02)
   
4. ❌ **Missing CCTV corruption**
   - This is a Trinity seed
   - Affects future cases if ignored

5. ❌ **Not requesting additional files**
   - Talk to Chief Desk first (REQ-EVIDENCE-01)
   - Unlocks OBJ-01, OBJ-02, CCTV evidence

### **Pro Tips**

1. ✅ **Always talk to Chief Desk first**
   - Unlocks critical evidence
   - Sets up investigation properly

2. ✅ **Consult Dr. Yahya after interrogating Sharif**
   - Get psychological perspective
   - Catch behavioral tells you missed

3. ✅ **Build evidence chains, don't just collect**
   - Evidence must connect logically
   - Use partial evidence system

4. ✅ **Watch for Trinity hints**
   - CCTV corruption predates fire
   - Crime is "too organized"
   - Dr. Yahya mentions patterns

5. ✅ **Save before attempting closure**
   - False success has consequences
   - You can retry with different evidence

---

## 🎬 First Playthrough Walkthrough

### **Recommended Path (Balanced Approach)**

```
📍 START: Inbox Brief from Chief Desk

💡 L0 Hint: "Welcome! 3 routes available. Start with SCN-03."

1️⃣ TALK TO CHIEF DESK
   → Select: REQ-EVIDENCE-01
   → Result: Additional files unlocked (OBJ-01, OBJ-02, CCTV)

2️⃣ REVIEW SCN-03 (Fire Origin Report)
   → Discovery: Fire started in OFFICE, not storage
   → Question: Why did Sharif say storage?

3️⃣ INTERROGATE SHARIF - Q03
   → Ask: "Why mention storage before report?"
   → Result: Preemptive denial logged ✅
   → Red flag: He's controlling the narrative

4️⃣ CONSULT DR. YAHYA - Q01
   → Ask: "What about Sharif's behavior?"
   → Result: "Proactive denial... interesting pattern"
   → Hint: He's trying to control the story

5️⃣ INSPECT OBJ-02 (Spare Key)
   → Discovery: Layla had spare key
   → Red herring: Looks suspicious but has alibi

6️⃣ REVIEW DB-06 (Trip Trace)
   → Discovery: Layla's timeline broken
   → Result: Layla cleared as suspect

7️⃣ INTERROGATE SHARIF - Q06
   → Ask: "Who had side door key?"
   → Result: Key access statement recorded ✅
   → Building case against Sharif

8️⃣ REVIEW SCN-04 (Soot Analysis)
   → Discovery: Door locked from OUTSIDE
   → Conclusion: Victim didn't lock it himself

9️⃣ LOCK TIMELINE EVENT - LOCK-EVENT-03
   → Action: Confirm Sharif at side door (20:41)
   → Result: Timeline places him at scene

🔟 ATTEMPT CASE CLOSURE
    → Suspect: شريف نبيل السيوفي
    → Motive: motive_embezzlement_black_ledger ✅
    → Method: method_arson_front_door
    → Evidence: [SCN-03, EVID-PARTIAL-FALSE-ORIGIN-STORY, EVID-PARTIAL-LOCK]

✅ TRUE CLOSURE ACHIEVED!

🎉 Flags Set:
   - case01_fire_resolved
   - route_collaboration_completed
   - is_clockmaker_suspicious_1
   - kept_case01_cctv_burned_video

📧 Transition to Case 02:
   - Clarity modifier: +5
   - You caught the Trinity seed!
   - Case 02 will acknowledge your awareness
```

---

## 📊 Difficulty Scaling

### **For Casual Players**
- Use L0-L3 hints extensively
- Focus on forensics route (most straightforward)
- Consult Dr. Yahya for guidance
- Expected time: 45-60 minutes

### **For Experienced Players**
- Skip L0-L2 hints
- Try behavioral route (more complex)
- Catch all Trinity hints
- Expected time: 25-35 minutes

### **For Speedrunners**
- Know exact evidence chain
- Skip all hints
- Direct path to closure
- Expected time: 10-15 minutes

---

## 🐛 Troubleshooting

### **Problem: Can't close the case**
**Solution:** 
- Check if you have 1 behavioral chain
- Check if you have 1 cross-route evidence
- Review hints L5-L7 for guidance

### **Problem: Don't know what to do next**
**Solution:**
- Open hints panel (press H)
- Review L0 hint for starting point
- Follow suggested investigation path

### **Problem: Interrogation not working**
**Solution:**
- Make sure you reviewed related evidence first
- Try different dialogue options
- Consult Dr. Yahya for behavioral tips

### **Problem: Missing evidence**
**Solution:**
- Talk to Chief Desk (REQ-EVIDENCE-01)
- Check if evidence has prerequisites
- Review evidence dependencies in UI

---

## 📝 Files Modified for Playability

### **Updated Files:**
1. `cases/case01/case01.json`
   - Added L0 tutorial hint
   - Added Dr. Yahya character
   - Added Chief Desk dialogues
   - Added burned CCTV video

2. `cases/case01/blueprints.json`
   - Added INT-DR-YAHYA-01 to openable sources
   - Added 3 Dr. Yahya dialogue responses
   - Added 2 Chief Desk dialogue responses
   - Added EVID-CARRYOVER-CCTV-BURNED-VIDEO blueprint

### **New Files:**
3. `CASE_01_PLAYABILITY_GUIDE.md` (this file)
   - Tutorial flow documentation
   - Beginner scenarios
   - Completion checklist
   - Troubleshooting guide

---

## 🎯 Success Metrics

Case 01 is now **fully playable** when:

- ✅ New players can understand what to do (L0 hint)
- ✅ All characters are accessible (Dr. Yahya, Chief Desk)
- ✅ All evidence can be reviewed (blueprints complete)
- ✅ Multiple completion paths exist (3 routes)
- ✅ Tutorial guidance is clear (scenarios documented)
- ✅ Trinity seeds are present but optional (CCTV corruption)
- ✅ False success has consequences (clarity debuff)
- ✅ True success is rewarding (awareness boost)

**Status: ✅ PLAYABLE** 🎮

---

## 🚀 Next Steps for Polish

While Case 01 is now playable, future improvements could include:

1. **Visual Tutorial** - Interactive walkthrough for first-time players
2. **Voice Acting** - Audio for inbox brief and key dialogues
3. **Animated Evidence** - 3D models for crime scene objects
4. **Dynamic Hints** - AI-powered hints based on player behavior
5. **Achievement System** - Rewards for finding all Trinity seeds
6. **Replay Value** - New Game+ with harder difficulty

But for now, **Case 01 is ready for players!** 🎉
