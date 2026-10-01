import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Send } from 'lucide-react';

const SPECIALTY_COLORS: Record<string, string> = {
  timeline: '#4da3ff',
  forensics: '#34c759',
  behavioral: '#f5a623',
};

export const TeamChatWindow: React.FC = () => {
  const [input, setInput] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);

  const chatMessages = useGameStore((s) => s.chatMessages);
  const sendChat = useGameStore((s) => s.sendChat);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const playerId = useGameStore((s) => s.playerId);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChat(input.trim());
    setInput('');
  };

  const players = currentRoom?.players || [];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg-window)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Team Members List */}
      <div style={{
        padding: '0.5rem', borderBottom: '1px solid var(--border-window)',
        display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {players.map((p) => {
          const specColor = SPECIALTY_COLORS[p.specialty || ''] || '#fff';
          const isMe = p.playerId === playerId;
          return (
            <div key={p.playerId} style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.5rem', borderRadius: '4px',
              background: 'var(--bg-primary)', border: `1px solid ${specColor}40`,
              fontSize: '0.75rem', opacity: isMe ? 1 : 0.8
            }}>
              <span style={{ color: specColor, fontWeight: 600 }}>
                {p.specialty === 'timeline' ? '⏱️' : p.specialty === 'forensics' ? '🔬' : p.specialty === 'behavioral' ? '🧠' : '👤'}
              </span>
              <span>{p.name} {isMe && '(أنت)'}</span>
            </div>
          );
        })}
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={{
        flex: 1, overflowY: 'auto', padding: '0.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.35rem',
      }}>
        {chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.75rem', marginTop: '2rem' }}>
            لا توجد رسائل بعد
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} style={{
            padding: '0.3rem 0.5rem',
            background: 'var(--bg-primary)',
            borderRadius: '4px',
            borderRight: `2px solid ${SPECIALTY_COLORS[msg.specialty ?? ''] ?? 'var(--border-window)'}`,
          }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 600,
              color: SPECIALTY_COLORS[msg.specialty ?? ''] ?? 'var(--text-secondary)',
              marginBottom: '0.15rem',
            }}>
              {msg.senderName}
            </div>
            <div style={{ fontSize: '0.8rem' }}>{msg.message}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '0.3rem', padding: '0.4rem',
        borderTop: '1px solid var(--border-window)',
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالة للفريق..."
          style={{
            flex: 1, padding: '0.4rem', borderRadius: '4px',
            border: '1px solid var(--border-window)',
            background: 'var(--bg-primary)', color: 'var(--text-primary)',
            fontSize: '0.8rem', fontFamily: 'var(--font-arabic)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            padding: '0.4rem 0.6rem', borderRadius: '4px',
            border: 'none', background: 'var(--interaction-cool)',
            color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed',
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
