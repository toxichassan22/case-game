import React from 'react';
import { ShieldAlert, Monitor, User } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import type { InboxMsg } from '../stores/gameStore';
import { AudioPlayer } from './AudioPlayer';
import './InboxMessage.css';

interface InboxMessageProps {
  message: InboxMsg;
  showHeader?: boolean;
  isBaseMessage?: boolean;
}

export const InboxMessage: React.FC<InboxMessageProps> = ({ 
  message, 
  showHeader = false,
  isBaseMessage = false 
}) => {
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const authoredBrief = typeof caseDefinition?.inbox_brief === 'object' && caseDefinition?.inbox_brief !== null
    ? caseDefinition.inbox_brief
    : null;
  const audioUrl = authoredBrief?.audio_url;

  const isPlayer = message.sender === 'player';
  const isForensics = message.sender === 'Forensics Hub';

  // 1. التصميم الخاص بالرسالة الافتتاحية (Main Directive)
  if (isBaseMessage) {
    return (
      <div className="inbox-main-directive">
        {showHeader && (
          <div className="msg-header">
            <div className="msg-sender-info">
              <div className="msg-icon-wrapper">
                <ShieldAlert size={20} />
              </div>
              <div className="msg-details">
                <h3 className="msg-sender-name">مكتب الرئيس</h3>
                <span className="msg-subject">قضية جديدة: {caseDefinition?.title}</span>
              </div>
            </div>
            <div className="msg-time">{message.time}</div>
          </div>
        )}

        <div className="msg-body">
          {audioUrl && (
            <div className="msg-audio-wrapper">
              <AudioPlayer 
                src={audioUrl} 
                title="توجيهات صوتية من رئاسة المباحث"
                type="briefing"
              />
            </div>
          )}
          <p className="msg-text">
            {message.text.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.text.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    );
  }

  // 2. التصميم الخاص بالردود وفقاعات الشات (Chat Bubbles)
  return (
    <div className={`inbox-bubble-wrapper ${isPlayer ? 'outgoing' : 'incoming'}`}>
      <div className="inbox-avatar">
        {isPlayer ? <User size={16} /> : isForensics ? <Monitor size={16} /> : <ShieldAlert size={16} />}
      </div>
      
      <div className="inbox-bubble">
        <div className="inbox-bubble-header">
          <span className="inbox-bubble-name">{message.senderName}</span>
          <span className="inbox-bubble-time">{message.time}</span>
        </div>
        <p className="inbox-bubble-text">
          {message.text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.text.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};
