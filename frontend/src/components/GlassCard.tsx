/**
 * Glass Morphism Card Component
 * Modern glass effect with backdrop blur
 */

import React from 'react';
import '../styles/GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
  hover = true,
  onClick,
}) => {
  return (
    <div
      className={`glass-card glass-${intensity} ${hover ? 'glass-hover' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};

export default GlassCard;
