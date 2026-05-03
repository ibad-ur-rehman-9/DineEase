import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Fingerprint, Delete, Clock } from 'lucide-react';

export default function Login() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pin.length === 4 && !isLoading) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    const success = await login(pin);

    if (success) {
      navigate('/role-select');
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= 5) {
        setError('Account locked. Contact manager.');
      } else {
        setError(`Incorrect PIN. ${5 - newAttemptCount} attempts remaining.`);
      }
      setPin('');

      const pinInput = document.querySelector('.pin-input');
      pinInput?.classList.add('animate-shake');
      setTimeout(() => pinInput?.classList.remove('animate-shake'), 500);
    }

    setIsLoading(false);
  };

  const handleNumberClick = (num: number) => {
    if (pin.length < 4 && attemptCount < 5) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isLocked = attemptCount >= 5;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Logo and Content */}
      <div className="w-full max-w-md flex flex-col items-center space-y-6 sm:space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16">
              <path
                d="M30 25 L50 15 L70 25 L70 45 L50 55 L30 45 Z"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="35" r="8" fill="white" />
              <path
                d="M35 60 Q35 50 50 50 Q65 50 65 60 L65 75 Q65 80 50 80 Q35 80 35 75 Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
              DineEase
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Karachi – Clifton Branch</p>
          </div>
        </div>

        {/* PIN Input Section */}
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Enter your 4-digit PIN to continue</p>
          </div>

          {/* PIN Dots */}
          <div className="pin-input flex justify-center gap-3 sm:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all
                  ${pin.length > i
                    ? 'border-primary bg-primary'
                    : 'border-border bg-card'
                  }
                  ${error ? 'border-destructive' : ''}
                `}
                aria-hidden="true"
              >
                {pin.length > i && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center text-destructive text-sm font-medium" role="alert">
              {error}
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isLoading || isLocked}
                className="h-14 sm:h-16 rounded-xl bg-card border-2 border-border hover:bg-muted hover:border-primary active:scale-95
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl sm:text-2xl font-semibold
                  text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                aria-label={`Number ${num}`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={handleClear}
              disabled={isLoading || isLocked}
              className="h-14 sm:h-16 rounded-xl bg-card border-2 border-border hover:bg-muted hover:border-primary active:scale-95
                transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                justify-center focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Clear PIN"
            >
              <span className="text-xs sm:text-sm font-semibold text-foreground">CLR</span>
            </button>

            <button
              onClick={() => handleNumberClick(0)}
              disabled={isLoading || isLocked}
              className="h-14 sm:h-16 rounded-xl bg-card border-2 border-border hover:bg-muted hover:border-primary active:scale-95
                transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl sm:text-2xl font-semibold
                text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
              aria-label="Number 0"
            >
              0
            </button>

            <button
              onClick={handleBackspace}
              disabled={isLoading || isLocked}
              className="h-14 sm:h-16 rounded-xl bg-card border-2 border-border hover:bg-muted hover:border-primary active:scale-95
                transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                justify-center focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Backspace"
            >
              <Delete className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
          </div>

          {/* Biometric Button */}
          <Button
            variant="outline"
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 h-11 sm:h-12 text-sm sm:text-base"
            disabled={isLoading || isLocked}
            onClick={() => {
              // Mock biometric - auto-login with PIN 1111
              login('1111').then(() => navigate('/role-select'));
            }}
          >
            <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
            Use Fingerprint
          </Button>

          {/* Forgot PIN */}
          <div className="text-center pt-2">
            <button
              className="text-xs sm:text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              onClick={() => alert('Please contact your manager for PIN reset')}
            >
              Forgot PIN?
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 w-full text-center space-y-1 sm:space-y-2 px-4 lg:absolute lg:bottom-6 lg:left-0 lg:right-0">
        <div className="flex items-center justify-center gap-2 text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {formatTime(currentTime)}
            </span>
          </div>
          <span className="text-xs sm:text-sm">• Evening Shift</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(currentTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          DineEase v1.0.0 • © 2026
        </p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
