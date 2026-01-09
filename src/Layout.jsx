import React from 'react';
import EnhancedMainNav from './components/navigation/EnhancedMainNav';
import OmniAssistant from './components/ai/OmniAssistant';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';

export default function Layout({ children }) {
  return (
    <PersonalizationProvider>
      <GamificationProvider>
        <EnhancedMainNav />
        {children}
        <OmniAssistant />
      </GamificationProvider>
    </PersonalizationProvider>
  );
}