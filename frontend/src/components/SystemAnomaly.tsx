import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

interface UIAnomalyConfig {
  anomaly_id: string;
  trigger_flag: string;
  trigger_event: string;
  target_ui_element: string;
  effect_type: 'text_morph' | 'visual_glitch' | 'shadow_appearance' | 'audio_distortion';
  duration_ms: number;
  original_text?: string;
  morphed_text?: string;
  revert?: boolean;
  glitch_type?: string;
  severity?: string;
  description_text?: string;
  max_triggers_per_case?: number;
}

interface ActiveAnomaly {
  config: UIAnomalyConfig;
  startTime: number;
  isActive: boolean;
}

export const SystemAnomaly: React.FC = () => {
  const [activeAnomalies, setActiveAnomalies] = useState<ActiveAnomaly[]>([]);
  const [triggeredCount, setTriggeredCount] = useState<Record<string, number>>({});
  
  const snapshot = useGameStore((state) => state.engineSnapshot);
  const caseDefinition = useGameStore((state) => state.caseDefinition);
  
  const flags = snapshot?.flags || [];
  const uiAnomalies = caseDefinition?.hidden_systems?.ui_anomalies?.allowed_events || [];
  
  const triggerAnomaly = useCallback((anomaly: UIAnomalyConfig) => {
    const count = triggeredCount[anomaly.anomaly_id] || 0;
    const maxTriggers = anomaly.max_triggers_per_case || 1;
    
    if (count >= maxTriggers) return;
    
    setActiveAnomalies(prev => [...prev, {
      config: anomaly,
      startTime: Date.now(),
      isActive: true
    }]);
    
    setTriggeredCount(prev => ({
      ...prev,
      [anomaly.anomaly_id]: count + 1
    }));
    
    // Auto-deactivate after duration
    setTimeout(() => {
      setActiveAnomalies(prev => 
        prev.map(a => 
          a.config.anomaly_id === anomaly.anomaly_id 
            ? { ...a, isActive: false }
            : a
        )
      );
    }, anomaly.duration_ms);
  }, [triggeredCount]);
  
  // Check for trigger conditions
  useEffect(() => {
    uiAnomalies.forEach((anomaly: UIAnomalyConfig) => {
      const flagExists = flags.includes(anomaly.trigger_flag);
      
      if (flagExists && !activeAnomalies.find(a => a.config.anomaly_id === anomaly.anomaly_id)?.isActive) {
        triggerAnomaly(anomaly);
      }
    });
  }, [flags, uiAnomalies, activeAnomalies, triggerAnomaly]);
  
  // Render text morph anomaly
  const renderTextMorph = (anomaly: ActiveAnomaly) => {
    if (!anomaly.isActive || !anomaly.config.original_text || !anomaly.config.morphed_text) return null;
    
    const elapsed = Date.now() - anomaly.startTime;
    const progress = elapsed / anomaly.config.duration_ms;
    
    // Show morphed text for first half, then revert
    const showMorphed = anomaly.config.revert ? progress < 0.5 : true;
    const displayText = showMorphed ? anomaly.config.morphed_text : anomaly.config.original_text;
    
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: anomaly.isActive ? 1 : 0,
          transition: `opacity ${anomaly.config.duration_ms}ms ease-out`
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '20px 40px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            animation: 'glitch 0.3s infinite'
          }}
        >
          <p style={{ 
            color: showMorphed ? '#ff4444' : '#ffffff',
            fontFamily: 'monospace',
            fontSize: '18px',
            margin: 0,
            textShadow: showMorphed ? '2px 0 #00ffff, -2px 0 #ff00ff' : 'none'
          }}>
            {displayText}
          </p>
        </div>
      </div>
    );
  };
  
  // Render visual glitch anomaly
  const renderVisualGlitch = (anomaly: ActiveAnomaly) => {
    if (!anomaly.isActive) return null;
    
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: anomaly.isActive ? 0.3 : 0,
          transition: `opacity ${anomaly.config.duration_ms}ms ease-out`,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.1) 2px, rgba(255, 0, 0, 0.1) 4px)',
          animation: 'scanlines 0.1s infinite'
        }}
      />
    );
  };
  
  // Render shadow appearance anomaly
  const renderShadowAppearance = (anomaly: ActiveAnomaly) => {
    if (!anomaly.isActive) return null;
    
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '100px',
          height: '150px',
          pointerEvents: 'none',
          zIndex: 9997,
          opacity: anomaly.isActive ? 0.4 : 0,
          transition: `opacity ${anomaly.config.duration_ms / 2}ms ease-in-out`,
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(10px)',
          transform: 'translateY(-20px)'
        }}
      />
    );
  };
  
  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        
        @keyframes scanlines {
          0% { background-position: 0 0 }
          100% { background-position: 0 4px }
        }
        
        @keyframes shadow-fade {
          0% { opacity: 0; transform: translateY(-20px) }
          50% { opacity: 0.4; transform: translateY(0) }
          100% { opacity: 0; transform: translateY(-20px) }
        }
      `}</style>
      
      {/* Render active anomalies */}
      {activeAnomalies.map(anomaly => {
        switch (anomaly.config.effect_type) {
          case 'text_morph':
            return renderTextMorph(anomaly);
          case 'visual_glitch':
            return renderVisualGlitch(anomaly);
          case 'shadow_appearance':
            return renderShadowAppearance(anomaly);
          default:
            return null;
        }
      })}
    </>
  );
};

export default SystemAnomaly;
