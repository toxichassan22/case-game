import React, { useState } from 'react';
import { Monitor, Database, FolderOpen, ShieldAlert, Clock, Microscope, FileSearch, Lightbulb, MessageSquare } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { clampPercent, getTrustMeta } from '../utils/caseProgress';
import './Taskbar.css';

interface TaskbarProps {
  activeWindow: string | null;
  onOpenWindow: (windowName: string) => void;
  trustScore: number;
  specialty?: 'timeline' | 'forensics' | 'behavioral' | null;
  isSolo?: boolean;
  isHost?: boolean;
  onSwitchSpecialty?: () => void;
  onRequestClosure?: () => void;
  onCloseRoom?: () => void;
  onRequestSolution?: () => void;
  solutionRequests?: string[];
  totalPlayers?: number;
  highlightedSourceRef?: string | null;
  onToggleInventory?: () => void;
  isInventoryOpen?: boolean;
  currentCaseNumber?: number | null;
  discoveredEvidenceCount?: number;
  verifiedEvidenceCount?: number;
}

export const Taskbar: React.FC<TaskbarProps> = ({ 
  activeWindow, onOpenWindow, trustScore, 
  specialty, isSolo, isHost, onSwitchSpecialty, onRequestClosure,  onCloseRoom,
  onRequestSolution,
  solutionRequests = [],
  totalPlayers = 1,
  highlightedSourceRef = null,
  onToggleInventory,
  isInventoryOpen = false,
  currentCaseNumber = 1,
  discoveredEvidenceCount = 0,
  verifiedEvidenceCount = 0
}) => {
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [showCloseRoomModal, setShowCloseRoomModal] = useState(false);
  const [showTrustTooltip, setShowTrustTooltip] = useState(false);
  const safeTrustScore = clampPercent(trustScore);
  const trustMeta = getTrustMeta(safeTrustScore);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      {showClosureModal && onRequestClosure && (
        <ConfirmationModal
          title="تأكيد إغلاق القضية"
          message={
            <div>
              <p>هل أنت متأكد من تقديم طلب لإنهاء التحقيق والانتقال إلى مرحلة المحاكمة؟</p>
              <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>بمجرد الإجماع، سيتم استدعاء جميع الأطراف لتقديم الأدلة النهائية.</p>
            </div>
          }
          type="warning"
          confirmLabel="متابعة للمحاكمة"
          cancelLabel="تراجع"
          onConfirm={() => {
            setShowClosureModal(false);
            onRequestClosure();
          }}
          onCancel={() => setShowClosureModal(false)}
        />
      )}
      {showCloseRoomModal && onCloseRoom && (
        <ConfirmationModal
          title="تأكيد إغلاق الغرفة"
          message={
            <div>
              <p>هل أنت متأكد من إغلاق الغرفة الحالية؟</p>
              <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>سيتم إخراج جميع اللاعبين وحفظ التقدم الحالي قبل الإغلاق.</p>
            </div>
          }
          type="danger"
          confirmLabel="إغلاق الغرفة"
          cancelLabel="تراجع"
          onConfirm={() => {
            setShowCloseRoomModal(false);
            onCloseRoom();
          }}
          onCancel={() => setShowCloseRoomModal(false)}
        />
      )}
      <footer className="taskbar">
      <div className="taskbar-left">
        {/* Section Label */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          paddingRight: '1rem',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          marginRight: '0.5rem'
        }}>
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {!isCompactLayout && 'الأدوات'}
          </span>
        </div>
        
        <button
          className={`btn mobile-only-btn ${isInventoryOpen ? 'phs-highlight' : ''}`}
          onClick={onToggleInventory}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', padding: 0, background: isInventoryOpen ? 'var(--border-window)' : '' }}
          title="حقيبة الأدلة - اضغط لعرض الأدلة المتاحة"
          aria-label="حقيبة الأدلة"
        >
          <FolderOpen size={18} />
        </button>

        {([
          { name: 'Chat', winTitle: 'دردشة الفريق', label: 'الدردشة', icon: MessageSquare, tip: 'دردشة الفريق - تواصل مع فريق التحقيق', hidden: isSolo },
          { name: 'Inbox', winTitle: 'صندوق الوارد', label: 'الوارد', icon: Monitor, tip: 'صندوق الوارد - الرسائل والتنبيهات', hidden: false },
          { name: 'StringBoard', winTitle: 'لوحة الخيوط', label: 'الخيوط', icon: FolderOpen, tip: 'لوحة الخيوط - ربط الأدلة والعلاقات', hidden: false },
          { name: 'Database', winTitle: 'قاعدة البيانات', label: 'السجلات', icon: Database, tip: 'قاعدة البيانات - البحث في السجلات', hidden: discoveredEvidenceCount === 0 },
          { name: 'Timeline', winTitle: 'الخط الزمني', label: 'الزمني', icon: Clock, tip: 'الخط الزمني - ترتيب الأحداث', hidden: false },
          { name: 'Workbench', winTitle: 'المختبر', label: 'المختبر', icon: Microscope, tip: 'المختبر - التحليل الجنائي', hidden: currentCaseNumber === 1 && discoveredEvidenceCount <= 2 },
          { name: 'Explorer', winTitle: 'الأرشيف', label: 'الأرشيف', icon: FileSearch, tip: 'الأرشيف - ملفات القضايا السابقة', hidden: currentCaseNumber === null || currentCaseNumber <= 1 },
          { name: 'PHS', winTitle: 'نظام المساعدة المتقدم (PHS)', label: 'المساعدة', icon: Lightbulb, tip: 'المساعدة الذكية (PHS) - تلميحات وتوجيهات', hidden: false },
        ] as const).filter(t => !t.hidden).map(({ name, winTitle, label, icon: Icon, tip }) => (
          <button
            key={name}
            className={`btn taskbar-tool-btn ${highlightedSourceRef === name ? 'phs-highlight' : ''}`}
            onClick={() => onOpenWindow(name)}
            style={{ background: activeWindow === name || activeWindow === winTitle ? 'var(--border-window)' : '' }}
            title={tip}
            aria-label={tip}
          >
            <Icon size={17} />
            {!isCompactLayout && <span className="taskbar-tool-caption">{label}</span>}
          </button>
        ))}
      </div>

      <div className="taskbar-right">
        {/* Section Label */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          paddingLeft: '1rem',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          marginLeft: '0.5rem'
        }}>
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {!isCompactLayout && 'الإجراءات'}
          </span>
        </div>

        {/* Role Badge */}
        {specialty && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.6rem', borderRadius: '4px',
            background: 'rgba(77, 163, 255, 0.1)',
            border: '1px solid rgba(77, 163, 255, 0.2)',
            fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--interaction-cool)',
          }}>
            {specialty === 'timeline' ? '⏱️ المحقق الزمني' :
             specialty === 'forensics' ? '🔬 الجنائي' : '🧠 السلوكي'}
            
            {onSwitchSpecialty && (
              <button 
                onClick={onSwitchSpecialty}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  marginLeft: '0.5rem', color: 'inherit',
                  padding: '0.2rem', borderRadius: '3px',
                }}
                title="تغيير التخصص"
              >
                🔄
              </button>
            )}
          </div>
        )}

        {/* Closure Request Button - Hidden until significant progress */}
        {onRequestClosure && (
          <button 
            className="premium-btn btn-request-closure" 
            onClick={() => setShowClosureModal(true)}
            title="طلب إغلاق - بدء تصويت الفريق للانتقال للمحاكمة (يتطلب دليلين موثقين على الأقل)"
            disabled={verifiedEvidenceCount < 2}
            style={{ opacity: verifiedEvidenceCount < 2 ? 0.5 : 1, filter: verifiedEvidenceCount < 2 ? 'grayscale(100%)' : 'none' }}
          >
            <div className="premium-btn-bg"></div>
            <span className="premium-btn-content">
              <span style={{ fontSize: '1.1rem' }}>⚖️</span>
              {!isCompactLayout && <span>طلب إغلاق</span>}
            </span>
          </button>
        )}

        {/* Host Close Room Button */}
        {isHost && onCloseRoom && (
          <button 
            className="btn btn-close-room" 
            onClick={() => setShowCloseRoomModal(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: isCompactLayout ? '0.4rem' : undefined
            }}
            title="إغلاق الغرفة - إنهاء الجلسة وطرد جميع اللاعبين (للمضيف فقط)"
          >
            🚫 {!isCompactLayout && "إغلاق"}
          </button>
        )}


        {/* Global Solution Request - Hidden initially */}
        {((currentCaseNumber ?? 0) > 1 || discoveredEvidenceCount > 3) && (
          <button
            onClick={onRequestSolution}
            className="premium-btn btn-resolve-case"
            title="حل القضية - عرض الحل النهائي يتطلب موافقة جميع اللاعبين"
            disabled={verifiedEvidenceCount < 2}
            style={{ opacity: verifiedEvidenceCount < 2 ? 0.5 : 1, filter: verifiedEvidenceCount < 2 ? 'grayscale(100%)' : 'none' }}
          >
            <div className="premium-btn-bg"></div>
            <span className="premium-btn-content">
              <FileSearch size={16} className="icon-pulse" />
              {!isCompactLayout && <span>حل القضية ({solutionRequests.length}/{totalPlayers})</span>}
              {isCompactLayout && <span>({solutionRequests.length}/{totalPlayers})</span>}
            </span>
          </button>
        )}

        {/* Trust Meter */}
        <div 
          className="trust-meter" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCompactLayout ? '0.5rem' : '0.75rem',
            opacity: 0.95,
            flexShrink: 0,
            minWidth: isCompactLayout ? '168px' : '220px',
            padding: isCompactLayout ? '0.32rem 0.5rem' : '0.35rem 0.7rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'help',
            position: 'relative',
          }}
          onMouseEnter={() => setShowTrustTooltip(true)}
          onMouseLeave={() => setShowTrustTooltip(false)}
        >
          {/* Tooltip */}
          {showTrustTooltip && !isCompactLayout && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(20, 20, 20, 0.98)',
              border: `1px solid ${trustMeta.color}66`,
              borderRadius: '8px',
              padding: '0.75rem',
              width: '320px',
              zIndex: 1000,
              boxShadow: `0 8px 24px ${trustMeta.color}22`,
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: trustMeta.color }}>
                🔍 ما هو مقياس الثقة؟
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  الثقة المؤسسية تمثل <strong>درجة ثقة النيابة في تحقيقك</strong>. 
                </p>
                <ul style={{ margin: '0.5rem 0', paddingRight: '1rem' }}>
                  <li><strong>85%+:</strong> ثقة قوية - كل الصلاحيات متاحة</li>
                  <li><strong>65-84%:</strong> ثقة مستقرة - انتبه للأخطاء</li>
                  <li><strong>45-64%:</strong> ثقة حذرة - تأخير في التقارير</li>
                  <li><strong>25-44%:</strong> ثقة متراجعة - النيابة تراقبك</li>
                  <li><strong>&lt;25%:</strong> ثقة حرجة - قد تُغلق مسارات!</li>
                </ul>
                <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                  💡 <strong>نصيحة:</strong> تحقق من الأدلة بدقة وتجنب الاستنتاجات المتسرعة للحفاظ على الثقة.
                </p>
              </div>
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `8px solid ${trustMeta.color}66`,
              }} />
            </div>
          )}
          
          <ShieldAlert size={18} color={trustMeta.color} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: isCompactLayout ? '0.72rem' : '0.8rem' }}>{isCompactLayout ? 'الثقة' : 'الثقة المؤسسية'}</span>
              <span className="mono-text" style={{ fontSize: isCompactLayout ? '0.68rem' : '0.75rem', color: trustMeta.color }}>
                {safeTrustScore}%
              </span>
              <span style={{
                fontSize: isCompactLayout ? '0.62rem' : '0.7rem',
                color: trustMeta.color,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                background: `${trustMeta.color}22`,
                border: `1px solid ${trustMeta.color}33`,
              }}>
                {trustMeta.label}
              </span>
            </div>
            <div style={{ width: isCompactLayout ? '112px' : '150px', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${safeTrustScore}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${trustMeta.color} 0%, ${trustMeta.color}cc 100%)`,
                transition: 'width 0.3s ease, background-color 0.3s ease',
                boxShadow: `0 0 12px ${trustMeta.color}55`,
              }} />
            </div>
            {!isCompactLayout && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {trustMeta.description}
              </span>
            )}
          </div>
        </div>
        <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          SYS.ONLINE
        </span>
      </div>
    </footer>
    </>
  );
};
