# 🎯 Investigator Role Balance - Detailed Specification

## 📊 Problem Analysis

### Current Issue
- Evidence distribution is uneven across specialties
- Some investigators have 10+ files, others have 1-2 files
- Players with fewer files feel left out
- No clear role identity per investigator

### Impact
- Reduced enjoyment for under-resourced players
- One investigator dominates the investigation
- Collaboration becomes meaningless
- Players don't understand their unique contribution

---

## 🎭 Three Investigator Roles

### 1️⃣ Timeline Investigator (محقق الخط الزمني)

**Role**: Events, timing, alibis, CCTV footage

**Exclusive Evidence (5-6 items)**:
- CCTV recordings
- Phone records/timestamps
- GPS location data
- Witness timeline statements
- Event sequencing reports
- Security system logs

**Key Ability**: Can lock timeline events that unlock new investigation paths

**Example Evidence from Case01**:
```
- video01.mp4 (Street CCTV)
- video03.mp4 (Corrupted CCTV file)
- Timeline blueprint events
- Security system analysis
```

**Unique Contribution**: Determines WHEN the crime happened and identifies alibi contradictions

---

### 2️⃣ Forensics Investigator (محقق الأدلة الجنائية)

**Role**: Physical evidence, lab reports, chemical analysis

**Exclusive Evidence (5-6 items)**:
- Crime scene photos
- Forensic lab reports
- Chemical analysis results
- Physical objects (keys, tools, etc.)
- Material evidence receipts
- Autopsy/medical reports

**Key Ability**: Can submit evidence to lab for detailed analysis

**Example Evidence from Case01**:
```
- photo01-07.png (Crime scene photos)
- report01.png (Autopsy report)
- report02.png (Fire origin report)
- Chemical residue analysis
- Physical evidence items
```

**Unique Contribution**: Determines HOW the crime was committed through scientific analysis

---

### 3️⃣ Behavioral Investigator (محقق السلوك والشهود)

**Role**: Interrogations, psychological profiles, witness testimonies

**Exclusive Evidence (5-6 items)**:
- Suspect interrogation transcripts
- Audio recordings of testimonies
- Psychological profiles
- Behavioral analysis reports
- Witness statements
- Character backgrounds/motives

**Key Ability**: Can detect lies and contradictions in testimonies

**Example Evidence from Case01**:
```
- audio01-05.wav (Suspect testimonies)
- photo08-12.png (Suspect portraits)
- Interrogation dialog trees
- Behavioral analysis notes
- Relationship maps
```

**Unique Contribution**: Determines WHY the crime was committed through motive analysis

---

## 📦 Evidence Distribution Strategy

### Rule 1: Minimum Guarantee
```typescript
const MIN_EVIDENCE_PER_ROLE = 5;
const MAX_EVIDENCE_PER_ROLE = 7;
```

### Rule 2: Route Weight System
Each evidence has a `route_weight` object:
```json
{
  "evidence_id": "SCN-03",
  "route_weight": {
    "timeline": 0.8,    // Timeline investigator (80% match)
    "forensics": 0.6,   // Forensics investigator (60% match)
    "behavioral": 0.1   // Behavioral investigator (10% match)
  }
}
```

### Rule 3: Exclusive vs Shared
- **Exclusive (60%)**: Only accessible to one specialty
- **Shared (40%)**: Accessible to all, but requires collaboration

```json
{
  "evidence_id": "EVID-CRITICAL-01",
  "route_weight": {
    "timeline": 0.0,
    "forensics": 0.0,
    "behavioral": 0.0
  },
  "requires_route_collaboration": ["timeline", "forensics"],
  "locked": true,
  "summary": "This evidence requires Timeline AND Forensics investigators to combine their findings"
}
```

### Rule 4: Key Evidence
Each role gets ONE "key evidence" that:
- Only they can access
- Is critical for solving the case
- Forces other investigators to collaborate with them

```json
{
  "evidence_id": "TIMELINE-KEY-01",
  "route_weight": {
    "timeline": 1.0,
    "forensics": 0.0,
    "behavioral": 0.0
  },
  "is_key_evidence": true,
  "title": "Critical Timeline Discovery (Timeline Investigator Only)"
}
```

---

## 🔧 Implementation Details

### Step 1: Update Case Definitions

For each case (case01-case59), ensure evidence_list has proper route_weight:

