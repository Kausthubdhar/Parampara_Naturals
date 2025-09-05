import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 rounded-xl bg-gradient-to-r from-secondary/50 to-secondary/30 dark:from-secondary-dark/50 dark:to-secondary-dark/30 hover:from-secondary/70 dark:hover:from-secondary-dark/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-text dark:text-text-dark group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sun className="w-5 h-5 text-text dark:text-text-dark group-hover:rotate-12 transition-transform duration-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;
