import React from 'react';
import EnhancedMainNav from './components/navigation/EnhancedMainNav';
import BackButton from './components/navigation/BackButton';
import GlobalSearch from './components/navigation/GlobalSearch';
import NotificationCenter from './components/navigation/NotificationCenter';
import OmniAssistant from './components/ai/OmniAssistant';
import FeedbackButton from './components/feedback/FeedbackButton';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';
import { base44 } from '@/api/base44Client';

export default function Layout({ children }) {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <PersonalizationProvider>
      <GamificationProvider>
        <EnhancedMainNav />
        <BackButton />
        <GlobalSearch />
        {userEmail && <NotificationCenter userEmail={userEmail} />}
        {children}
        <OmniAssistant />
        <FeedbackButton />
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