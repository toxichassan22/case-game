import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  type?: 'evidence' | 'interrogation' | 'briefing';
  /** Renders a slim single-row player for cramped contexts like interrogation headers */
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  title = 'تسجيل صوتي',
  type = 'evidence',
  compact = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeColors = {
    evidence: { primary: '#3b82f6', secondary: '#1e40af', glow: 'rgba(59, 130, 246, 0.4)' },
    interrogation: { primary: '#ef4444', secondary: '#991b1b', glow: 'rgba(239, 68, 68, 0.4)' },
    briefing: { primary: '#10b981', secondary: '#047857', glow: 'rgba(16, 185, 129, 0.4)' },
  };

  const colors = typeColors[type];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      // Only update currentTime if duration is valid and currentTime doesn't exceed it
      if (audio.duration && !isNaN(audio.duration)) {
        const cappedTime = Math.min(audio.currentTime, audio.duration);
        setCurrentTime(cappedTime);
      }
    };
    const updateDuration = () => {
      const dur = audio.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        // If currentTime somehow exceeds duration, cap it
        setCurrentTime(prev => Math.min(prev, dur));
      }
    };
    const handleLoaded = () => {
      setIsLoading(false);
      // Ensure we have the correct duration immediately
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleReady = () => setIsLoading(false); // ✅ Audio resumed playback
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('فشل تحميل الملف الصوتي. يمكنك متابعة التحقيق من النص المكتوب.');
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoading(false);
    };
    const handleLoadedMetadata = () => {
      // Get duration as soon as metadata is loaded
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadeddata', handleLoaded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handleReady);  // ✅ Fired when playback starts after buffering
    audio.addEventListener('canplay', handleReady);  // ✅ Fired when enough data is loaded
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    
    // Initialize duration if already available
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadeddata', handleLoaded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handleReady);   // ✅ Cleanup
      audio.removeEventListener('canplay', handleReady);   // ✅ Cleanup
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setError(null);
      audio.play().catch(err => {
        console.error('Playback error:', err);
        setError('تعذر تشغيل الصوت');
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  }, []);

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  // ✅ Simple percentage - let CSS handle the offset
  const progressPercent = Math.min(100, Math.max(0, progress));

  if (compact) {
    return (
      <div className="audio-compact" dir="ltr">
        <audio ref={audioRef} src={src} preload="metadata" />
        <button
          className="audio-compact-play"
          onClick={togglePlay}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          style={{ background: colors.primary }}
        >
          {isPlaying ? <Pause size={11} color="#fff" /> : <Play size={11} color="#fff" style={{ marginLeft: '1px' }} />}
        </button>
        <span className="audio-compact-title" dir="rtl" title={title}>🎙️ {title}</span>
        <input
          type="range"
          className="audio-compact-range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          aria-label="شريط التقدم"
          style={{
            background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${progressPercent}%, rgba(148, 163, 184, 0.18) ${progressPercent}%, rgba(148, 163, 184, 0.18) 100%)`,
          }}
        />
        <span className="audio-compact-time">
          {formatTime(currentTime)} / {duration && !isNaN(duration) && isFinite(duration) ? formatTime(duration) : '0:00'}
        </span>
        <button className="audio-compact-mute" onClick={toggleMute} title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'} aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}>
          {isMuted || volume === 0 ? <VolumeX size={12} color="#94a3b8" /> : <Volume2 size={12} color="#94a3b8" />}
        </button>
        {error && <span className="audio-compact-error" title={error}>⚠️</span>}
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
      borderRadius: '16px',
      padding: '1.25rem',
      border: `2px solid ${colors.primary}`,
      boxShadow: `0 8px 32px ${colors.glow}, 0 2px 8px rgba(0, 0, 0, 0.6)`,
      position: 'relative',
      overflow: 'hidden',
      direction: 'rtl',  // Support RTL for Arabic text
    }}>
      {/* Animated background waves */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, ${colors.glow} 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, ${colors.glow} 0%, transparent 50%)
        `,
        opacity: isPlaying ? 0.3 : 0.1,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />

      {/* Title */}
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: colors.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ fontSize: '1.2rem' }}>🎙️</span>
        <span>{title}</span>
        {isPlaying && (
          <div style={{
            display: 'flex',
            gap: '2px',
            marginLeft: 'auto',
          }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: `${10 + i * 3}px`,
                  background: colors.primary,
                  borderRadius: '2px',
                  animation: `audioWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.75rem',
          color: '#fca5a5',
          position: 'relative',
          zIndex: 1,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        marginBottom: '1rem',
        direction: 'ltr', // إجبار الشريط بالكامل يكون من اليسار لليمين عشان يطابق الألوان والوقت
      }}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            // ✅ Use simple percentage for smooth updates
            background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${progressPercent}%, rgba(148, 163, 184, 0.2) ${progressPercent}%, rgba(148, 163, 184, 0.2) 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#94a3b8',
          marginTop: '0.25rem',
          fontFamily: 'monospace',
          direction: 'ltr', 
        }}>
          {/* الرقم اللي على الشمال: الوقت المنقضي */}
          <span>{formatTime(currentTime)}</span>
          
          {/* الرقم اللي على اليمين: المدة الإجمالية الثابتة للمقطع */}
          <span>
            {duration && !isNaN(duration) && isFinite(duration) 
              ? formatTime(duration)
              : '0:00'
            }
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        position: 'relative',
        zIndex: 1,
        direction: 'ltr',  // Force LTR for controls to maintain correct order
      }}>
        {/* Skip back */}
        <button
          onClick={() => skip(-10)}
          style={{
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="رجوع 10 ثواني"
        >
          <SkipBack size={16} color="#94a3b8" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLoading ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: `0 4px 16px ${colors.glow}`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 6px 24px ${colors.glow}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${colors.glow}`;
          }}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isLoading ? (
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : isPlaying ? (
            <Pause size={24} color="white" />
          ) : (
            <Play size={24} color="white" style={{ marginLeft: '2px' }} />
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={() => skip(10)}
          style={{
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="تقديم 10 ثواني"
        >
          <SkipForward size={16} color="#94a3b8" />
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Volume control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.75rem',
          background: 'rgba(148, 163, 184, 0.05)',
          borderRadius: '24px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
            }}
            title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} color="#94a3b8" />
            ) : volume < 0.5 ? (
              <Volume2 size={18} color="#94a3b8" />
            ) : (
              <Volume2 size={20} color={colors.primary} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{
              width: '100px',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${(isMuted ? 0 : volume) * 100}%, rgba(148, 163, 184, 0.15) ${(isMuted ? 0 : volume) * 100}%, rgba(148, 163, 184, 0.15) 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              transition: 'all 0.2s',
            }}
          />
          <span style={{
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            color: '#94a3b8',
            minWidth: '32px',
            textAlign: 'center',
            fontWeight: 600,
          }}>
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes audioWave {
          0% { height: 8px; }
          100% { height: 20px; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Progress bar (time) slider - SMOOTH */
        input[type="range"]:first-of-type {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          /* Use will-change for smoother updates */
          will-change: background;
        }
        
        input[type="range"]:first-of-type::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          /* Slightly larger thumb to cover any gap */
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${colors.primary};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          /* Only transition transform for smooth scale on hover */
          transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
        }
        input[type="range"]:first-of-type::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.6);
        }
        input[type="range"]:first-of-type::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${colors.primary};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
        }
        input[type="range"]:first-of-type::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.6);
        }
        
        /* Volume slider - SMOOTH */
        input[type="range"]:last-of-type::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          /* Only transition transform for smooth scale */
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]:last-of-type::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 12px ${colors.glow};
        }
        input[type="range"]:last-of-type::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]:last-of-type::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 12px ${colors.glow};
        }
      `}</style>
    </div>
  );
};
