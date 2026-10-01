import React, { useState, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ShieldAlert, User, MapPin, Search, CheckCircle2, Circle } from 'lucide-react';

export const ArrestWarrantModal: React.FC = () => {
    const caseDefinition = useGameStore((s) => s.caseDefinition);
    const snapshot = useGameStore((s) => s.engineSnapshot);
    const tribunalSubmitting = useGameStore((s) => s.tribunalSubmitting);
    const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;
    const [selectedSuspect, setSelectedSuspect] = useState<string>('');
    const [motive, setMotive] = useState<string>('');
    const [method, setMethod] = useState<string>('');
    const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);

    const suspects = caseDefinition?.suspects || [];
    const motives = caseDefinition?.closure_rules?.available_motive_descriptions || {};
    const methods = caseDefinition?.closure_rules?.available_method_descriptions || {};

    const validationRules = caseDefinition?.closure_rules?.validate_closure;
    const closureBuckets = snapshot?.closureBuckets;

    // Validation Logic — mirrors backend closure rules exactly using selected evidence only
    const validationStatus = useMemo(() => {
        if (!validationRules || !closureBuckets) {
            return {
                behavioral: false,
                crossRoute: false,
                count: false,
                noShared: false,
                allMet: false,
                selectedBehavioralCount: 0,
                selectedCrossRouteCount: 0,
            };
        }

        // Intersect selected IDs with the globally verified set — only verified evidence counts
        const verifiedSet = new Set<string>(closureBuckets.verifiedEvidenceIds || []);
        const selectedVerified = selectedEvidenceIds.filter((id) => verifiedSet.has(id));

        // Behavioral: selected verified IDs that are in the behavioral bucket
        const behavioralBucketIds = new Set<string>(validationRules.behavioral_chain_evidence_ids || []);
        const selectedBehavioralIds = selectedVerified.filter((id) => behavioralBucketIds.has(id));
        const selectedBehavioralCount = selectedBehavioralIds.length;
        const behavioralMet = selectedBehavioralCount >= (validationRules.minimum_behavioral_chain_verified || 0);

        // Cross-route: selected verified IDs that are in the cross-route bucket
        const crossRouteBucketIds = new Set<string>(validationRules.cross_route_evidence_ids || []);
        const selectedCrossRouteIds = selectedVerified.filter((id) => crossRouteBucketIds.has(id));
        const selectedCrossRouteCount = selectedCrossRouteIds.length;
        const crossRouteMet = selectedCrossRouteCount >= (validationRules.minimum_cross_route_verified || 0);

        // Minimum evidence count: total selected (not just verified, matches engine submit check)
        const countMet = selectedEvidenceIds.length >= (caseDefinition?.closure_rules?.minimum_evidence_count || 0);

        // No-shared-evidence: check if any selected verified ID appears in both behavioral and cross-route buckets
        let noSharedMet = true;
        if (validationRules.no_shared_evidence_between_roles) {
            for (const id of selectedVerified) {
                if (behavioralBucketIds.has(id) && crossRouteBucketIds.has(id)) {
                    noSharedMet = false;
                    break;
                }
            }
        }

        return {
            behavioral: behavioralMet,
            crossRoute: crossRouteMet,
            count: countMet,
            noShared: noSharedMet,
            allMet: behavioralMet && crossRouteMet && countMet && noSharedMet,
            selectedBehavioralCount,
            selectedCrossRouteCount,
        };
    }, [validationRules, closureBuckets, caseDefinition, selectedEvidenceIds]);

    const handleSubmit = () => {
        if (!selectedSuspect || !motive || !method || !validationStatus.allMet) return;
        useGameStore.getState().submitTribunalAccusation({
            submitted_suspect: selectedSuspect,
            submitted_motive: motive,
            submitted_method_or_timeline: method,
            submitted_evidence_ids: selectedEvidenceIds
        });
    };

    const toggleEvidence = (id: string) => {
        setSelectedEvidenceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="warrant-container" style={{ direction: 'rtl' }}>
            <div className="warrant-header">
                <ShieldAlert size={isCompactLayout ? 40 : 48} color="#ff3b30" style={{ marginBottom: isCompactLayout ? '0.75rem' : '1rem' }} />
                <h2 className="warrant-title">أمر إلقاء قبض رسمي</h2>
                <p className="mono-text warrant-subtitle">أمر ضبط رسمي // جهة الاختصاص</p>
            </div>

            {/* Validation Hard Gate Panel */}
            <div className="validation-gate-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: isCompactLayout ? '0.9rem 0.85rem' : '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: isCompactLayout ? '1rem' : '1.5rem'
            }}>
                <h3 style={{ fontSize: isCompactLayout ? '0.78rem' : '0.85rem', marginBottom: '0.75rem', opacity: 0.8 }}>متطلبات الإغلاق القانوني:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isCompactLayout ? '0.74rem' : '0.8rem' }}>
                        {validationStatus.behavioral ? <CheckCircle2 size={14} color="#34c759" /> : <Circle size={14} opacity={0.3} />}
                        <span>اكتمال سلسلة الأدلة السلوكية ({validationStatus.selectedBehavioralCount}/{validationRules?.minimum_behavioral_chain_verified})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isCompactLayout ? '0.74rem' : '0.8rem' }}>
                        {validationStatus.crossRoute ? <CheckCircle2 size={14} color="#34c759" /> : <Circle size={14} opacity={0.3} />}
                        <span>الربط العابر للمسارات ({validationStatus.selectedCrossRouteCount}/{validationRules?.minimum_cross_route_verified})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isCompactLayout ? '0.74rem' : '0.8rem' }}>
                        {validationStatus.count ? <CheckCircle2 size={14} color="#34c759" /> : <Circle size={14} opacity={0.3} />}
                        <span>الحد الأدنى للأدلة المادية مفعّل ({selectedEvidenceIds.length}/{caseDefinition?.closure_rules?.minimum_evidence_count})</span>
                    </div>
                    {validationRules?.no_shared_evidence_between_roles && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isCompactLayout ? '0.74rem' : '0.8rem' }}>
                            {validationStatus.noShared ? <CheckCircle2 size={14} color="#34c759" /> : <Circle size={14} opacity={0.3} color="#ff3b30" />}
                            <span style={{ color: validationStatus.noShared ? 'inherit' : '#ff3b30' }}>قاعدة الأدلة الفريدة: لا يوجد تداخل بين التصنيفات</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="warrant-grid">
                <div className="warrant-field">
                    <label className="warrant-label">
                        <User size={16} /> المتهم الرئيسي
                    </label>
                    <select
                        title="اختيار المتهم"
                        value={selectedSuspect}
                        onChange={(e) => setSelectedSuspect(e.target.value)}
                        className="warrant-select"
                        style={{ fontSize: isCompactLayout ? '16px' : '0.95rem' }}
                    >
                        <option value="">اختر المشتبه به...</option>
                        {suspects.map((s) => (
                            <option key={s.character_id} value={s.character_id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="warrant-field">
                    <label className="warrant-label">
                        <Search size={16} /> الدافع المرجح
                    </label>
                    <select
                        title="اختيار الدافع"
                        value={motive}
                        onChange={(e) => setMotive(e.target.value)}
                        className="warrant-select"
                        style={{ fontSize: isCompactLayout ? '16px' : '0.95rem' }}
                    >
                        <option value="">اختر الدافع...</option>
                        {Object.entries(motives).map(([id, text]) => (
                            <option key={id} value={id}>{text as string}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="warrant-field" style={{ marginTop: '1rem' }}>
                <label className="warrant-label">
                    <MapPin size={16} /> وسيلة التنفيذ / الخطة
                </label>
                <select
                    title="اختيار الوسيلة"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="warrant-select"
                    style={{ fontSize: isCompactLayout ? '16px' : '0.95rem' }}
                >
                    <option value="">اختر الوسيلة...</option>
                    {Object.entries(methods).map(([id, text]) => (
                        <option key={id} value={id}>{text as string}</option>
                    ))}
                </select>
            </div>

            {/* Evidence Picker */}
            <div className="warrant-field" style={{ marginTop: '1.5rem' }}>
                <label className="warrant-label" style={{
                    display: 'flex',
                    alignItems: isCompactLayout ? 'flex-start' : 'center',
                    flexDirection: isCompactLayout ? 'column' : 'row',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }}>
                    <CheckCircle2 size={16} />
                    <span>الأدلة المرفقة مع المذكرة (المحققة فقط)</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5, marginRight: 'auto' }}>
                        المختارة: {selectedEvidenceIds.length}
                    </span>
                </label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isCompactLayout ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: isCompactLayout ? '0.55rem' : '0.75rem',
                    maxHeight: isCompactLayout ? '240px' : '200px',
                    overflowY: 'auto',
                    padding: isCompactLayout ? '0.75rem' : '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {((closureBuckets?.verifiedEvidenceIds as string[]) || []).map(id => {
                        const evidence = caseDefinition?.evidence_list.find(e => e.evidence_id === id);
                        const isSelected = selectedEvidenceIds.includes(id);
                        return (
                            <div
                                key={id}
                                onClick={() => toggleEvidence(id)}
                                style={{
                                    padding: isCompactLayout ? '0.65rem' : '0.75rem',
                                    background: isSelected ? 'rgba(77,163,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${isSelected ? 'var(--interaction-cool)' : 'rgba(255,255,255,0.15)'}`,
                                    borderRadius: '6px',
                                    fontSize: isCompactLayout ? '0.76rem' : '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: isCompactLayout ? '0.6rem' : '0.75rem',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isSelected ? '0 0 15px rgba(77,163,255,0.1)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                }}
                            >
                                <div style={{
                                    width: 16, height: 16, borderRadius: '4px',
                                    border: '2px solid var(--interaction-cool)',
                                    background: isSelected ? 'var(--interaction-cool)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}>
                                    {isSelected && <CheckCircle2 size={10} color="#fff" />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, opacity: isSelected ? 1 : 0.9 }}>{evidence?.title || id}</span>
                                    <span style={{ fontSize: isCompactLayout ? '0.62rem' : '0.65rem', opacity: 0.5 }}>{id}</span>
                                </div>
                            </div>
                        );
                    })}
                    {(!closureBuckets?.verifiedEvidenceIds || closureBuckets.verifiedEvidenceIds.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, gridColumn: '1/-1', fontSize: '0.85rem' }}>
                            لا توجد أدلة موثقة متاحة حاليًا.
                        </div>
                    )}
                </div>
            </div>

            <div className="warrant-submit-container" style={{ marginTop: '2rem' }}>
                <button
                    className="warrant-btn"
                    onClick={handleSubmit}
                    disabled={!selectedSuspect || !motive || !method || !validationStatus.allMet || tribunalSubmitting}
                    style={{
                        width: '100%',
                        padding: isCompactLayout ? '0.9rem' : '1rem',
                        background: validationStatus.allMet && !tribunalSubmitting ? 'linear-gradient(135deg, #ff3b30 0%, #d32f2f 100%)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid ' + (validationStatus.allMet && !tribunalSubmitting ? '#ff3b30' : 'rgba(255,255,255,0.1)'),
                        borderRadius: '8px',
                        color: validationStatus.allMet && !tribunalSubmitting ? '#fff' : 'rgba(255,255,255,0.3)',
                        fontSize: isCompactLayout ? '0.92rem' : '1rem',
                        fontWeight: 700,
                        cursor: validationStatus.allMet && !tribunalSubmitting ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: validationStatus.allMet && !tribunalSubmitting ? '0 10px 20px rgba(255, 59, 48, 0.2)' : 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                        if (validationStatus.allMet && !tribunalSubmitting) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 59, 48, 0.3)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (validationStatus.allMet && !tribunalSubmitting) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 59, 48, 0.2)';
                        }
                    }}
                >
                    {tribunalSubmitting
                        ? 'جارٍ إرسال ملف الإغلاق...'
                        : (validationStatus.allMet ? 'توقيع أمر القبض النهائي' : 'بانتظار استيفاء المتطلبات القانونية...')}
                </button>
            </div>

            <div className="mono-text warrant-warning">
                ⚠️ بمجرد التوقيع، لا يمكن التراجع عن هذا الإجراء وسيتم تقييم النتائج في المحاكمة.
            </div>
        </div>
    );
};
