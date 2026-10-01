import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useProfileStore } from '../stores/profileStore';
import { wsService } from '../services/websocket';

export function useRoomAutoRejoin(roomId: string | undefined): void {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const mode = useGameStore((s) => s.mode);
  const connected = useGameStore((s) => s.connected);
  const setPlayerId = useGameStore((s) => s.setPlayerId);

  useEffect(() => {
    if (!profile) {
      navigate('/profile');
      return;
    }

    let unsubConnected: (() => void) | null = null;
    // Auto-rejoin if we have a roomId but no currentRoom (page refresh scenario)
    const shouldAutoRejoin = !currentRoom && roomId;

    if (shouldAutoRejoin) {
      console.log('[AutoRejoin] Attempting to rejoin room:', roomId);
      setPlayerId(profile.playerId);

      const doJoin = () => {
        console.log('[AutoRejoin] Sending JOIN_ROOM request');
        wsService.send('JOIN_ROOM', {
          roomId: `#${roomId.replace('#', '')}`,
          player: {
            playerId: profile.playerId,
            name: profile.name,
            avatarId: profile.avatarId,
            specialty: null, // Will be restored from server
            isHost: false, // Will be restored from server
          },
        });
      };

      if (!connected) {
        console.log('[AutoRejoin] Not connected, establishing WebSocket connection...');
        if (!wsService.isConnecting) {
          wsService.connect(`ws://${window.location.hostname}:3001`);
        }
        unsubConnected = wsService.on('_connected', () => {
          if (unsubConnected) {
            unsubConnected();
          }
          doJoin();
        });
      } else {
        doJoin();
      }
    }

    return () => {
      if (unsubConnected) {
        unsubConnected();
      }
    };
  }, [profile, currentRoom, roomId, mode, connected, navigate, setPlayerId]);
}
