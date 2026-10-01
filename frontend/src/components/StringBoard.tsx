import React, { useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Plus, Link2, MessageSquare, Move, X, FolderOpen } from 'lucide-react';
import type { RuntimeSnapshot, RuntimeCaseDefinition } from '../../../runtime/src/types';

type ToolMode = 'move' | 'link' | 'note';
type LinkType = 'strong' | 'suspicious' | 'contradicts';

interface ExtendedLink {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  linkType?: LinkType;
}

const LINK_COLORS: Record<LinkType, string> = {
  strong: 'var(--state-success)',
  suspicious: 'var(--state-warning)',
  contradicts: '#e74c3c',
};
const LINK_DASHES: Record<LinkType, string> = {
  strong: 'none',
  suspicious: '6 3',
  contradicts: '3 3',
};
const LINK_LABELS: Record<LinkType, string> = {
  strong: 'صلة قوية',
  suspicious: 'مشتبه',
  contradicts: 'تناقض',
};

export const StringBoard: React.FC = () => {
  const boardNodes = useGameStore(s => s.boardNodes);
  const boardLinks = useGameStore(s => s.boardLinks);
  const updateBoard = useGameStore(s => s.updateBoard);
  const currentRoom = useGameStore(s => s.currentRoom);
  const playerId = useGameStore(s => s.playerId);
  const engineSnapshot = useGameStore(s => s.engineSnapshot) as RuntimeSnapshot | null;
  const caseDefinition = useGameStore(s => s.caseDefinition) as RuntimeCaseDefinition | null;

  const boardRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('move');
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editNote, setEditNote] = useState('');
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);
  const [pendingLinkFrom, setPendingLinkFrom] = useState<string | null>(null);
  const [pendingLinkTo, setPendingLinkTo] = useState<string | null>(null);
  const [showEvidencePicker, setShowEvidencePicker] = useState(false);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  const inventoryItems = React.useMemo(() => {
    if (!engineSnapshot || !caseDefinition?.evidence_list) return [];
    return caseDefinition.evidence_list.map(def => ({
      id: def.evidence_id,
      title: def.title,
      type: def.type,
      state: engineSnapshot.evidenceStates[def.evidence_id] || 'locked',
    })).filter(item => item.state !== 'locked');
  }, [engineSnapshot, caseDefinition]);


  const getMySpecialty = () =>
    currentRoom?.players.find(p => p.playerId === playerId)?.specialty || null;

  const handleAddNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      label: 'ملاحظة جديدة',
      type: 'note' as const,
      specialty: getMySpecialty(),
      x: 80 + Math.random() * 200,
      y: (isCompactLayout ? 96 : 80) + Math.random() * 100,
    };
    updateBoard([...boardNodes, newNode], boardLinks);
  };

  const handleDeleteNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log('[StringBoard] Deleting node:', id);
    console.log('[StringBoard] Current nodes:', boardNodes.length);
    console.log('[StringBoard] Current links:', boardLinks.length);
    
    const newNodes = boardNodes.filter(n => n.id !== id);
    const newLinks = boardLinks.filter(l => l.fromId !== id && l.toId !== id);
    
    console.log('[StringBoard] New nodes:', newNodes.length);
    console.log('[StringBoard] New links:', newLinks.length);
    
    updateBoard(newNodes, newLinks);
    if (linkingFrom === id) setLinkingFrom(null);
  };

  const handleDeleteLink = (linkId: string) => {
    updateBoard(boardNodes, boardLinks.filter(l => l.id !== linkId));
  };

  const startPointerDrag = (e: React.PointerEvent, id: string) => {
    if (toolMode !== 'move') return;
    e.stopPropagation();
    setDraggingNode(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerDrag = (e: React.PointerEvent) => {
    if (!draggingNode || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 40;
    const updatedNodes = boardNodes.map(node =>
      node.id === draggingNode ? { ...node, x, y } : node
    );
    useGameStore.getState().setBoard(updatedNodes, boardLinks);
  };

  const endPointerDrag = (e: React.PointerEvent) => {
    if (draggingNode) {
      updateBoard(boardNodes, boardLinks);
      setDraggingNode(null);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    if (toolMode === 'link') {
      if (!linkingFrom) {
        setLinkingFrom(id);
      } else if (linkingFrom !== id) {
        // Show link type picker
        setPendingLinkFrom(linkingFrom);
        setPendingLinkTo(id);
        setLinkingFrom(null);
      } else {
        setLinkingFrom(null);
      }
      return;
    }

    if (toolMode === 'note') {
      const node = boardNodes.find(n => n.id === id);
      setEditingNode(id);
      setEditNote(node?.note || '');
      return;
    }
  };

  const handleNodeDoubleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = boardNodes.find(n => n.id === id);
    if (!node) return;
    setEditingNode(id);
    setEditText(node.label);
    setEditNote(node.note || '');
  };

  const finishEdit = () => {
    if (!editingNode) return;
    const updated = boardNodes.map(n =>
      n.id === editingNode
        ? { ...n, label: editText || n.label, note: editNote }
        : n
    );
    updateBoard(updated, boardLinks);
    setEditingNode(null);
    setEditText('');
    setEditNote('');
  };

  const confirmLink = (type: LinkType) => {
    if (!pendingLinkFrom || !pendingLinkTo) return;
    const newLink = {
      id: `link-${window.crypto.randomUUID()}`,
      fromId: pendingLinkFrom,
      toId: pendingLinkTo,
      label: LINK_LABELS[type],
      color: LINK_COLORS[type],
      linkType: type,
    };
    updateBoard(boardNodes, [...boardLinks, newLink]);
    setPendingLinkFrom(null);
    setPendingLinkTo(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.source !== 'inventory') return;
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 60;
      const y = e.clientY - rect.top - 40;
      if (boardNodes.some(n => n.id === data.id)) return;
      const newNode = {
        id: data.id,
        label: data.title,
        type: 'evidence' as const,
        specialty: getMySpecialty(),
        x, y,
      };
      updateBoard([...boardNodes, newNode], boardLinks);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const renderSVGLine = (link: ExtendedLink) => {
    const from = boardNodes.find(n => n.id === link.fromId);
    const to = boardNodes.find(n => n.id === link.toId);
    if (!from || !to) return null;
    const mx = (from.x + 60 + to.x + 60) / 2;
    const my = (from.y + 40 + to.y + 40) / 2;
    return (
      <g key={link.id}>
        {/* Clickable area (wider invisible line) */}
        <line
          x1={from.x + 60} y1={from.y + 40}
          x2={to.x + 60} y2={to.y + 40}
          stroke="transparent"
          strokeWidth={12}
          style={{ cursor: 'pointer' }}
          onClick={() => handleDeleteLink(link.id)}
        />
        {/* Visible line */}
        <line
          x1={from.x + 60} y1={from.y + 40}
          x2={to.x + 60} y2={to.y + 40}
          stroke={link.color || 'var(--thread-link)'}
          strokeWidth={2}
          strokeDasharray={link.linkType ? LINK_DASHES[link.linkType as LinkType] : '4 2'}
          style={{ pointerEvents: 'none' }}
        />
        {/* Label */}
        {link.label && (
          <text
            x={mx} y={my - 6}
            textAnchor="middle"
            fontSize={9}
            fill={link.color || 'var(--thread-link)'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {link.label}
          </text>
        )}
        {/* Delete X on hover — small circle */}
        <circle
          cx={mx} cy={my}
          r={7}
          fill="rgba(0,0,0,0.7)"
          stroke={link.color || 'var(--thread-link)'}
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
          onClick={() => handleDeleteLink(link.id)}
        />
        <text
          x={mx} y={my + 3}
          textAnchor="middle"
          fontSize={9}
          fill={link.color || 'var(--thread-link)'}
          style={{ cursor: 'pointer', pointerEvents: 'none', userSelect: 'none' }}
        >
          ×
        </text>
      </g>
    );
  };

  const tools: { id: ToolMode; label: string; icon: React.ReactNode }[] = [
    { id: 'move', label: 'تحريك', icon: <Move size={14} /> },
    { id: 'link', label: 'ربط', icon: <Link2 size={14} /> },
    { id: 'note', label: 'تعليق', icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="board-container">
      {/* Toolbar */}
      <div className="board-toolbar">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => { setToolMode(t.id); setLinkingFrom(null); }}
            title={t.label}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: isCompactLayout ? '6px 9px' : '6px 10px',
              borderRadius: '5px', fontSize: isCompactLayout ? '0.72rem' : '0.75rem',
              background: toolMode === t.id ? 'var(--interaction-cool)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${toolMode === t.id ? 'var(--interaction-cool)' : 'transparent'}`,
              color: toolMode === t.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-arabic)',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <hr style={{ border: '1px solid rgba(255,255,255,0.08)', margin: '2px 0' }} />
        <button
          onClick={handleAddNode}
          title="عقدة جديدة"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: isCompactLayout ? '6px 9px' : '6px 10px',
            borderRadius: '5px', fontSize: isCompactLayout ? '0.72rem' : '0.75rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-arabic)',
            flexShrink: 0,
          }}
        >
          <Plus size={14} /> عقدة
        </button>
        <button
          onClick={() => setShowEvidencePicker(!showEvidencePicker)}
          title="إضافة دليل للوحة"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: isCompactLayout ? '6px 9px' : '6px 10px',
            borderRadius: '5px', fontSize: isCompactLayout ? '0.72rem' : '0.75rem',
            background: showEvidencePicker ? 'var(--interaction-cool)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showEvidencePicker ? 'var(--interaction-cool)' : 'rgba(255,255,255,0.1)'}`,
            color: showEvidencePicker ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-arabic)',
            flexShrink: 0,
          }}
        >
          <FolderOpen size={14} /> دليل
        </button>
      </div>

      {showEvidencePicker && (
        <div style={{
          position: 'absolute',
          top: isCompactLayout ? '64px' : '70px',
          right: '12px',
          left: isCompactLayout ? '12px' : 'auto',
          zIndex: 100,
          background: 'rgba(20,20,20,0.95)', border: '1px solid var(--border-window)',
          borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
          maxHeight: isCompactLayout ? '42%' : '300px',
          overflowY: 'auto',
          width: isCompactLayout ? 'auto' : '220px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', padding: '0 4px', textAlign: 'right' }}>اختر دليلاً لإضافته للوحة:</div>
          {inventoryItems.map(item => {
            const isAdded = boardNodes.some(n => n.id === item.id);
            return (
              <button
                key={`picker-${item.id}`}
                disabled={isAdded}
                onClick={() => {
                  if (!isAdded) {
                    const newNode = {
                      id: item.id,
                      label: item.title,
                      type: 'evidence' as const,
                      specialty: getMySpecialty(),
                      x: 100 + Math.random() * 50,
                      y: 100 + Math.random() * 50,
                    };
                    updateBoard([...boardNodes, newNode], boardLinks);
                  }
                  setShowEvidencePicker(false);
                }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '0.5rem', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
                  color: isAdded ? 'var(--text-secondary)' : 'var(--text-primary)', 
                  cursor: isAdded ? 'not-allowed' : 'pointer', textAlign: 'right',
                  fontFamily: 'var(--font-arabic)', opacity: isAdded ? 0.5 : 1
                }}
              >
                <span className="mono-text" style={{ fontSize: '0.65rem', color: isAdded ? 'inherit' : 'var(--interaction-cool)' }}>{item.id}</span>
                <span style={{ fontSize: '0.8rem' }}>{item.title}</span>
              </button>
            );
          })}
          {inventoryItems.length === 0 && <div style={{ fontSize: '0.8rem', padding: '1rem', textAlign: 'center', opacity: 0.5, color: 'white' }}>الحقيبة فارغة</div>}
        </div>
      )}

      {/* Status hint */}
      {toolMode === 'link' && (
        <div className="status-hint link-hint" style={{ top: isCompactLayout ? '68px' : '12px' }}>
          {linkingFrom ? '← اختر العقدة الثانية' : '← اختر العقدة الأولى'}
        </div>
      )}
      {toolMode === 'note' && (
        <div className="status-hint note-hint" style={{ top: isCompactLayout ? '68px' : '12px' }}>
          اضغط على عقدة لإضافة تعليق
        </div>
      )}

      {/* Board canvas */}
      <div
        ref={boardRef}
        onPointerMove={onPointerDrag}
        onPointerUp={endPointerDrag}
        onPointerLeave={endPointerDrag}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={handleDrop}
        className="board-canvas"
      >
        {/* SVG links */}
        <svg style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'all', zIndex: 5,
        }}>
          {boardLinks.map(renderSVGLine)}
        </svg>

        {/* Empty state */}
        {boardNodes.length === 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.2, textAlign: 'center', pointerEvents: 'none',
          }}>
            <Link2 size={56} strokeWidth={1} style={{ marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1rem' }}>اسحب الأدلة من المخزن أو أضف عقدة جديدة</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Shift+Click → ربط مباشر</p>
          </div>
        )}

        {/* Nodes */}
        {boardNodes.map(node => {
          const isLinking = linkingFrom === node.id;
          const hasNote = !!node.note;
          const borderColor = node.specialty === 'timeline' ? 'var(--interaction-cool)'
            : node.specialty === 'forensics' ? 'var(--state-success)'
            : node.specialty === 'behavioral' ? 'var(--state-warning)'
            : 'var(--border-window)';

          return (
            <div
              key={node.id}
              onPointerDown={e => {
                // Don't start drag if clicking the delete button
                const target = e.target as HTMLElement;
                if (target.closest('.node-delete-btn')) return;
                startPointerDrag(e, node.id);
              }}
              onClick={e => {
                // Don't handle node click if clicking the delete button
                const target = e.target as HTMLElement;
                if (target.closest('.node-delete-btn')) return;
                handleNodeClick(e, node.id);
              }}
              onDoubleClick={e => handleNodeDoubleClick(e, node.id)}
              onMouseEnter={() => hasNote && setShowNoteFor(node.id)}
              onMouseLeave={() => setShowNoteFor(null)}
              style={{
                position: 'absolute', top: node.y, left: node.x,
                width: isCompactLayout ? 112 : 120, minHeight: isCompactLayout ? 64 : 70,
                background: isLinking ? 'rgba(77,163,255,0.2)' : 'var(--bg-window)',
                border: `2px solid ${isLinking ? 'var(--interaction-cool)' : borderColor}`,
                boxShadow: isLinking
                  ? '0 0 16px var(--interaction-cool)'
                  : '0 4px 12px rgba(0,0,0,0.4)',
                borderRadius: 6, padding: '0.4rem 0.5rem',
                cursor: toolMode === 'move' ? (draggingNode === node.id ? 'grabbing' : 'grab') : 'pointer',
                userSelect: 'none', zIndex: draggingNode === node.id ? 30 : 10,
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
            >
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[StringBoard] Delete button clicked for node:', node.id);
                  handleDeleteNode(e, node.id);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="حذف العقدة"
                className="node-delete-btn"
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#e74c3c', border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 100, opacity: 1,
                  transition: 'all 0.2s ease',
                  padding: 0,
                  pointerEvents: 'auto',
                  transform: 'scale(1)',
                  boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.3)';
                  e.currentTarget.style.background = '#c0392b';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = '#e74c3c';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.4)';
                }}
              >
                <X size={12} color="white" strokeWidth={3} />
              </button>

              {/* Note indicator */}
              {hasNote && (
                <div style={{
                  position: 'absolute', top: -7, left: -7,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#a78bfa', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <MessageSquare size={9} color="white" />
                </div>
              )}

              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginBottom: '3px', fontFamily: 'var(--font-mono)' }}>
                {node.id.includes('-') ? node.id.split('-').pop()?.slice(0, 8) : node.id.slice(-6)}
              </div>
              <div style={{ fontSize: isCompactLayout ? '0.74rem' : '0.78rem', wordBreak: 'break-word', lineHeight: 1.4 }}>
                {node.label}
              </div>

              {/* Note tooltip */}
              {showNoteFor === node.id && hasNote && (
                <div style={{
                  position: 'absolute', bottom: '110%', right: 0,
                  background: '#1a1a2e', border: '1px solid #a78bfa',
                  borderRadius: '6px', padding: '6px 10px',
                  fontSize: '0.75rem', maxWidth: 180, whiteSpace: 'pre-wrap',
                  zIndex: 50, color: '#e0d7ff', lineHeight: 1.4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}>
                  {node.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {editingNode && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
          onClick={finishEdit}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-window)',
              border: '1px solid var(--border-window)',
              borderRadius: '10px', padding: '1.25rem',
              width: 280, display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>تعديل العقدة</h4>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>العنوان</label>
              <input
                autoFocus
                title="عنوان العقدة"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && finishEdit()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-window)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 0.6rem', borderRadius: '6px',
                  fontFamily: 'var(--font-arabic)', fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>تعليق / ملاحظة</label>
              <textarea
                title="تعليق أو ملاحظة"
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'none',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-window)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 0.6rem', borderRadius: '6px',
                  fontFamily: 'var(--font-arabic)', fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingNode(null)} className="btn" style={{ background: 'transparent', fontSize: '0.8rem' }}>
                إلغاء
              </button>
              <button onClick={finishEdit} className="btn" style={{ fontSize: '0.8rem' }}>
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Type Picker */}
      {pendingLinkFrom && pendingLinkTo && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => { setPendingLinkFrom(null); setPendingLinkTo(null); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-window)',
              border: '1px solid var(--border-window)',
              borderRadius: '10px', padding: '1.25rem',
              width: 260, display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>نوع الصلة</h4>
            {(['strong', 'suspicious', 'contradicts'] as LinkType[]).map(type => (
              <button
                key={type}
                onClick={() => confirmLink(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.9rem', borderRadius: '7px',
                  background: `${LINK_COLORS[type]}18`,
                  border: `1px solid ${LINK_COLORS[type]}55`,
                  color: LINK_COLORS[type], cursor: 'pointer',
                  fontFamily: 'var(--font-arabic)', fontSize: '0.85rem',
                  textAlign: 'right',
                }}
              >
                <svg width="32" height="8">
                  <line
                    x1="0" y1="4" x2="32" y2="4"
                    stroke={LINK_COLORS[type]} strokeWidth="2"
                    strokeDasharray={LINK_DASHES[type]}
                  />
                </svg>
                {LINK_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .node-delete-btn { display: flex !important; opacity: 1 !important; }
        .board-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          ${isCompactLayout ? 'display: flex; flex-direction: column;' : ''}
        }
        .board-toolbar {
          ${isCompactLayout
            ? 'position: relative; z-index: 20; display: flex; gap: 0.35rem; flex-direction: row; overflow-x: auto; margin: 12px 12px 0 12px;'
            : 'position: absolute; top: 12px; right: 12px; z-index: 20; display: flex; gap: 0.4rem; flex-direction: column;'}
          background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          border: 1px solid var(--border-window); border-radius: 8px;
          padding: 0.5rem;
        }
        .board-toolbar::-webkit-scrollbar { display: none; }
        .board-toolbar hr { ${isCompactLayout ? 'display: none;' : ''} }
        .board-canvas {
          width: 100%; height: 100%;
          ${isCompactLayout ? 'flex: 1;' : ''}
          background: #111;
          position: relative; overflow: hidden;
          background-image: radial-gradient(circle, #222 1.5px, transparent 2px);
          background-size: 36px 36px;
          touch-action: none;
        }
        .status-hint {
          position: absolute; left: 12px; z-index: 20;
          border-radius: 6px; padding: 6px 12px; font-size: 0.78rem;
          pointer-events: none;
        }
        .link-hint { background: rgba(77,163,255,0.15); border: 1px solid var(--interaction-cool); color: var(--interaction-cool); }
        .note-hint { background: rgba(167,139,250,0.15); border: 1px solid #a78bfa; color: #a78bfa; }
      `}</style>
    </div>
  );
};
