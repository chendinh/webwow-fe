import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import MainComponent from './MainComponent';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainComponent />
    </ThemeProvider>
  );
};

export default App;