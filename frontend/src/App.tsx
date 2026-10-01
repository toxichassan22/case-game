import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { initGameStoreListeners } from './stores/gameStore';

import { useNavigate } from 'react-router-dom';
import { useProfileStore } from './stores/profileStore';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: '#121418', color: '#ff4d4d',
          fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>حدث خطأ غير متوقع في التطبيق</h2>
          <p style={{ marginBottom: '2rem', color: '#a0aab5' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ padding: '0.75rem 1.5rem', background: '#4da3ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Website = lazy(() => import('./pages/Website').then((module) => ({ default: module.Website })));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup').then((module) => ({ default: module.ProfileSetup })));
const Lobby = lazy(() => import('./pages/Lobby').then((module) => ({ default: module.Lobby })));
const WaitingRoom = lazy(() => import('./pages/WaitingRoom').then((module) => ({ default: module.WaitingRoom })));
const GameDesktop = lazy(() => import('./pages/GameDesktop').then((module) => ({ default: module.GameDesktop })));
const Tribunal = lazy(() => import('./pages/Tribunal').then((module) => ({ default: module.Tribunal })));
const CaseResults = lazy(() => import('./pages/CaseResults').then((module) => ({ default: module.CaseResults })));

function RouteFallback() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #121418 0%, #0a0b0d 100%)',
        color: 'var(--text-primary, #f5f7fa)',
        fontFamily: 'var(--font-arabic, sans-serif)',
        letterSpacing: '0.04em',
      }}
    >
      جاري تحميل الواجهة...
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const hasProfile = useProfileStore((s) => s.hasProfile());

  // Initialize WebSocket store listeners once with cleanup
  useEffect(() => {
    const cleanup = initGameStoreListeners();
    return cleanup; // Cleanup on unmount to prevent memory leaks
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Website onEnterGame={() => navigate(hasProfile ? '/lobby' : '/profile')} />} />
          <Route path="/profile" element={<ProfileSetup />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomId" element={<WaitingRoom />} />
          <Route path="/game/:roomId" element={<GameDesktop />} />
          <Route path="/tribunal/:roomId" element={<Tribunal />} />
          <Route path="/results/:roomId" element={<CaseResults />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
