import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore, type Specialty, type PlayerInfo } from '../stores/gameStore';
import { wsService } from '../services/websocket';
import './WaitingRoom.css';

const SPECIALTIES: Array<{
  id: Specialty;
  icon: string;
  name: string;
  description: string;
  color: string;
}> = [
  {
    id: 'timeline',
    icon: '⏱️',
    name: 'المحقق الزمني',
    description: 'تحليل التسلسل الزمني والأحداث المتتابعة لكشف التناقضات',
    color: '#4da3ff',
  },
  {
    id: 'forensics',
    icon: '🔬',
    name: 'المحقق الجنائي',
    description: 'فحص الأدلة الماديّة والتقارير المخبرية للوصول للحقيقة',
    color: '#34c759',
  },
  {
    id: 'behavioral',
    icon: '🧠',
    name: 'المحقق السلوكي',
    description: 'استجواب المشتبه بهم وتحليل أنماط السلوك والدوافع',
    color: '#f5a623',
  },
];

export const WaitingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  // Optimized selectors to prevent unnecessary re-renders
  const currentRoom = useGameStore((s) => s.currentRoom);
  const playerId = useGameStore((s) => s.playerId);
  const mode = useGameStore((s) => s.mode);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  const isSolo = mode === 'solo';
  const room = currentRoom;
  const players = (room?.players ?? []) as PlayerInfo[];
  const isHost = players.find((p: PlayerInfo) => p.playerId === playerId)?.isHost ?? false;

  const handleSelectSpecialty = (specialty: Specialty) => {
    if (!room) return;
    wsService.send('SELECT_SPECIALTY', { roomId: room.roomId, specialty });
  };

  const handleStartGame = () => {
    if (!room) return;
    wsService.send('START_GAME', { roomId: room.roomId });
  };


  // Listen for game start
  React.useEffect(() => {
    const unsub = wsService.on('GAME_STARTED', () => {
      if (room) {
        navigate(`/game/${room.roomId.replace('#', '')}`);
      }
    });
    return unsub;
  }, [room, navigate]);

  const handleLeaveRoom = () => {
    useGameStore.getState().leaveRoom();
    navigate('/lobby');
  };

  return (
    <div className="waiting-container">
      {/* Header */}
      <header className="waiting-header">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>غرفة الانتظار</h2>
          <div className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            ROOM {room?.roomId ?? `#${roomId}`} {' // '} WAITING FOR INVESTIGATORS
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: isCompactLayout ? 'stretch' : 'center', gap: '1rem',
          flexDirection: isCompactLayout ? 'column-reverse' : 'row',
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {players.length} / 3 محققين جاهزين
          </span>
          <button className="btn" onClick={handleLeaveRoom}
            style={{ fontSize: '0.8rem', width: isCompactLayout ? '100%' : 'auto' }}>
            ← رجوع
          </button>
        </div>
      </header>

      {/* Specialty Seats */}
      <main className="waiting-main">
        {SPECIALTIES.map((spec) => {
          const occupant = players.find((p: PlayerInfo) => p.specialty === spec.id);
          const isMine = occupant?.playerId === playerId;
          const isTaken = !!occupant && !isMine;
          const isOpen = !occupant;

          return (
            <div
              key={spec.id}
              onClick={() => isOpen && handleSelectSpecialty(spec.id)}
              className="specialty-card"
              style={{
                borderColor: isMine ? 'var(--state-success)' : isTaken ? 'var(--thread-link)' : 'var(--border-window)',
                cursor: isOpen ? 'pointer' : 'default',
                opacity: isTaken ? 0.7 : 1,
                boxShadow: isMine ? `0 0 20px ${spec.color}33` : 'none',
                padding: isCompactLayout ? '1.2rem 1rem' : undefined,
              }}
            >
              <span style={{ fontSize: '3rem' }}>{spec.icon}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: spec.color }}>
                {spec.name}
              </h3>
              <p style={{
                fontSize: isCompactLayout ? '0.76rem' : '0.8rem', color: 'var(--text-secondary)',
                textAlign: 'center', lineHeight: 1.5,
              }}>
                {spec.description}
              </p>

              <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
                {isMine && (
                  <div style={{
                    padding: '0.5rem', background: 'rgba(52,199,89,0.15)',
                    borderRadius: '6px', fontSize: '0.85rem',
                    color: 'var(--state-success)', fontWeight: 600,
                  }}>
                    ✓ مقعدك
                  </div>
                )}
                {isTaken && (
                  <div style={{
                    padding: '0.5rem', background: 'rgba(255,59,48,0.15)',
                    borderRadius: '6px', fontSize: '0.85rem',
                    color: 'var(--thread-link)',
                  }}>
                    🔒 {occupant!.name}
                  </div>
                )}
                {isOpen && (
                  <div style={{
                    padding: '0.5rem', border: '1px dashed var(--border-window)',
                    borderRadius: '6px', fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>
                    متاح — اضغط للجلوس
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Actions */}
      <footer className="waiting-footer">
        {isHost ? (
          <button className="btn" onClick={handleStartGame}
            style={{
              padding: '0.75rem 2rem',
              background: isSolo ? 'var(--interaction-cool)' : 'var(--state-success)',
              color: '#fff',
              border: `1px solid ${isSolo ? 'var(--interaction-cool)' : 'var(--state-success)'}`,
              fontSize: '1rem', fontWeight: 600,
              width: isCompactLayout ? '100%' : 'auto',
            }}>
            {isSolo ? 'ابدأ Solo ←' : 'ابدأ القضية ←'}
          </button>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            في انتظار المضيف لبدء القضية...
          </div>
        )}
      </footer>
    </div>
  );
};
