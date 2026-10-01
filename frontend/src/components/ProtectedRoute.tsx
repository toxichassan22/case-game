import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import LoginPage from '../pages/LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, verifyToken, isLoading } = useAuthStore();

  useEffect(() => {
    // Verify token on mount
    if (!isAuthenticated) {
      verifyToken();
    }
  }, [isAuthenticated, verifyToken]);

  // Show loading state while verifying
  if (isLoading) {
    return (
      <div className="loading-container" role="status" aria-label="Loading">
        <div className="loading-spinner-large"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show protected content
  return <>{children}</>;
};

export default ProtectedRoute;