```python
# Example for case01
evidence_list = [
    # Timeline Investigator Evidence
    {
        "evidence_id": "SCN-03",
        "title": "تقرير منشأ الحريق",
        "type": "report",
        "route_weight": {
            "timeline": 0.9,
            "forensics": 0.4,
            "behavioral": 0.1
        },
        "requires_route_collaboration": []
    },
    
    # Forensics Investigator Evidence
    {
        "evidence_id": "OBJ-01",
        "title": "الدفتر الأسود الممزق",
        "type": "document",
        "route_weight": {
            "timeline": 0.2,
            "forensics": 0.9,
            "behavioral": 0.3
        },
        "requires_route_collaboration": []
    },
    
    # Behavioral Investigator Evidence
    {
        "evidence_id": "INT-SHARIF-01",
        "title": "استجواب شريف",
        "type": "interrogation",
        "route_weight": {
            "timeline": 0.1,
            "forensics": 0.2,
            "behavioral": 0.9
        },
        "requires_route_collaboration": []
    },
    
    # Shared Evidence (Requires Collaboration)
    {
        "evidence_id": "EVID-COLLAB-01",
        "title": "تقرير شامل للأدلة",
        "type": "report",
        "route_weight": {
            "timeline": 0.0,
            "forensics": 0.0,
            "behavioral": 0.0
        },
        "requires_route_collaboration": ["timeline", "forensics", "behavioral"],
        "depends_on_evidence_ids": ["SCN-03", "OBJ-01", "INT-SHARIF-01"]
    }
]
```

### Step 2: Update PerspectiveFilter

```typescript
// server/src/managers/PerspectiveFilter.ts

interface EvidenceDistribution {
  exclusive: CaseEvidence[];
  shared: CaseEvidence[];
  keyEvidence: CaseEvidence | null;
}

function getEvidenceForSpecialty(
  allEvidence: CaseEvidence[],
  specialty: 'timeline' | 'forensics' | 'behavioral'
): EvidenceDistribution {
  const EXCLUSIVE_THRESHOLD = 0.7;
  const MIN_EXCLUSIVE = 4;
  const MAX_EXCLUSIVE = 6;
  
  // 1. Get exclusive evidence (route_weight >= 0.7 for this specialty)
  let exclusive = allEvidence.filter(e => 
    e.route_weight?.[specialty] >= EXCLUSIVE_THRESHOLD
  );
  
  // 2. Get key evidence
  const keyEvidence = exclusive.find(e => e.is_key_evidence) || null;
  
  // 3. If not enough exclusive evidence, add shared evidence
  if (exclusive.length < MIN_EXCLUSIVE) {
    const sharedCandidates = allEvidence.filter(e => 
      e.requires_route_collaboration?.includes(specialty)
      && e.route_weight?.[specialty] >= 0.4
    );
    
    const needed = MIN_EXCLUSIVE - exclusive.length;
    exclusive.push(...sharedCandidates.slice(0, needed));
  }
  
  // 4. Cap at maximum
  exclusive = exclusive.slice(0, MAX_EXCLUSIVE);
  
  // 5. Get truly shared evidence (all specialties can access)
  const shared = allEvidence.filter(e => 
    e.requires_route_collaboration?.length >= 2
    && !exclusive.includes(e)
  );
  
  return {
    exclusive: exclusive.sort((a, b) => 
      (b.route_weight?.[specialty] || 0) - (a.route_weight?.[specialty] || 0)
    ),
    shared,
    keyEvidence
  };
}

export function getPerspectiveFilter(
  allEvidence: CaseEvidence[],
  specialty: 'timeline' | 'forensics' | 'behavioral' | null
): CaseEvidence[] {
  if (!specialty) {
    // Solo mode - return all evidence
    return allEvidence;
  }
  
  const distribution = getEvidenceForSpecialty(allEvidence, specialty);
  
  // Combine exclusive + shared
  const visibleEvidence = [
    ...distribution.exclusive,
    ...distribution.shared
  ];
  
  return visibleEvidence;
}

export function getRoleDescription(specialty: string): string {
  const descriptions = {
    timeline: {
      title: 'محقق الخط الزمني',
      description: 'متخصص في الأحداث، التسجيلات، وتحديد التسلسل الزمني. تستطيع كشف التناقضات في الأعذار.',
      icon: '🕐',
      keyAbility: 'تثبيت الأحداث الزمنية لفتح مسارات جديدة'
    },
    forensics: {
      title: 'محقق الأدلة الجنائية',
      description: 'متخصص في الأدلة المادية، التقارير المعملية، والتحليل العلمي. تستطيع إرسال العينات للمختبر.',
      icon: '🔬',
      keyAbility: 'إرسال الأدلة للمختبر للحصول على تحليل مفصل'
    },
    behavioral: {
      title: 'محقق السلوك والشهود',
      description: 'متخصص في الاستجواب، التحليل النفسي، وشهادات الشهود. تستطيع كشف الأكاذيب.',
      icon: '🧠',
      keyAbility: 'كشف التناقضات في أقوال المشتبه بهم'
    }
  };
  
  return descriptions[specialty] || null;
}
```

