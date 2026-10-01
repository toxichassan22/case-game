# 🔬 Lab System - Procedural Flow Specification

## 🎯 Problem Statement

### Current Issue
- Evidence files (reports) already contain final results
- "Send to Lab" button feels redundant
- No clear workflow: Evidence → Lab → Results
- Players confused why they're "sending" something that already has answers

### Example (Current - WRONG):
```
Player opens "تقرير منشأ الحريق"
→ Report says: "المنشأ في مكتب الإدارة مع مؤشرات مادة مسرعة"
→ Player reads result immediately
→ "Send to Lab" button exists but does nothing meaningful
```

### Desired Flow (CORRECT):
```
Player opens "عينة من موقع الحريق"
→ Shows: "عينة كيميائية - بحاجة لتحليل معملي"
→ Player clicks "إرسال للمختبر"
→ Lab processing animation (30-60 seconds or instant for gameplay)
→ New evidence appears: "تقرير المختبر - تحليل العينة"
→ Report says: "تم اكتشاف آثار بنزين مخلوط بمادة تبريد..."
```

---

## 🔄 Lab Workflow Design

### Stage 1: Evidence Collection (Partial State)
```json
{
  "evidence_id": "SCN-03",
  "title": "عينة من موقع الحريق",
  "type": "physical_evidence",
  "state": "unexamined",
  "summary": "عينة كيميائية جُمعت من موقع الحريق - تحتاج تحليل معملي",
  "lab_submission_required": true,
  "image_url": "/assets/cases/case01/images/photo07.png",
  "can_submit_to_lab": true
}
```

**What Player Sees:**
- Photo of chemical residue
- Description: "عينة غير محللة"
- Button: "🔬 إرسال للمختبر الجنائي"
- No results visible yet

---

### Stage 2: Lab Submission
```typescript
// Player clicks "Send to Lab"
function handleSubmitToLab(evidenceId: string) {
  sendAction({
    type: PLAYER_ACTION_TYPE.SUBMIT_TO_LAB,
    evidence_id: evidenceId
  });
}

// Server processes
{
  "action": "SUBMIT_TO_LAB",
  "evidence_id": "SCN-03",
  "result": {
    "accepted": true,
    "lab_report_id": "LAB-SCN-03",
    "processing_time": 30, // seconds (can be instant for gameplay)
    "new_evidence_unlocked": true
  }
}
```

**What Player Sees:**
- Processing animation: "جاري التحليل..."
- Progress bar or timer
- Message: "سيظهر تقرير المختبر قريباً"

---

### Stage 3: Lab Results (New Evidence)
```json
{
  "evidence_id": "LAB-SCN-03",
  "title": "تقرير المختبر - تحليل العينة الكيميائية",
  "type": "lab_report",
  "state": "verified",
  "summary": "تم اكتشاف آثار بنزين مخلوط بمادة تبريد لتأخير الاشتعال",
  "content": "التحليل الكيميائي للعينة المُرسلة (SCN-03):\n\n1. المادة الأساسية: بنزين (C6H6)\n2. مادة مضافة: مادة تبريد (تأخير الاشتعال 45 دقيقة)\n3. التركيز: عالي - يشير لاستخدام متعمد\n4. المنشأ: صناعي - ليس مادة منزلية عادية\n\nالاستنتاج: الحريق مُدبّر وليس حادثاً عشوائياً",
  "source_evidence_id": "SCN-03",
  "lab_analysis_complete": true,
  "image_url": "/assets/cases/case01/images/report02.png"
}
```

**What Player Sees:**
- Official lab report document
- Detailed analysis results
- Clear conclusion
- Badge: "✅ تقرير معتمد من المختبر"

---

## 📊 Evidence State Machine

### New State Flow
```
unexamined → submitted_to_lab → lab_processing → lab_complete
     ↓
  partial (if some info available without lab)
     ↓
  verified (after lab analysis or other confirmation)
```

### State Definitions
```typescript
type EvidenceState = 
  | 'unexamined'        // Fresh evidence, no analysis
  | 'submitted_to_lab'  // Sent to lab, awaiting results
  | 'lab_processing'    // Lab working on it (can show animation)
  | 'lab_complete'      // Results ready
  | 'partial'           // Some info known, needs more investigation
  | 'verified';         // Fully confirmed
```

---

## 🎨 UI/UX Implementation

### Evidence Viewer - Before Lab Submission

