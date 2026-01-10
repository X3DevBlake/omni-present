import React from 'react';
import EnhancedMainNav from './components/navigation/EnhancedMainNav';
import OmniAssistant from './components/ai/OmniAssistant';
import FeedbackButton from './components/feedback/FeedbackButton';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';
import OmniPresentLogo from './components/omni/OmniPresentLogo';

export default function Layout({ children }) {
  return (
    <PersonalizationProvider>
      <GamificationProvider>
        <EnhancedMainNav />
        {children}
        <OmniAssistant />
        <FeedbackButton />
        {/* OmniPresent Logo - Available as app logo */}
        <style>{`
          .omni-logo-component {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </GamificationProvider>
    </PersonalizationProvider>
  );
}