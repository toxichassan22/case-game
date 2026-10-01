import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Microscope, Zap, Database, Activity, Fingerprint, Scan, Cpu, Terminal, FileText, Box, HardDrive, Dna, ChevronRight, Shield, FlaskConical, Atom, Radiation, AlertTriangle, CheckCircle2, Clock, Eye } from 'lucide-react';
import type { CaseEvidence } from '../../../runtime/src/types.js';

const TypewriterText: React.FC<{ text: string; delay?: number; speed?: number }> = ({ text, delay = 0, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setStarted(false);
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!started || !text) return;
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, started, speed]);

  return <span>{displayedText}{started && displayedText.length < (text?.length || 0) && <span className="lab-cursor-blink">_</span>}</span>;
}

// Decorative animated data stream
const DataStream: React.FC = () => {
  const [chars] = useState<string[]>(() => {
    const charSets = ['0', '1', 'A', 'B', 'C', 'D', 'E', 'F', '█', '▓', '░'];
    return Array.from({ length: 24 }, () => charSets[Math.floor(Math.random() * charSets.length)]);
  });

  return (
    <div className="lab-data-stream" aria-hidden="true">
      {chars.map((c, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.08}s` }}>{c}</span>
      ))}
    </div>
  );
};

export const ForensicsWorkbench: React.FC<{ initialSelectedEvidence?: string }> = ({ initialSelectedEvidence }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState(0);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(initialSelectedEvidence || null);
  const [showDetails, setShowDetails] = useState(false);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  useEffect(() => {
    if (initialSelectedEvidence) {
      setSelectedEvidence(initialSelectedEvidence);
    }
  }, [initialSelectedEvidence]);

  // Animate details panel when evidence is selected
  useEffect(() => {
    if (selectedEvidence) {
      setShowDetails(false);
      const timer = setTimeout(() => setShowDetails(true), 100);
      return () => clearTimeout(timer);
    }
  }, [selectedEvidence]);

  const snapshot = useGameStore((s) => s.engineSnapshot);
  const caseDefinition = useGameStore.getState().caseDefinition;
  const openedItems = useGameStore((s) => s.openedEvidenceIds);
  const markOpened = useGameStore((s) => s.markEvidenceOpened);

  useEffect(() => {
    if (selectedEvidence) {
      markOpened(selectedEvidence);
    }
  }, [selectedEvidence, markOpened]);

  // Filter forensic evidence
  const forensicEvidence: CaseEvidence[] = caseDefinition?.evidence_list.filter((e) =>
    (e.type === 'report' || e.tags?.includes('forensics') || (e.route_weight && e.route_weight.forensics > 0)) &&
    snapshot?.evidenceStates[e.evidence_id] !== 'locked'
  ) || [];
  const selectedEvidenceData = forensicEvidence.find((e) => e.evidence_id === selectedEvidence) || null;

  const sendToLab = useGameStore((s) => s.sendEvidenceToLab);

  const handleAnalyze = () => {
    if (!selectedEvidence) return;
    
    setAnalyzing(true);
    setAnalyzingStage(1);

    // Visual feedback stages
    setTimeout(() => setAnalyzingStage(2), 1200);
    setTimeout(() => setAnalyzingStage(3), 2400);

    setTimeout(() => {
      sendToLab(selectedEvidence);
      setAnalyzing(false);
      setAnalyzingStage(0);
    }, 3500);
  };

  const getEvidenceStatus = (id: string) => {
    const state = snapshot?.evidenceStates?.[id];
    if (['verified', 'final', 'submitted', 'presented'].includes(state || '')) return 'verified';
    
    const isPending = snapshot?.verifiedFacts.includes(`lab_pending:${id}`);
    if (isPending) return 'pending';

    if (openedItems.includes(id)) return 'opened';
    return 'discovered';
  };

  const isReport = selectedEvidenceData?.type === 'report';

  const statusConfig = useMemo(() => ({
    discovered: { label: 'مكتشف', icon: <Eye size={12} />, color: 'var(--state-warning)' },
    opened: { label: 'تم الفحص', icon: <Scan size={12} />, color: '#4da3ff' },
    pending: { label: 'قيد التحليل', icon: <Clock size={12} />, color: '#a78bfa' },
    verified: { label: 'موثّق', icon: <CheckCircle2 size={12} />, color: 'var(--state-success)' },
  }), []);

  const renderEvidenceIcon = (type?: string, size = 56) => {
    const iconProps = { size, strokeWidth: 1.2, className: 'lab-evidence-type-icon' };
    switch (type) {
      case 'document':
      case 'report': return <FileText {...iconProps} />;
      case 'object': return <Box {...iconProps} />;
      case 'digital': return <HardDrive {...iconProps} />;
      case 'physical': return <Dna {...iconProps} />;
      default: return <Scan {...iconProps} />;
    }
  };

  const currentStatus = selectedEvidence ? getEvidenceStatus(selectedEvidence) : null;
  const canAnalyze = currentStatus === 'discovered' || currentStatus === 'opened';

  // Calculate remaining actions if pending
  const pendingEffect = snapshot?.scheduledEffects?.find(e => e.target_ref === selectedEvidence && e.kind === 'delayed_trigger');
  const remainingSteps = pendingEffect ? Math.max(0, pendingEffect.until_tick - (snapshot?.currentTick || 0)) : null;
  
  // Check if this evidence requires specific files to be opened
  const requiredFilesSingle = selectedEvidenceData?.lab_unlock_requires_evidence_id;
  const requiredFilesMultiple = selectedEvidenceData?.lab_unlock_requires_evidence_ids || [];
  const requiredFiles = requiredFilesMultiple.length > 0 ? requiredFilesMultiple : (requiredFilesSingle ? [requiredFilesSingle] : []);
  const isFileBased = requiredFiles.length > 0;
  
  // Check status of each required file
  const requiredFilesStatus = requiredFiles.map(fileId => {
    const fileData = caseDefinition?.evidence_list.find(e => e.evidence_id === fileId);
    const isOpened = snapshot?.evidenceStates?.[fileId] === 'verified' || 
                     snapshot?.visitedSources?.includes(fileId);
    return {
      id: fileId,
      title: fileData?.title || fileId,
      isOpened,
    };
  });
  
  const allFilesOpened = requiredFilesStatus.every(f => f.isOpened);
  const openedFilesCount = requiredFilesStatus.filter(f => f.isOpened).length;

  return (
    <div className="lab-shell" style={isCompactLayout ? { flexDirection: 'column' } : undefined}>
      {/* ── LEFT: Specimens Tray ── */}
      <aside
        className="lab-specimens-tray"
        style={isCompactLayout ? {
          width: '100%',
          maxWidth: '100%',
          borderRight: 'none',
          borderBottom: '1px solid rgba(0,240,255,0.12)',
        } : undefined}
      >
        {/* Lab branding header */}
        <div className="lab-tray-header">
          <div className="lab-tray-header-top">
            <FlaskConical size={18} className="lab-header-icon" />
            <span className="lab-tray-title">عينات المختبر</span>
          </div>
          <div className="lab-tray-subtitle">
            <span className="lab-specimen-count">{forensicEvidence.length}</span> عينة متاحة للتحليل
          </div>
        </div>

        {/* Lab Statistics Dashboard */}
        {forensicEvidence.length > 0 && (
          <div className="lab-stats-bar">
            <div className="lab-stat-item">
              <span className="lab-stat-icon">✓</span>
              <span className="lab-stat-value">
                {forensicEvidence.filter(e => getEvidenceStatus(e.evidence_id) === 'verified').length}
              </span>
              <span className="lab-stat-label">مكتمل</span>
            </div>
            <div className="lab-stat-item">
              <span className="lab-stat-icon">⏳</span>
              <span className="lab-stat-value">
                {forensicEvidence.filter(e => getEvidenceStatus(e.evidence_id) === 'pending').length}
              </span>
              <span className="lab-stat-label">قيد التحليل</span>
            </div>
            <div className="lab-stat-item">
              <span className="lab-stat-icon">🔍</span>
              <span className="lab-stat-value">
                {forensicEvidence.filter(e => getEvidenceStatus(e.evidence_id) === 'discovered' || getEvidenceStatus(e.evidence_id) === 'opened').length}
              </span>
              <span className="lab-stat-label">جاهز</span>
            </div>
          </div>
        )}

        {/* Specimen list */}
        <div
          className="lab-specimen-list"
          style={isCompactLayout ? {
            flexDirection: 'row',
            overflowX: 'auto',
            overflowY: 'hidden',
          } : undefined}
        >
          {forensicEvidence.length === 0 ? (
            <div className="lab-empty-tray">
              <Atom size={36} className="lab-empty-tray-icon" />
              <span>لا توجد عينات متاحة</span>
              <span className="lab-empty-tray-sub">سيتم إرسال العينات المكتشفة هنا تلقائياً</span>
            </div>
          ) : (
            forensicEvidence.map((ev) => {
              const status = getEvidenceStatus(ev.evidence_id);
              const isActive = selectedEvidence === ev.evidence_id;
              const cfg = statusConfig[status];
              return (
                <button
                  key={ev.evidence_id}
                  onClick={() => setSelectedEvidence(ev.evidence_id)}
                  className={`lab-specimen-card ${isActive ? 'active' : ''} lab-status-${status}`}
                  style={isCompactLayout ? { minWidth: '170px', flexShrink: 0 } : undefined}
                >
                  <div className="lab-specimen-card-inner">
                    <div className="lab-specimen-icon-box">
                      {renderEvidenceIcon(ev.type, 28)}
                    </div>
                    <div className="lab-specimen-info">
                      <span className="lab-specimen-name" title={ev.title}>{ev.title}</span>
                      <span className="lab-specimen-id">{ev.evidence_id.split('-').pop()}</span>
                    </div>
                    <div className="lab-specimen-status-badge" style={{ color: cfg.color, borderColor: `${cfg.color}44` }}>
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </div>
                  </div>
                  {isActive && <div className="lab-specimen-active-bar" />}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── RIGHT: Analysis Station ── */}
      <main className="lab-station" style={isCompactLayout ? { padding: '0.8rem' } : undefined}>
        {/* Lab top bar */}
        <div className="lab-topbar">
          <div className="lab-topbar-left">
            <Radiation size={16} className="lab-topbar-icon" />
            <span>محطة التحليل الجنائي</span>
          </div>
          <div className="lab-topbar-right">
            <div className="lab-status-indicator" />
            <span className="lab-topbar-status">ACTIVE</span>
          </div>
        </div>

        {/* Director's note banner */}
        <div className="lab-director-banner">
          <AlertTriangle size={15} className="lab-director-icon" />
          <span>
            <strong>كيف يعمل المختبر؟</strong> أرسل العينة للتحليل، ثم تابع التحقيق بشكل طبيعي (افتح أدلة، استجوب، ابحث). بعد عدة خطوات سيصلك الاستنتاج المعملي تلقائياً — لا تنتظر هنا.
          </span>
        </div>

        {!selectedEvidence ? (
          /* ─── Empty / Standby State ─── */
          <div className="lab-standby">
            <div className="lab-standby-orb">
              <div className="lab-standby-ring lab-ring-1" />
              <div className="lab-standby-ring lab-ring-2" />
              <div className="lab-standby-ring lab-ring-3" />
              <Fingerprint size={48} strokeWidth={1} className="lab-standby-icon" />
            </div>
            <div className="lab-standby-text">
              <h3>نظام الفحص الجنائي الآلي</h3>
              <p>في وضع الاستعداد — أدخل عينة من القائمة لبدء التحليل</p>
            </div>
            <DataStream />
          </div>
        ) : (
          /* ─── Active Analysis View ─── */
          <div className={`lab-analysis-view ${showDetails ? 'lab-visible' : ''}`}>
            {/* ── Top: Evidence Identity Bar ── */}
            <div className="lab-identity-bar">
              <div className="lab-identity-left">
                <div className="lab-identity-icon-box">
                  {renderEvidenceIcon(selectedEvidenceData?.type, 36)}
                </div>
                <div className="lab-identity-info">
                  <h2 className="lab-identity-title">{selectedEvidenceData?.title}</h2>
                  <div className="lab-identity-meta">
                    <span><Terminal size={13} /> {selectedEvidence}</span>
                    <span><Cpu size={13} /> {snapshot?.evidenceQualities?.[selectedEvidence] || 'STANDARD'}</span>
                    <span><Shield size={13} /> {selectedEvidenceData?.evidence_tier?.toUpperCase() || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="lab-identity-actions">
                {canAnalyze ? (
                  <button
                    className="lab-analyze-btn"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                  >
                    <span className="lab-analyze-btn-glow" />
                    {analyzing ? <Zap size={18} className="lab-pulse" /> : <Microscope size={18} />}
                    <span>{analyzing ? 'جاري الإرسال...' : 'إرسال للمختبر'}</span>
                    <ChevronRight size={16} />
                  </button>
                ) : currentStatus === 'pending' ? (
                  <div className="lab-status-chip pending">
                    <Zap size={16} className="lab-pulse" />
                    <span>قيد التحليل {remainingSteps !== null ? `(متبقي ${remainingSteps} خطوات)` : ''}</span>
                  </div>
                ) : (
                  <div className="lab-status-chip verified">
                    <CheckCircle2 size={16} />
                    <span>تم الفحص والاعتماد</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pending lab hint - explains the wait */}
            {currentStatus === 'pending' && (
              <div className="lab-pending-notice">
                <div className="lab-pending-notice-icon">
                   <Clock size={18} />
                </div>
                <div className="lab-pending-notice-content">
                  {isFileBased ? (
                    <>
                      <strong>التحليل يتطلب {requiredFiles.length > 1 ? 'ملفات إضافية' : 'ملف إضافي'}!</strong>
                      <p>
                        المختبر يحتاج لمراجعة الملفات التالية لاستكمال التحليل:
                      </p>
                      
                      {/* Linked Files Visualization */}
                      <div className="lab-required-files-list">
                        {requiredFilesStatus.map(file => (
                          <div key={file.id} className={`lab-file-item ${file.isOpened ? 'opened' : 'locked'}`}>
                            <span className="lab-file-icon">
                              {file.isOpened ? '✓' : '🔒'}
                            </span>
                            <span className="lab-file-name">{file.title}</span>
                            <span className="lab-file-id">{file.id}</span>
                          </div>
                        ))}
                      </div>
                      
                      {allFilesOpened ? (
                        <span className="lab-file-ready"> 
                          ✓ جميع الملفات تم فتحها - النتيجة ستظهر قريباً
                        </span>
                      ) : (
                        <span className="lab-file-required"> 
                          افتح {openedFilesCount}/{requiredFiles.length} الملفات المطلوبة وستظهر النتيجة هنا تلقائياً
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <strong>التحليل يتطلب وقت المعالجة!</strong>
                      <p>
                        المختبر يعمل بشكل متوازي مع تحقيقك. قم بإجراء <strong>{remainingSteps ?? 5} إجراءات إضافية</strong> (مثل استجواب الأشخاص، معاينة أدلة جديدة، أو ربط خيوط القضية) وسيصدر التقرير الجنائي فوراً هنا.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Scanning Overlay ── */}
            {analyzing && (
              <div className="lab-scan-overlay">
                <div className="lab-scan-container">
                  <div className="lab-scan-circle">
                    <div className="lab-scan-circle-inner" />
                    <div className="lab-scan-rotating-ring" />
                    {!isReport ? (
                      <Fingerprint size={80} style={{ color: '#00f0ff', opacity: 0.9, zIndex: 2, filter: 'drop-shadow(0 0 16px #00f0ff)' }} />
                    ) : (
                      <Database size={80} style={{ color: '#00f0ff', opacity: 0.9, zIndex: 2, filter: 'drop-shadow(0 0 16px #00f0ff)' }} />
                    )}
                    <div className="lab-scan-sweep" />
                  </div>
                  <div className="lab-scan-label">
                    {!isReport ? (
                      <>
                        {analyzingStage === 1 && 'جاري عزل الطفرات الحيوية...'}
                        {analyzingStage === 2 && 'تصنيف البصمة الوراثية وتفكيك البنية...'}
                        {analyzingStage === 3 && 'مضاهاة البيانات مع السجلات الجنائية...'}
                      </>
                    ) : (
                      <>
                        {analyzingStage === 1 && 'جاري فك تشفير البيانات المرجعية...'}
                        {analyzingStage === 2 && 'التحقق من صحة التواقيع الرقمية...'}
                        {analyzingStage === 3 && 'مقارنة المحتوى مع قاعدة البيانات...'}
                      </>
                    )}
                  </div>
                  <div className="lab-scan-target">
                    [ {selectedEvidence?.split("-").pop()} ] // خوارزميات التدقيق نشطة //
                  </div>
                </div>
              </div>
            )}

            {/* ── Main Content Area ── */}
            <div className="lab-content-grid" style={isCompactLayout ? { gridTemplateColumns: '1fr' } : undefined}>
              {/* Left panel: Evidence metadata  */}
              <div className="lab-metadata-panel">
                <div className="lab-panel-header">
                  <Activity size={16} />
                  <span>تصنيف العينة</span>
                </div>
                <div className="lab-metadata-rows">
                  <div className="lab-meta-row">
                    <span className="lab-meta-label">النوع</span>
                    <span className="lab-meta-value">{selectedEvidenceData?.type?.toUpperCase() || 'UNKNOWN'}</span>
                  </div>
                  <div className="lab-meta-row">
                    <span className="lab-meta-label">الأهمية</span>
                    <span className="lab-meta-value">{selectedEvidenceData?.evidence_tier?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div className="lab-meta-row">
                    <span className="lab-meta-label">الدور</span>
                    <span className="lab-meta-value">{selectedEvidenceData?.evidence_role?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div className="lab-meta-row">
                    <span className="lab-meta-label">الارتباط</span>
                    <span className="lab-meta-value">{selectedEvidenceData?.tags?.slice(0, 2).join(', ') || 'NONE'}</span>
                  </div>
                </div>

                {/* Visual specimen card */}
                <div className="lab-specimen-visual">
                  <div className="lab-specimen-visual-bg" />
                  {renderEvidenceIcon(selectedEvidenceData?.type, 64)}
                  <div className="lab-specimen-visual-scanline" />
                </div>
              </div>

              {/* Right panel: Analysis data */}
              <div className="lab-data-column">
                {/* Primary report */}
                <div className="lab-report-section">
                  <div className="lab-report-header">
                    <Database size={16} />
                    <span>التفاصيل الأولية للسجل</span>
                  </div>
                  <div className="lab-report-body">
                    <TypewriterText
                      key={`content-${selectedEvidence}-${snapshot?.evidenceStates?.[selectedEvidence]}`}
                      text={snapshot?.evidenceSummaries?.[selectedEvidence] || selectedEvidenceData?.summary || ''}
                      speed={10}
                    />
                  </div>
                </div>

                {/* Lab conclusion */}
                <div className={`lab-report-section lab-conclusion ${currentStatus === 'verified' ? 'revealed' : ''}`}>
                  <div className="lab-report-header">
                    <Microscope size={16} />
                    <span>الاستنتاج المعملي النهائي</span>
                    {currentStatus !== 'verified' && <span className="lab-locked-badge">مقفل</span>}
                  </div>
                  <div className="lab-report-body">
                    {currentStatus === 'verified'
                      ? <TypewriterText key={`conc-${selectedEvidence}`} text={selectedEvidenceData?.upgraded_summary || 'تم التوثيق النهائي للبيانات الحيوية ومطابقتها.'} speed={20} delay={600} />
                      : <div className="lab-blurred-text">
                          {selectedEvidenceData?.upgraded_summary || 'جاري استخراج النتائج النهائية من قاعدة البيانات والتحقق من التوقيع الجيني...'}
                        </div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
