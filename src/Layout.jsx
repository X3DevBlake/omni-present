import React from 'react';
import EnhancedMainNav from './components/navigation/EnhancedMainNav';
import OmniAssistant from './components/ai/OmniAssistant';
import { GamificationProvider } from './components/gamification/GamificationContext';

export default function Layout({ children }) {
  return (
    <GamificationProvider>
      <EnhancedMainNav />
      {children}
      <OmniAssistant />
    </GamificationProvider>
  );
}