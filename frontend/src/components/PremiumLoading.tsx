/**
 * Premium Loading Component
 * Advanced skeleton loaders and animations
 */

import React from 'react';
import '../styles/PremiumLoading.css';

interface PremiumLoadingProps {
  type?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const PremiumLoading: React.FC<PremiumLoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  text,
  className = '',
}) => {
  return (
    <div className={`premium-loading loading-${size} ${className}`}>
      {type === 'spinner' && (
        <div className="spinner-container">
          <div className="spinner" />
          {text && <p className="loading-text">{text}</p>}
        </div>
      )}

      {type === 'dots' && (
        <div className="dots-container">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          {text && <p className="loading-text">{text}</p>}
        </div>
      )}

      {type === 'bars' && (
        <div className="bars-container">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          {text && <p className="loading-text">{text}</p>}
        </div>
      )}

      {type === 'pulse' && (
        <div className="pulse-container">
          <div className="pulse-circle" />
          {text && <p className="loading-text">{text}</p>}
        </div>
      )}

      {type === 'skeleton' && (
        <div className="skeleton-container">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text skeleton-short" />
        </div>
      )}
    </div>
  );
};

export default PremiumLoading;
