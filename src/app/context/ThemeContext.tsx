import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type TextSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  pushEnabled: boolean;
  setPushEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('dineease-theme');
    return (saved as Theme) || 'light';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const saved = localStorage.getItem('dineease-text-size');
    return (saved as TextSize) || 'medium';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('dineease-sound');
    return saved !== 'false';
  });

  const [pushEnabled, setPushEnabled] = useState(() => {
    const saved = localStorage.getItem('dineease-push');
    return saved !== 'false';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark');

    // Apply theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('dineease-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all text size classes
    root.classList.remove('text-small', 'text-medium', 'text-large');

    // Apply text size
    root.classList.add(`text-${textSize}`);

    localStorage.setItem('dineease-text-size', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('dineease-sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('dineease-push', pushEnabled.toString());
  }, [pushEnabled]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      textSize,
      setTextSize,
      soundEnabled,
      setSoundEnabled,
      pushEnabled,
      setPushEnabled
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
