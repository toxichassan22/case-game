import React from 'react';
import { Clock, Microscope, Brain } from 'lucide-react';

interface RouteProgressProps {
  timelineProgress: number;
  forensicsProgress: number;
  behavioralProgress: number;
}

export const RouteProgress: React.FC<RouteProgressProps> = ({
  timelineProgress,
  forensicsProgress,
  behavioralProgress
}) => {
  const routes = [
    {
      name: 'المسار الزمني',
      icon: Clock,
      progress: timelineProgress,
      color: '#4299e1',
      bgColor: 'rgba(66, 153, 225, 0.2)'
    },
    {
      name: 'المسار الجنائي',
      icon: Microscope,
      progress: forensicsProgress,
      color: '#48bb78',
      bgColor: 'rgba(72, 187, 120, 0.2)'
    },
    {
      name: 'المسار السلوكي',
      icon: Brain,
      progress: behavioralProgress,
      color: '#ed8936',
      bgColor: 'rgba(237, 137, 54, 0.2)'
    }
  ];

  return (
    <div
      style={{
        background: 'rgba(26, 32, 44, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px'
      }}
    >
      <h4 style={{ 
        margin: '0 0 12px 0', 
        color: '#e2e8f0',
        fontSize: '13px',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        تقدم المسارات
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {routes.map(route => {
          const Icon = route.icon;
          const progress = Math.min(100, Math.max(0, route.progress));
          
          return (
            <div key={route.name}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: route.color,
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  <Icon size={14} />
                  <span>{route.name}</span>
                </div>
                <span style={{ 
                  color: route.color,
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {progress}%
                </span>
              </div>
              
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${route.color}cc, ${route.color})`,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease-out',
                    boxShadow: `0 0 8px ${route.color}60`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Balance indicator */}
      <div style={{ 
        marginTop: '12px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '10px',
        color: '#718096',
        textAlign: 'center'
      }}>
        {Math.abs(timelineProgress - forensicsProgress) < 20 && 
         Math.abs(forensicsProgress - behavioralProgress) < 20 ? (
          <span style={{ color: '#48bb78' }}>✓ تحقيق متوازن</span>
        ) : (
          <span>💡 حاول استكشاف مسارات أخرى</span>
        )}
      </div>
    </div>
  );
};

export default RouteProgress;
