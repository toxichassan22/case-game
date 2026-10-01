import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../stores/profileStore';

const AVATARS = [
  { id: 'detective', emoji: '🕵️', label: 'المحقق' },
  { id: 'forensic', emoji: '🔬', label: 'الجنائي' },
  { id: 'analyst', emoji: '🧠', label: 'المحلل' },
  { id: 'agent', emoji: '👤', label: 'العميل' },
  { id: 'hacker', emoji: '💻', label: 'المخترق' },
  { id: 'observer', emoji: '👁️', label: 'المراقب' },
];

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const setProfile = useProfileStore((s) => s.setProfile);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('detective');

  const handleConfirm = () => {
    if (!name.trim()) return;
    setProfile(name.trim(), selectedAvatar);
    navigate('/lobby');
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Status bar */}

        <h2 className="profile-title">
          تسجيل هوية المحقق
        </h2>
        <p className="profile-subtitle">
          اختر صورتك الرمزية وأدخل اسمك
        </p>

        {/* Avatar Grid */}
        <div className="avatar-grid">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`avatar-btn ${selectedAvatar === avatar.id ? 'selected' : ''}`}
            >
              <span style={{ fontSize: '2rem' }}>{avatar.emoji}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{avatar.label}</span>
            </button>
          ))}
        </div>

        {/* Name Input */}
        <div className="name-input-group">
          <label htmlFor="investigator-name" className="name-input-label">
            اسم المحقق
          </label>
          <input
            id="investigator-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك..."
            dir="rtl"
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="name-input"
          />
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!name.trim()}
          className={`start-btn ${name.trim() ? 'active' : 'disabled'}`}
        >
          تأكيد الهوية ←
        </button>
      </div>
    </div>
  );
};