```tsx
// frontend/src/components/EvidenceViewer.tsx

function EvidenceViewer({ evidence }) {
  const isLabRequired = evidence.lab_submission_required;
  const isLabComplete = evidence.lab_analysis_complete;
  
  return (
    <div className="evidence-viewer">
      {/* Evidence Header */}
      <div className="evidence-header">
        <h2>{evidence.title}</h2>
        <EvidenceStateBadge state={evidence.state} />
      </div>
      
      {/* Evidence Image/Content */}
      {evidence.image_url && (
        <img src={evidence.image_url} alt={evidence.title} />
      )}
      
      {/* Partial Summary (Before Lab) */}
      <div className="evidence-summary">
        {evidence.summary}
      </div>
      
      {/* Lab Submission Button */}
      {isLabRequired && !isLabComplete && (
        <div className="lab-submission-box">
          <div className="lab-icon">🔬</div>
          <div className="lab-info">
            <h4>هذه العينة تحتاج تحليل معملي</h4>
            <p>إرسال العينة للمختبر الجنائي سيكشف تفاصيل إضافية</p>
          </div>
          <button 
            className="btn btn-lab-submit"
            onClick={() => handleSubmitToLab(evidence.evidence_id)}
          >
            إرسال للمختبر
          </button>
        </div>
      )}
      
      {/* Lab Processing */}
      {isLabRequired && evidence.state === 'lab_processing' && (
        <div className="lab-processing">
          <Loader2 className="spin" />
          <p>جاري التحليل المعملي...</p>
          <ProgressBar progress={evidence.lab_progress || 0} />
        </div>
      )}
      
      {/* Lab Report Link (After Analysis) */}
      {isLabComplete && evidence.lab_report_id && (
        <div className="lab-complete-box">
          <div className="lab-complete-icon">✅</div>
          <div className="lab-complete-info">
            <h4>تم التحليل بنجاح</h4>
            <p>تقرير المختبر جاهز للمراجعة</p>
            <button 
              className="btn btn-view-lab-report"
              onClick={() => navigateToEvidence(evidence.lab_report_id)}
            >
              عرض تقرير المختبر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Lab Report Viewer (After Analysis)

```tsx
function LabReportViewer({ labReport }) {
  return (
    <div className="lab-report">
      {/* Official Header */}
      <div className="lab-report-header">
        <div className="lab-badge">🔬 المختبر الجنائي</div>
        <h2>{labReport.title}</h2>
        <div className="lab-meta">
          <span>رقم التقرير: {labReport.evidence_id}</span>
          <span>العينة الأصلية: {labReport.source_evidence_id}</span>
          <span>الحالة: ✅ معتمد</span>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="lab-report-content">
        {labReport.image_url && (
          <img src={labReport.image_url} alt="Lab report document" />
        )}
        
        <div className="lab-report-text">
          {labReport.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      
      {/* Conclusion Box */}
      <div className="lab-conclusion">
        <h3>الاستنتاج</h3>
        <p>{extractConclusion(labReport.content)}</p>
      </div>
    </div>
  );
}
```

---

## 🔧 Backend Implementation

### Action Handler

```typescript
// server/src/websocket/handler.ts

case 'SUBMIT_TO_LAB': {
  const { evidence_id } = msg.payload;
  
  const result = engineHost.processAction(roomId, {
    type: PLAYER_ACTION_TYPE.SUBMIT_TO_LAB,
    evidence_id
  });
  
  if (result.accepted) {
    // Get lab report evidence
    const labReport = result.unlockedEvidence?.find(
      e => e.source_evidence_id === evidence_id
    );
    
    // For gameplay: Instant results (can add delay later)
    if (labReport) {
      broadcastToRoomAll(roomId, {
        type: 'LAB_COMPLETE',
        payload: {
          original_evidence: evidence_id,
          lab_report: labReport.evidence_id,
          message: `تقرير المختبر جاهز: ${labReport.title}`
        }
      });
    }
    
    broadcastSnapshots(roomId);
  }
  break;
}
```

### Engine Processing

```typescript
// runtime/src/engine/evidenceProcessing.ts

export function processLabSubmission(
  state: EngineState,
  evidenceId: string,
  caseDef: RuntimeCaseDefinition
): ActionResult {
  const evidence = caseDef.evidence_list.find(e => e.evidence_id === evidenceId);
  
  if (!evidence || !evidence.lab_submission_required) {
    return { accepted: false, reason: 'Evidence does not require lab analysis' };
  }
  
  if (state.evidenceStates[evidenceId] !== 'unexamined') {
    return { accepted: false, reason: 'Evidence already examined' };
  }
  
  // Update state
  state.evidenceStates[evidenceId] = 'submitted_to_lab';
  
  // Find corresponding lab report
  const labReport = caseDef.evidence_list.find(
    e => e.source_evidence_id === evidenceId
  );
  
  if (!labReport) {
    return { accepted: false, reason: 'No lab report configured for this evidence' };
  }
  
  // Unlock lab report (instant for gameplay)
  state.evidenceStates[labReport.evidence_id] = 'verified';
  state.verifiedEvidenceIds.add(labReport.evidence_id);
  
  return {
    accepted: true,
    emittedEvents: [{
      event_name: 'EVENT_LAB_ANALYSIS_COMPLETE',
      source_ref: evidenceId,
      result: labReport.evidence_id,
      display_text: `اكتمل التحليل: ${labReport.title}`
    }],
    unlockedEvidence: [labReport]
  };
}
```

---

## 📝 Data Structure Updates

### Case Definition - Example (Case01)

```json
{
  "evidence_list": [
    {
      "evidence_id": "SCN-03",
      "title": "عينة من موقع الحريق",
      "type": "physical_evidence",
      "state": "unexamined",
      "summary": "عينة كيميائية جُمعت من موقع الحريق - تحتاج تحليل معملي",
      "lab_submission_required": true,
      "image_url": "/assets/cases/case01/images/photo07.png"
    },
    {
      "evidence_id": "LAB-SCN-03",
      "title": "تقرير المختبر - تحليل العينة الكيميائية",
      "type": "lab_report",
      "state": "locked",
      "locked": true,
      "summary": "تم اكتشاف آثار بنزين مخلوط بمادة تبريد",
      "content": "التحليل الكيميائي للعينة المُرسلة (SCN-03):\n\n1. المادة الأساسية: بنزين (C6H6)\n2. مادة مضافة: مادة تبريد (تأخير الاشتعال 45 دقيقة)\n3. التركيز: عالي - يشير لاستخدام متعمد\n\nالاستنتاج: الحريق مُدبّر وليس حادثاً عشوائياً",
      "source_evidence_id": "SCN-03",
      "lab_analysis_complete": false,
      "image_url": "/assets/cases/case01/images/report02.png"
    }
  ]
}
```

---

## 🎯 Migration Plan for Existing Cases

### Step 1: Identify Lab-Required Evidence
For each case (case01-case59):
```python
# Script to identify evidence that should require lab
lab_required_keywords = [
    'تقرير', 'report', 'analysis', 'تحليل', 
    'عينة', 'sample', 'chemical', 'كيميائي',
    'forensic', 'جنائي', 'lab', 'مختبر'
]

for case in cases:
    for evidence in case.evidence_list:
        if any(keyword in evidence.title.lower() for keyword in lab_required_keywords):
            evidence.lab_submission_required = True
```

### Step 2: Split Existing Evidence
For evidence that has both description AND results:
```
Before:
- "تقرير منشأ الحريق" (contains full analysis)

After:
- "عينة من موقع الحريق" (photo + description, unexamined)
- "تقرير المختبر - تحليل العينة" (lab report with results)
```

### Step 3: Add Source Links
```json
{
  "original_evidence": {
    "evidence_id": "SCN-03",
    "lab_submission_required": true
  },
  "lab_report": {
    "evidence_id": "LAB-SCN-03",
    "source_evidence_id": "SCN-03",
    "locked": true
  }
}
```

---

## 🧪 Testing Scenarios

### Test 1: Basic Lab Flow
```
Given: Player has unexamined evidence (SCN-03)
When: Player clicks "إرسال للمختبر"
Then: 
  - Evidence state changes to "submitted_to_lab"
  - Lab report (LAB-SCN-03) unlocks
  - Notification: "تقرير المختبر جاهز"
  - Player can now view LAB-SCN-03
```

### Test 2: Lab Report Dependencies
```
Given: Timeline event requires LAB-SCN-03
When: Player hasn't submitted SCN-03 to lab
Then: Timeline event shows "ينقص: تقرير المختبر"

When: Player submits SCN-03 to lab
Then: Timeline event prerequisite is satisfied
```

### Test 3: Multiple Lab Submissions
```
Given: Player has 3 evidence items requiring lab
When: Player submits all 3
Then: 
  - 3 lab reports unlock
  - Each report has unique analysis
  - Player can review them in any order
```

### Test 4: Team Mode Lab Sharing
```
Given: Forensics investigator submits evidence to lab
When: Lab report unlocks
Then: 
  - All team members can see lab report
  - Notification sent to all players
  - Report is shared automatically (forensics specialty)
```

---

## 📋 Implementation Checklist

### Frontend
- [ ] Add lab submission button to EvidenceViewer
- [ ] Create lab processing animation
- [ ] Create lab report viewer component
- [ ] Add state badges (unexamined, submitted, complete)
- [ ] Add notification when lab report unlocks
- [ ] Style lab submission box (distinct from regular evidence)
- [ ] Add "View Lab Report" link in original evidence

### Backend
- [ ] Add SUBMIT_TO_LAB action type
- [ ] Create evidenceProcessing.ts with lab logic
- [ ] Update evidence state machine
- [ ] Link original evidence to lab report
- [ ] Broadcast lab complete event to room
- [ ] Add lab report to verified evidence list

### Data
- [ ] Review case01: Split evidence into original + lab report
- [ ] Add lab_submission_required flag to appropriate evidence
- [ ] Add source_evidence_id to lab reports
- [ ] Ensure all lab reports are locked initially
- [ ] Test with case01, then scale to other cases

---

## 🎯 Success Metrics

After implementation:
- ✅ Players understand why they need to "send to lab"
- ✅ Lab workflow feels like real investigation step
- ✅ No evidence shows results before lab submission
- ✅ Lab reports feel like valuable discoveries
- ✅ Clear separation between evidence collection and analysis

---

**Last Updated**: 2026-04-09
**Status**: Specification Complete
**Priority**: MEDIUM - Important for investigation realism
