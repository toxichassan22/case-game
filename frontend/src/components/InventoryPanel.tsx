import React, { useState } from 'react';
import { Package, Share2, Users, User, X } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';

interface InventoryItem {
  id: string;
  title: string;
  type: string;
  state: string;
}

interface InventoryPanelProps {
  items: InventoryItem[];
  onItemClick: (id: string) => void;
  highlightedSourceRef?: string | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

// Share Popover Component
const SharePopover: React.FC<{ evidenceId: string; onClose: () => void }> = ({ evidenceId, onClose }) => {
  const currentRoom = useGameStore(s => s.currentRoom);
  const playerId = useGameStore(s => s.playerId);
  const shareEvidence = useGameStore(s => s.shareEvidence);

  const otherPlayers = currentRoom?.players.filter(p => p.playerId !== playerId) || [];

  if (otherPlayers.length === 0) {
    return (
      <div
        className="inventory-share-popover"
        style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        لا يوجد فريق للمشاركة
      </div>
    );
  }

  return (
    <div
      className="inventory-share-popover"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="inventory-share-title">مشاركة مع...</div>
      <div className="inventory-share-list">
        <button
          type="button"
          className="btn inventory-share-btn"
          onClick={(e) => { e.stopPropagation(); shareEvidence(evidenceId, 'all'); onClose(); }}>
          <Users size={12} style={{ marginLeft: '4px' }}/> الجميع
        </button>
        {otherPlayers.map(p => (
          <button
            key={p.playerId}
            type="button"
            className="btn inventory-share-btn"
            onClick={(e) => { e.stopPropagation(); shareEvidence(evidenceId, p.playerId); onClose(); }}>
            <User size={12} style={{ marginLeft: '4px' }}/> {p.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemClick,
  highlightedSourceRef = null,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;
  const openedEvidenceIds = useGameStore((s) => s.openedEvidenceIds);

  return (
    <aside className={`inventory-panel-container ${isOpenMobile ? 'open-on-mobile' : ''}`}>
      {/* Custom scrollbar styles */}
      <style>{`
        .inventory-panel-container::-webkit-scrollbar {
          width: 6px;
        }
        .inventory-panel-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        .inventory-panel-container::-webkit-scrollbar-thumb {
          background: rgba(77, 163, 255, 0.3);
          border-radius: 3px;
          transition: background 0.2s;
        }
        .inventory-panel-container::-webkit-scrollbar-thumb:hover {
          background: rgba(77, 163, 255, 0.5);
        }
        .inventory-panel-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(77, 163, 255, 0.3) rgba(15, 23, 42, 0.5);
        }
      `}</style>
      <header className="inventory-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={18} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>حقيبة الأدلة</h3>
            {isCompactLayout && (
              <span className="inventory-header-count">{items.length} ملفًا متاحًا</span>
            )}
          </div>
        </div>
        {isCompactLayout && onCloseMobile && (
          <button
            type="button"
            className="inventory-close-btn"
            onClick={onCloseMobile}
            aria-label="إغلاق الحقيبة"
            title="إغلاق الحقيبة"
          >
            <X size={18} />
          </button>
        )}
      </header>
      
      <div className="inventory-content">
        {items.map(item => {
          const isVerified = item.state === 'verified';
          const isPartial = item.state === 'partial';
          const isOpened = openedEvidenceIds.includes(item.id);
          
          return (
          <div 
            key={item.id} 
            onClick={() => onItemClick(item.id)}
            draggable={true}
            onPointerDown={(e) => {
              // On touch devices, we often need a pointerDown to prepare the drag state
              // if standard HTML5 drag doesn't trigger immediately.
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            }}
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify({
                id: item.id,
                title: item.title,
                type: item.type,
                source: 'inventory'
              }));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            className={`inventory-item-card ${activeShareId === item.id ? 'share-open' : ''} ${item.id === highlightedSourceRef ? 'phs-highlight' : ''} ${isPartial && !isOpened ? 'needs-attention' : ''} ${isPartial && isOpened ? 'needs-attention-opened' : ''}`}
            style={isPartial && !isOpened ? { animation: 'attention-glow 2s infinite alternate' } : {}}
            title={`اضغط ل${isVerified ? 'مراجعة' : 'فتح ومراجعة'} الدليل${!isVerified ? ' وتوثيقه' : ''}`}
          >
            <style>{`
              @keyframes attention-glow {
                0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.2); border-left: 3px solid rgba(245, 158, 11, 0.5); }
                100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.6); border-left: 3px solid rgba(245, 158, 11, 1); }
              }
              .needs-attention::after {
                content: '';
                position: absolute;
                top: -4px;
                right: -4px;
                width: 12px;
                height: 12px;
                background-color: #f59e0b;
                border-radius: 50%;
                box-shadow: 0 0 8px #f59e0b;
              }
              .needs-attention-opened::after {
                content: '';
                position: absolute;
                top: -4px;
                right: -4px;
                width: 12px;
                height: 12px;
                background-color: #4da3ff;
                border-radius: 50%;
                box-shadow: 0 0 8px #4da3ff;
              }
              .inventory-item-card { position: relative; }
            `}</style>
            <div className="inventory-item-header">
              <span className="inventory-item-id mono-text">{item.id}</span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {/* Status indicator icon */}
                <span style={{ fontSize: '0.85rem' }}>
                  {isVerified ? '✅' : isPartial ? '⚠️' : '🔓'}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveShareId(activeShareId === item.id ? null : item.id); }}
                  className="inventory-share-icon-btn"
                  title="مشاركة الدليل"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
            <span className="inventory-item-title">{item.title}</span>
            {/* Action hint text */}
            <div style={{ 
              fontSize: '0.65rem', 
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              fontStyle: 'italic',
              opacity: 0.8
            }}>
              {!isVerified ? '🔍 يحتاج مراجعة وتوثيق' : '✓ موثق - اضغط للمراجعة'}
            </div>
            <div className="inventory-item-footer">
              <span className="inventory-item-type">{item.type}</span>
              <span className="inventory-item-state" style={{ color: isVerified ? 'var(--state-success)' : 'var(--state-warning)' }}>
                {isVerified ? 'موثق' : isPartial ? 'جزئي' : item.state}
              </span>
            </div>
            {activeShareId === item.id && (
              <SharePopover evidenceId={item.id} onClose={() => setActiveShareId(null)} />
            )}
          </div>
        );
        })}
        {items.length === 0 && (
          <div className="inventory-empty-state">
            الحقيبة فارغة.
          </div>
        )}
      </div>
    </aside>
  );
};
