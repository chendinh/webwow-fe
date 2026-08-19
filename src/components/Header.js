import React from 'react';
import ThemeToggleButton from './ThemeToggleButton';

const Header: React.FC = () => {
  return (
    <header>
      <h1>My Application</h1>
      <ThemeToggleButton />
    </header>
  );
};

export default Header;