### Step 3: Update Waiting Room UI

```typescript
// frontend/src/pages/WaitingRoom.tsx

function SpecialtyCard({ specialty, playerCount }: Props) {
  const role = getRoleDescription(specialty);
  const evidenceCount = useGameStore(s => 
    s.getEvidenceCountForSpecialty(specialty)
  );
  
  return (
    <div className="specialty-card">
      <div className="specialty-icon">{role.icon}</div>
      <h3>{role.title}</h3>
      <p>{role.description}</p>
      
      <div className="specialty-stats">
        <div className="stat">
          <span className="stat-label">الأدلة المتاحة:</span>
          <span className="stat-value">{evidenceCount} ملف</span>
        </div>
        <div className="stat">
          <span className="stat-label">اللاعبين:</span>
          <span className="stat-value">{playerCount}/1</span>
        </div>
      </div>
      
      <div className="specialty-ability">
        <strong>القدرة الخاصة:</strong> {role.keyAbility}
      </div>
    </div>
  );
}
```

### Step 4: Add Collaboration Triggers

When evidence requires multiple specialties:

```typescript
// In engine when player tries to access shared evidence
function canAccessEvidence(
  evidence: CaseEvidence,
  playerSpecialty: string,
  teamSpecialties: string[]
): boolean {
  // If evidence requires collaboration
  if (evidence.requires_route_collaboration?.length > 0) {
    // Check if ALL required specialties are present in team
    const hasAllRequired = evidence.requires_route_collaboration.every(
      required => teamSpecialties.includes(required)
    );
    
    return hasAllRequired;
  }
  
  // Regular evidence - check route_weight
  const weight = evidence.route_weight?.[playerSpecialty] || 0;
  return weight >= 0.5;
}
```

---

## 📋 Case-by-Case Distribution Template

For each case, ensure this structure:

```
Case XX Evidence Distribution:
├── Timeline Investigator (5-7 items)
│   ├── 2-3 CCTV/recordings
│   ├── 1-2 timeline documents
│   ├── 1 security/technical report
│   └── 1 key timeline evidence
│
├── Forensics Investigator (5-7 items)
│   ├── 2-3 crime scene photos
│   ├── 1-2 lab reports
│   ├── 1-2 physical objects
│   └── 1 key forensic evidence
│
├── Behavioral Investigator (5-7 items)
│   ├── 2-3 interrogation audio/transcripts
│   ├── 1-2 witness statements
│   ├── 1 psychological profile
│   └── 1 key behavioral evidence
│
└── Shared/Collaborative Evidence (3-4 items)
    ├── 1 evidence requiring 2 specialties
    ├── 1 evidence requiring all 3 specialties
    └── 1-2 summary/conclusion documents
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Each specialty gets minimum 5 evidence items
- [ ] No specialty gets more than 7 exclusive items
- [ ] Key evidence exists for each specialty
- [ ] Shared evidence requires correct collaboration

### Integration Tests
- [ ] 3-player team: Each player sees different evidence
- [ ] Collaboration triggers work correctly
- [ ] Shared evidence unlocks when all specialties present
- [ ] Solo mode shows all evidence

### Balance Tests
- [ ] Timeline investigator can determine WHEN
- [ ] Forensics investigator can determine HOW
- [ ] Behavioral investigator can determine WHY
- [ ] All three needed to fully solve case
- [ ] No single role can solve alone

### User Experience Tests
- [ ] Role selection screen is clear
- [ ] Players understand their unique contribution
- [ ] Collaboration feels necessary, not forced
- [ ] All roles feel equally important

---

## 📝 Migration Plan

### Phase 1: Update Existing Cases (case01-case10)
- Add route_weight to all evidence
- Ensure minimum 5 items per specialty
- Test with 3-player teams

### Phase 2: Update Mid Cases (case11-case30)
- Same as Phase 1
- Add collaboration triggers

### Phase 3: Update Late Cases (case31-case59)
- Same as Phase 1
- Add betrayal mechanics for case09+

### Phase 4: Testing & Balancing
- Playtest with real players
- Adjust route_weights based on feedback
- Add/remove evidence as needed

---

**Last Updated**: 2026-04-09
**Status**: Specification Complete
**Priority**: CRITICAL - Must fix before next playtest
