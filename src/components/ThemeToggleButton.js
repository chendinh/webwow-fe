import React, { useState } from 'react';

interface ThemeToggleButtonProps {
  onToggle: (isDarkMode: boolean) => void;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ onToggle }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    onToggle(newMode);
  };

  return (
    <button onClick={handleToggle}>
      {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </button>
  );
};

export default ThemeToggleButton;