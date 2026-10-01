import React from 'react';

interface PressureScoreProps {
  suspectName: string;
  currentPressure: number;
  collapseThreshold: number;
  lawyerUpThreshold: number;
  aggressionTolerance: number;
}

export const PressureScore: React.FC<PressureScoreProps> = ({
  suspectName,
  currentPressure,
  collapseThreshold,
  lawyerUpThreshold,
  aggressionTolerance
}) => {
  // Calculate pressure percentage (0-100)
  const pressurePercent = Math.min(100, Math.max(0, (currentPressure / Math.max(collapseThreshold, lawyerUpThreshold)) * 100));
  
  // Determine pressure level
  const getPressureLevel = () => {
    if (pressurePercent < 30) return { label: 'منخفض', color: '#48bb78', bgColor: 'rgba(72, 187, 120, 0.2)' };
    if (pressurePercent < 60) return { label: 'متوسط', color: '#ecc94b', bgColor: 'rgba(236, 201, 75, 0.2)' };
    if (pressurePercent < 80) return { label: 'عالي', color: '#ed8936', bgColor: 'rgba(237, 137, 54, 0.2)' };
    return { label: 'حرج', color: '#f56565', bgColor: 'rgba(245, 101, 101, 0.3)' };
  };
  
  const level = getPressureLevel();
  
  // Check thresholds
  const isNearCollapse = currentPressure >= collapseThreshold - 2;
  const isNearLawyerUp = currentPressure >= lawyerUpThreshold - 2;
  const isNearAggression = currentPressure >= aggressionTolerance - 1;
  
  return (
    <div
      style={{
        background: 'rgba(26, 32, 44, 0.95)',
        border: `1px solid ${level.color}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        boxShadow: `0 0 20px ${level.bgColor}`
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#e2e8f0',
          fontSize: '14px',
          fontWeight: 600
        }}>
          مؤشر الضغط: {suspectName}
        </h4>
        <span
          style={{
            background: level.bgColor,
            color: level.color,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            border: `1px solid ${level.color}`
          }}
        >
          {level.label}
        </span>
      </div>
      
      {/* Pressure Bar */}
      <div
        style={{
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pressurePercent}%`,
            background: `linear-gradient(90deg, ${level.color}dd, ${level.color})`,
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
            boxShadow: `0 0 10px ${level.color}80`
          }}
        />
        
        {/* Threshold markers */}
        {(collapseThreshold / Math.max(collapseThreshold, lawyerUpThreshold) * 100) <= 100 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${(collapseThreshold / Math.max(collapseThreshold, lawyerUpThreshold)) * 100}%`,
              height: '100%',
              width: '2px',
              background: '#f56565',
              boxShadow: '0 0 4px #f56565'
            }}
            title={`انهيار: ${collapseThreshold}`}
          />
        )}
        
        {(lawyerUpThreshold / Math.max(collapseThreshold, lawyerUpThreshold) * 100) <= 100 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${(lawyerUpThreshold / Math.max(collapseThreshold, lawyerUpThreshold)) * 100}%`,
              height: '100%',
              width: '2px',
              background: '#ed8936',
              boxShadow: '0 0 4px #ed8936'
            }}
            title={`محامي: ${lawyerUpThreshold}`}
          />
        )}
      </div>
      
      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        fontSize: '11px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a0aec0', marginBottom: '2px' }}>الضغط الحالي</div>
          <div style={{ color: level.color, fontWeight: 700, fontSize: '16px' }}>
            {currentPressure}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a0aec0', marginBottom: '2px' }}>حد الانهيار</div>
          <div style={{ color: '#f56565', fontWeight: 600, fontSize: '16px' }}>
            {collapseThreshold}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a0aec0', marginBottom: '2px' }}>حد المحامي</div>
          <div style={{ color: '#ed8936', fontWeight: 600, fontSize: '16px' }}>
            {lawyerUpThreshold}
          </div>
        </div>
      </div>
      
      {/* Warning indicators */}
      {(isNearCollapse || isNearLawyerUp || isNearAggression) && (
        <div
          style={{
            marginTop: '8px',
            padding: '6px',
            background: 'rgba(245, 101, 101, 0.1)',
            border: '1px solid rgba(245, 101, 101, 0.3)',
            borderRadius: '4px',
            fontSize: '11px'
          }}
        >
          <div style={{ color: '#fc8181', fontWeight: 600, marginBottom: '4px' }}>
            ⚠️ تحذير
          </div>
          <div style={{ color: '#fed7d7' }}>
            {isNearCollapse && '● المشتبه به على وشك الانهيار\n'}
            {isNearLawyerUp && '● المشتبه به قد يطلب محامي\n'}
            {isNearAggression && '● المشتبه به قد يرفض التعاون\n'}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '10px', 
        color: '#718096',
        textAlign: 'center'
      }}>
        الخط الأحمر = الانهيار | الخط البرتقالي = طلب محامي
      </div>
    </div>
  );
};

export default PressureScore;
