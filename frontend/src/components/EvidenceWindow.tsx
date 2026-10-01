import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';
import './EvidenceWindow.css';

interface EvidenceWindowProps {
  id: string;
  title: string;
  type?: string;
  children?: React.ReactNode;
  onClose: (id: string) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  defaultPosition?: { x: number, y: number };
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  minTop?: number;
  maxWidth?: number;
  maxHeight?: number;
  boundsWidth?: number;
  boundsHeight?: number;
  docked?: boolean;
  toolFullscreen?: boolean;
  zIndex?: number;
  onFocus?: () => void;
}

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

function sanitizeTitle(title: string): string {
  if (typeof title !== 'string') return '';
  // Strip common HTML tags and dangerous characters
  return title
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>{}"']/g, '') // Strip special characters
    .trim();
}

const EvidenceWindowInner: React.FC<EvidenceWindowProps> = ({ 
  id, 
  title, 
  type,
  children, 
  onClose,
  onToggleFullscreen,
  isFullscreen = false,
  defaultPosition,
  defaultWidth = 400,
  defaultHeight = 500,
  minWidth = 300,
  minHeight = 300,
  minTop = 0,
  maxWidth,
  maxHeight,
  boundsWidth,
  boundsHeight,
  docked = false,
  toolFullscreen = false,
  zIndex = 20,
  onFocus,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const clampSize = useCallback((nextSize: { width: string | number; height: string | number }) => {
    const availableWidth = (maxWidth ?? boundsWidth ?? windowWidth) - 24;
    const availableHeight = (boundsHeight ?? windowHeight) - minTop - 12;

    return {
      width: Math.max(minWidth, Math.min(toNumber(nextSize.width), availableWidth)),
      height: Math.max(minHeight, Math.min(toNumber(nextSize.height), availableHeight)),
    };
  }, [boundsHeight, boundsWidth, maxWidth, minWidth, minHeight, minTop, windowWidth, windowHeight]);

  const clampPosition = useCallback((
    nextPosition: { x: number; y: number },
    nextSize: { width: number; height: number },
  ) => {
    const width = nextSize.width;
    const availableWidth = boundsWidth ?? windowWidth;
    const availableHeight = boundsHeight ?? windowHeight;
    
    const maxX = Math.max(0, availableWidth - width);
    const maxY = Math.max(minTop, availableHeight - 48); // Leave header visible at bottom

    return {
      x: Math.max(0, Math.min(nextPosition.x, maxX)),
      y: Math.max(minTop, Math.min(nextPosition.y, maxY)),
    };
  }, [boundsHeight, boundsWidth, minTop, windowWidth, windowHeight]);

  const [size, setSize] = useState<{ width: number, height: number }>(() =>
    clampSize({ width: defaultWidth, height: defaultHeight }),
  );
  const [position, setPosition] = useState(() => {
    const initialSize = clampSize({ width: defaultWidth, height: defaultHeight });
    const initialPos = defaultPosition || { x: windowWidth / 2 - 200, y: windowHeight / 2 - 250 };
    return clampPosition(initialPos, initialSize);
  });

  // Calculate effective clamped values for current render
  const effectiveSize = clampSize(size);
  const effectivePosition = clampPosition(position, effectiveSize);

  if (docked) {
    // Sidebar width for the inventory panel
    const sidebarWidth = 280;
    const isMobile = (boundsWidth ?? window.innerWidth) <= 768;
    
    // If toolFullscreen, fill from left edge to sidebar on desktop, full width on mobile
    const dockedWidth = toolFullscreen
      ? (isMobile ? (boundsWidth ?? window.innerWidth) : (boundsWidth ?? window.innerWidth) - sidebarWidth)
      : Math.max(minWidth, (boundsWidth ?? window.innerWidth) - 24);
    
    // For toolFullscreen with minTop=0, set height to 100% of workspace height
    const dockedHeight = toolFullscreen && minTop === 0
      ? (boundsHeight ?? window.innerHeight)
      : Math.max(minHeight, (boundsHeight ?? window.innerHeight) - minTop - (toolFullscreen ? 0 : 12));

    return (
      <div
        className={`evidence-rnd-wrapper evidence-rnd-docked window-type-${type || 'default'} ${toolFullscreen ? 'tool-fullscreen' : ''} window-appear`}
        style={{
          top: `${minTop}px`,
          left: '0px',
          width: isMobile ? '100%' : `${dockedWidth}px`,
          height: `${dockedHeight}px`,
          zIndex,
        }}
      >
        <style>{`
          @keyframes windowAppear {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .window-appear {
            animation: windowAppear 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>
        <div className="window-inner" onPointerDownCapture={onFocus}>
          <header className="window-header">
            <span className="window-title">{sanitizeTitle(title)}</span>
            <div
              className="window-controls"
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {onToggleFullscreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFullscreen();
                  }}
                  className="win-btn fullscreen-btn"
                  title={isFullscreen ? "تصغير النافذة" : "تكبير النافذة"}
                  aria-label={isFullscreen ? "تصغير النافذة" : "تكبير النافذة"}
                  style={{
                    padding: '0.3rem',
                    marginRight: '0.3rem'
                  }}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(id);
                }}
                className="win-btn close-btn"
                title="إغلاق"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="window-content">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Rnd
      className={`evidence-rnd evidence-rnd-wrapper window-type-${type || 'default'} window-appear`}
      style={{ zIndex }}
      position={effectivePosition}
      size={effectiveSize}
      enableResizing={{
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
      }}
      onDragStop={(_e, d) => {
        setPosition(clampPosition({ x: d.x, y: d.y }, size));
      }}
      onResizeStop={(_e, _dir, ref, _delta, newPosition) => {
        const nextSize = clampSize({ width: ref.style.width, height: ref.style.height });
        setSize(nextSize);
        setPosition(clampPosition(newPosition, nextSize));
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth ?? boundsWidth}
      maxHeight={maxHeight ?? boundsHeight}
      dragHandleClassName="window-header"
      cancel=".window-controls"
      onPointerDown={onFocus}
      bounds="parent"
    >
      <div className="window-inner" onPointerDownCapture={onFocus}>
        <header className="window-header">
          <span className="window-title">{sanitizeTitle(title)}</span>
          <div 
            className="window-controls"
            onPointerDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {onToggleFullscreen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFullscreen();
                }}
                className="win-btn fullscreen-btn"
                title={isFullscreen ? "تصغير النافذة" : "تكبير النافذة"}
                aria-label={isFullscreen ? "تصغير النافذة" : "تكبير النافذة"}
                style={{
                  padding: '0.3rem',
                  marginRight: '0.3rem'
                }}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose(id);
              }}
              className="win-btn close-btn" 
              title="إغلاق"
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
        </header>
        
        <div className="window-content">
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export const EvidenceWindow = React.memo(EvidenceWindowInner);
