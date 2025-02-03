import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ThemeWrapper({ children }) {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className="App" data-theme={isDarkMode ? 'dark' : 'light'}>
      {children}
    </div>
  );
}

export default ThemeWrapper;
