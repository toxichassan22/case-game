import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../stores/profileStore';
import { useGameStore, type RoomInfo, type PlayerInfo } from '../stores/gameStore';
import { wsService } from '../services/websocket';
import { useWindowSize } from '../hooks/useWindowSize';
import { Search, Plus, Wifi, WifiOff, Play, Users } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import './Lobby.css';


const WS_URL = `ws://${window.location.hostname}:3001`;

function getRoomRoute(room: RoomInfo): string {
  const slug = room.roomId.replace('#', '');
  if (room.phase === 'tribunal') {
    return `/tribunal/${slug}`;
  }
  if (room.phase === 'results') {
    return `/results/${slug}`;
  }
  if (room.phase === 'investigating') {
    return `/game/${slug}`;
  }
  return `/room/${slug}`;
}

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  // Optimized selectors to prevent unnecessary re-renders
  const setMode = useGameStore((s) => s.setMode);
  const setPlayerId = useGameStore((s) => s.setPlayerId);
  const connected = useGameStore((s) => s.connected);
  const { isMobile: isCompactLayout } = useWindowSize();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteRoom, setPendingDeleteRoom] = useState<RoomInfo | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const volatileUnsubs = React.useRef<Array<() => void>>([]);
  const pendingActionKeyRef = React.useRef<string | null>(null);

  const beginPendingAction = React.useCallback((key: string): boolean => {
    if (pendingActionKeyRef.current) {
      return false;
    }
    pendingActionKeyRef.current = key;
    setPendingActionKey(key);
    return true;
  }, []);

  const clearPendingAction = React.useCallback(() => {
    pendingActionKeyRef.current = null;
    setPendingActionKey(null);
  }, []);

  // Cleanup volatile listeners
  useEffect(() => {
    return () => {
      volatileUnsubs.current.forEach(u => u());
      volatileUnsubs.current = [];
    };
  }, []);


  // Redirect if no profile
  useEffect(() => {
    if (!profile) {
      navigate('/profile');
    } else {
      useProfileStore.getState().ensurePlayerId();
    }
  }, [profile, navigate]);

  // WebSocket subscription for lobby updates
  useEffect(() => {
    if (!profile?.playerId) return;

    const doJoinLobby = () => {
      wsService.send('JOIN_LOBBY', { playerId: profile.playerId });
    };

    if (connected) {
      doJoinLobby();
    } else {
      wsService.connect(WS_URL);
      const unsubConn = wsService.on('_connected', () => {
        unsubConn();
        doJoinLobby();
      });
    }

    const unsubLobby = wsService.on('LOBBY_UPDATE', (payload: { allRooms: RoomInfo[], activeRooms: RoomInfo[] }) => {
      setRooms(payload.allRooms);
      setActiveRooms(payload.activeRooms);
      setScanning(false);
      setError(null);
    });

    const unsubErr = wsService.on('ERROR', (payload: { message: string }) => {
      clearPendingAction();
      setError(payload.message);
    });

    const joinRoom = useGameStore.getState().joinRoom;
    const currentRoom = useGameStore.getState().currentRoom;

    if (connected && !currentRoom && profile?.playerId) {
      const savedRoomId = localStorage.getItem('investigation_active_room_id');
      const savedPlayerId = localStorage.getItem('investigation_active_player_id');
      
      if (savedRoomId && savedPlayerId && profile.playerId === savedPlayerId) {
        console.log('[Lobby] Attempting auto-rejoin to:', savedRoomId);
        
        const player: PlayerInfo = {
            playerId: savedPlayerId,
            name: profile.name,
            avatarId: profile.avatarId,
            specialty: null,
            isHost: false 
        };
        joinRoom(savedRoomId, player);
      }
    }

    return () => {
      if (unsubLobby) unsubLobby();
      if (unsubErr) unsubErr();
      if (connected) {
        wsService.send('LEAVE_LOBBY', { playerId: profile.playerId });
      }
    };
  }, [profile, connected, clearPendingAction]);



  const handleCreateRoom = () => {
    if (!profile?.playerId || !beginPendingAction('create-room')) return;
    const playerId = profile.playerId;
    setPlayerId(playerId);
    setMode('multiplayer');

    const doCreate = () => {
      wsService.send('CREATE_ROOM', {
        player: {
          playerId,
          name: profile.name,
          avatarId: profile.avatarId,
          specialty: null,
          isHost: true,
        },
      });
    };

    if (useGameStore.getState().connected) {
      doCreate();
    } else {
      wsService.connect(WS_URL);
      const unsub = wsService.on('_connected', () => {
        unsub();
        doCreate();
      });
    }

    const unsubRoom = wsService.on('ROOM_CREATED', (payload: { room: RoomInfo }) => {
      unsubRoom();
      volatileUnsubs.current = volatileUnsubs.current.filter(u => u !== unsubRoom);
      clearPendingAction();
      navigate(`/room/${payload.room.roomId.replace('#', '')}`);
    });
    volatileUnsubs.current.push(unsubRoom);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!profile?.playerId || !beginPendingAction(`join:${roomId}`)) return;
    const playerId = profile.playerId;
    setPlayerId(playerId);
    setMode('multiplayer');

    const doJoin = () => {
      wsService.send('JOIN_ROOM', {
        roomId,
        player: {
          playerId,
          name: profile.name,
          avatarId: profile.avatarId,
          specialty: null,
          isHost: false,
        },
      });
    };

    if (useGameStore.getState().connected) {
      doJoin();
    } else {
      wsService.connect(WS_URL);
      const unsub = wsService.on('_connected', () => {
        unsub();
        doJoin();
      });
    }

    const unsubRoom = wsService.on('ROOM_JOINED', () => {
      unsubRoom();
      volatileUnsubs.current = volatileUnsubs.current.filter(u => u !== unsubRoom);
      clearPendingAction();
      navigate(`/room/${roomId.replace('#', '')}`);
    });
    volatileUnsubs.current.push(unsubRoom);
  };

  const handleResumeRoom = (room: RoomInfo) => {
    if (!profile?.playerId || !beginPendingAction(`resume:${room.roomId}`)) return;
    const playerId = profile.playerId;
    setPlayerId(playerId);
    setMode(room.isSolo ? 'solo' : 'multiplayer');

    const doResume = () => {
      wsService.send('JOIN_ROOM', {
        roomId: room.roomId,
        player: {
          playerId,
          name: profile.name,
          avatarId: profile.avatarId,
          specialty: null,
          isHost: false, // For joining active room, it relies on returning logic
        },
      });
    };

    if (useGameStore.getState().connected) {
      doResume();
    } else {
      wsService.connect(WS_URL);
      const unsub = wsService.on('_connected', () => {
        unsub();
        doResume();
      });
    }

    const unsubStart = wsService.on('GAME_STARTED', (payload: { room: RoomInfo }) => {
      unsubStart();
      volatileUnsubs.current = volatileUnsubs.current.filter(u => u !== unsubStart);
      clearPendingAction();
      navigate(getRoomRoute(payload.room));
    });
    volatileUnsubs.current.push(unsubStart);

    const unsubErr = wsService.on('ERROR', (payload: { message: string }) => {
      unsubErr();
      volatileUnsubs.current = volatileUnsubs.current.filter(u => u !== unsubErr);
      clearPendingAction();
      setError(payload.message);
    });
    volatileUnsubs.current.push(unsubErr);
  };

  const handleStartSolo = () => {
    if (!profile?.playerId || !beginPendingAction('start-solo')) return;
    const playerId = profile.playerId;
    setPlayerId(playerId);
    setMode('solo');

    const doStartSolo = () => {
      wsService.send('START_SOLO', {
        player: {
          playerId,
          name: profile.name,
          avatarId: profile.avatarId,
          specialty: null,
          isHost: true,
        },
      });
    };

    if (useGameStore.getState().connected) {
      doStartSolo();
    } else {
      wsService.connect(WS_URL);
      const unsub = wsService.on('_connected', () => {
        unsub();
        doStartSolo();
      });
    }

    const unsubStart = wsService.on('GAME_STARTED', (payload: { room: RoomInfo }) => {
      unsubStart();
      volatileUnsubs.current = volatileUnsubs.current.filter(u => u !== unsubStart);
      clearPendingAction();
      navigate(`/game/${payload.room.roomId.replace('#', '')}`);
    });
    volatileUnsubs.current.push(unsubStart);

    const unsubErr = wsService.on('ERROR', (payload: { message: string }) => {
      unsubErr();
      volatileUnsubs.current = volatileUnsubs.current.filter(u => u !== unsubErr);
      clearPendingAction();
      setError(payload.message);
    });
    volatileUnsubs.current.push(unsubErr);
  };

  if (!profile) return null;

  const avatarEmoji = {
    detective: '🕵️', forensic: '🔬', analyst: '🧠',
    agent: '👤', hacker: '💻', observer: '👁️',
  }[profile.avatarId] ?? '👤';
  const actionPending = pendingActionKey !== null;

  return (
    <div className="lobby-container">
      {pendingDeleteRoom && (
        <ConfirmationModal
          title="حذف الحفظ الحالي"
          message={
            <div>
              <p>هل أنت متأكد من رغبتك في حذف وحفظ هذه القضية؟</p>
              <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>سيتم إغلاق هذه الغرفة من قائمتك الحالية مع الاحتفاظ بالحفظ لدى الخادم عند الحاجة.</p>
            </div>
          }
          type="danger"
          confirmLabel="حذف من القائمة"
          cancelLabel="تراجع"
          onConfirm={() => {
            wsService.send('LEAVE_ROOM', { roomId: pendingDeleteRoom.roomId });
            setActiveRooms(prev => prev.filter(r => r.roomId !== pendingDeleteRoom.roomId));
            setPendingDeleteRoom(null);
          }}
          onCancel={() => setPendingDeleteRoom(null)}
        />
      )}
      {/* Profile Bar */}
      <header className="lobby-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: isCompactLayout ? '100%' : 'auto' }}>
          <span style={{ fontSize: '1.5rem' }}>{avatarEmoji}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{profile.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {profile.stats.totalGames > 0
                ? `${profile.stats.casesSolved} قضية | نسبة النجاح ${profile.stats.winRate}%`
                : 'محقق جديد'}
            </div>
          </div>
        </div>
        <div className="mono-text" style={{
          fontSize: '0.7rem', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {connected ? <Wifi size={14} color="var(--state-success)" /> : <WifiOff size={14} color="var(--text-secondary)" />}
        </div>
      </header>

      {/* Main Content */}
      <main className="lobby-main">
        {/* Room List Header */}
        <div className="lobby-top-controls" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isCompactLayout ? 'stretch' : 'center',
          gap: isCompactLayout ? '0.85rem' : '1rem',
          flexDirection: isCompactLayout ? 'column' : 'row',
          marginBottom: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              غرف متاحة على الشبكة
            </h2>
            <div className="mono-text" style={{
              fontSize: '0.7rem',
              color: scanning ? 'var(--interaction-cool)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {scanning && <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--interaction-cool)',
                animation: 'pulse 1.5s infinite',
              }} />}
              {scanning ? '● SCANNING LAN...' : `● ${rooms.length} ROOMS FOUND`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isCompactLayout ? 'column' : 'row' }}>
            <button className="btn" onClick={handleStartSolo}
              disabled={actionPending}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                width: isCompactLayout ? '100%' : 'auto',
                opacity: actionPending ? 0.7 : 1,
                cursor: actionPending ? 'not-allowed' : 'pointer',
              }}>
              <Play size={14} /> {pendingActionKey === 'start-solo' ? 'جارٍ بدء Solo...' : 'ابدأ Solo'}
            </button>
            <button className="btn" onClick={handleCreateRoom}
              disabled={actionPending}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'var(--interaction-cool)', color: '#fff',
                border: '1px solid var(--interaction-cool)',
                width: isCompactLayout ? '100%' : 'auto',
                opacity: actionPending ? 0.7 : 1,
                cursor: actionPending ? 'not-allowed' : 'pointer',
              }}>
              <Plus size={14} /> {pendingActionKey === 'create-room' ? 'جارٍ إنشاء الغرفة...' : 'إنشاء غرفة جديدة'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Active Rooms */}
        {activeRooms.filter(r => r.isSolo || r.players.find(p => p.playerId === profile?.playerId)?.isHost).length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--state-success)' }}>
              قضايا قيد التحقيق ({activeRooms.filter(r => r.isSolo || r.players.find(p => p.playerId === profile?.playerId)?.isHost).length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeRooms
                .filter(room => room.isSolo || room.players.find(p => p.playerId === profile?.playerId)?.isHost)
                .map((room) => {
                  const canResume = room.isSolo || room.playerCount > 1;
                  return (
                <div key={`active-${room.roomId}`} 
                  className={`active-room-card ${!canResume ? 'disabled' : ''}`}
                  onClick={() => canResume && !actionPending && handleResumeRoom(room)}
                  style={{
                    display: 'flex',
                    flexDirection: isCompactLayout ? 'column' : 'row',
                    alignItems: isCompactLayout ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isCompactLayout ? '0.75rem' : '1rem',
                    opacity: actionPending ? 0.7 : 1,
                    cursor: canResume && !actionPending ? 'pointer' : 'default',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {room.caseName}
                      <span style={{
                        fontSize: '0.7rem', color: '#fff', fontWeight: 'bold',
                        background: room.isSolo ? 'rgba(77, 163, 255, 0.4)' : 'rgba(167, 139, 250, 0.4)',
                        border: `1px solid ${room.isSolo ? 'rgba(77, 163, 255, 0.8)' : 'rgba(167, 139, 250, 0.8)'}`,
                        padding: '2px 6px', borderRadius: '4px'
                      }}>
                        {room.isSolo ? '👤 لعب فردي' : `👥 فريق (${room.playerCount})`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {room.isSolo ? null : <span>المضيف: {room.hostName}</span>}
                      <span className="mono-text" style={{ opacity: 0.8, marginLeft: room.isSolo ? 0 : '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '4px' }}>كود الغرفة: {room.roomId}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: isCompactLayout ? 'column' : 'row' }}>
                    <button 
                      className="btn" 
                      style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.3)', padding: '0.4rem 0.8rem', width: isCompactLayout ? '100%' : 'auto' }}
                      disabled={actionPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteRoom(room);
                      }}
                      title="حذف الحفظ"
                    >
                      حذف
                    </button>
                    <button 
                      className="btn" 
                      style={{ 
                        background: canResume ? 'var(--state-success)' : 'var(--interaction-cool)', 
                        color: canResume ? '#fff' : 'rgba(255,255,255,0.5)', 
                        border: 'none', 
                        padding: '0.4rem 1rem',
                        cursor: canResume && !actionPending ? 'pointer' : 'not-allowed',
                        width: isCompactLayout ? '100%' : 'auto',
                        opacity: actionPending ? 0.7 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canResume && !actionPending) {
                          handleResumeRoom(room);
                        }
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={!canResume || actionPending}
                      title={!canResume ? 'لا يمكنك استكمال فريق بمفردك. يتطلب وجود الفريق.' : ''}
                    >
                      {!canResume ? 'بانتظار الفريق...' : (pendingActionKey === `resume:${room.roomId}` ? 'جارٍ الفتح...' : 'متابعة الفتح ←')}
                    </button>
                  </div>
                </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Room Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rooms.map((room) => (
            <div key={room.roomId} 
              className="room-card"
              onClick={() => !actionPending && handleJoinRoom(room.roomId)}
              style={{
                display: 'flex',
                flexDirection: isCompactLayout ? 'column' : 'row',
                alignItems: isCompactLayout ? 'flex-start' : 'center',
                gap: isCompactLayout ? '0.75rem' : '1rem',
                opacity: actionPending ? 0.7 : 1,
                cursor: actionPending ? 'not-allowed' : 'pointer',
                pointerEvents: actionPending ? 'none' : 'auto',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {room.hostName}
                  <span className="mono-text" style={{
                    fontSize: '0.7rem', color: 'var(--text-secondary)',
                    marginRight: '0.5rem',
                  }}>
                    {room.roomId}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {room.caseName}
                </div>
                {/* Specialty Slots */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {(['timeline', 'forensics', 'behavioral'] as const).map((spec) => {
                    const taken = room.players.some(p => p.specialty === spec);
                    return (
                      <span key={spec} style={{
                        fontSize: '0.65rem', padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: taken ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)',
                        color: taken ? 'var(--thread-link)' : 'var(--state-success)',
                        border: `1px solid ${taken ? 'rgba(255,59,48,0.3)' : 'rgba(52,199,89,0.3)'}`,
                      }}>
                        {spec === 'timeline' ? '⏱️' : spec === 'forensics' ? '🔬' : '🧠'}{' '}
                        {taken ? 'مأخوذ' : 'متاح'}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: isCompactLayout ? 'flex-end' : 'center' }}>
                <Users size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.9rem' }}>{room.playerCount}/{room.maxPlayers}</span>
              </div>
            </div>
          ))}

          {!scanning && rooms.length === 0 && !error && (
            <div style={{
              textAlign: 'center', padding: isCompactLayout ? '2rem 1rem' : '3rem',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
            }}>
              <Search size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>لا توجد غرف متاحة</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                أنشئ غرفة جديدة أو العب Solo
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
