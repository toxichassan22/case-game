import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isLogin) {
        await login(playerName, password);
      } else {
        await register(playerName, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="login-container" role="main" aria-label="Authentication page">
      <div className="login-card">
        <h1 className="login-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        
        <p className="login-subtitle">
          نظام التحقيق الموحد
        </p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="playerName" className="form-label">
              Player Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="form-input"
              placeholder="Enter your name"
              autoComplete="username"
              aria-required="true"
              disabled={isLoading}
              minLength={3}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              aria-required="true"
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !playerName.trim() || !password.trim()}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner" aria-hidden="true"></span>
            ) : (
              <>{isLogin ? 'Login' : 'Register'}</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <button
            className="toggle-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={isLoading}
            aria-label={isLogin ? 'Switch to registration' : 'Switch to login'}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>

        <div className="login-guest">
          <p>Or</p>
          <button
            className="guest-button"
            onClick={() => {
              // Continue as guest - set minimal auth
              useAuthStore.setState({
                user: {
                  playerId: `guest_${Date.now()}`,
                  playerName: 'Guest',
                  role: 'player'
                },
                token: null,
                isAuthenticated: true
              });
            }}
            disabled={isLoading}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
