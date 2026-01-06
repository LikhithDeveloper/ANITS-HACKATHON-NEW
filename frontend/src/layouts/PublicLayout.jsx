import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';

const PublicLayout = () => {
  return (
    <ThemeProvider storageKey="theme_candidate">
      <div className="public-app">
        <main>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default PublicLayout;
