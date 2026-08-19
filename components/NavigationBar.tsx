import React, { useState } from 'react';

interface NavigationBarProps {
  initialMode?: 'light' | 'dark';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ initialMode = 'light' }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className={`navigation-bar ${mode}`}>
      <div className="nav-content">
        <h1>My Application</h1>
        <button onClick={toggleMode}>
          Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;