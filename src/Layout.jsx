import React from 'react';
import FloatingNav from './components/omni/FloatingNav';
import AIChatbot from './components/ai/AIChatbot';
import { GamificationProvider } from './components/gamification/GamificationContext';

export default function Layout({ children }) {
  return (
    <GamificationProvider>
      <FloatingNav />
      {children}
      <AIChatbot />
    </GamificationProvider>
  );
}