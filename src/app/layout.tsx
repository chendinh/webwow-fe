"use client";

import type { Metadata } from 'next';
import './globals.css';
import { useState, useEffect } from 'react';
import { useThemeStore } from './themeStore';

export const metadata: Metadata = {
  title: 'WebWow — AI IT Team that codes for you',
  description:
    'WebWow is your autonomous AI engineering team. Describe a task, approve the plan, and watch production-ready code land in a PR automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isDarkMode, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.className = isDarkMode ? 'bg-gray-950' : 'bg-white';
  }, [isDarkMode]);

  return (
    <html lang="en">
      <body className={isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}>
        <button onClick={toggleTheme} className="p-2 m-4 border rounded">
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
        {children}
      </body>
    </html>
  );
}
