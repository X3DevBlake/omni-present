import React from 'react';
import EnhancedMainNavRevamped from './components/navigation/EnhancedMainNavRevamped';
import BackButton from './components/navigation/BackButton';
import GlobalSearch from './components/navigation/GlobalSearch';
import NotificationCenter from './components/navigation/NotificationCenter';
import OmniAssistant from './components/ai/OmniAssistant';
import FeedbackButton from './components/feedback/FeedbackButton';
import UnifiedCommandBar from './components/navigation/UnifiedCommandBar';
import ContextAwareHelpButton from './components/ui/ContextAwareHelpButton';
import GeminiAssistant from './components/ai/GeminiAssistant';
import VertexAICopilot from './components/ai/VertexAICopilot';
import RealTimeAlertSystem from './components/analytics/RealTimeAlertSystem';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';
import { AvatarProvider } from './components/avatar/AvatarContext';
import GlobalAvatarOverlay from './components/avatar/GlobalAvatarOverlay';
import AnimationController from './components/avatar/AnimationController';
import { base44 } from '@/api/base44Client';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const isDnDError = error?.message?.includes('source') || 
                       error?.message?.includes('Cannot read properties of undefined') ||
                       error?.message?.includes('reading');
    if (isDnDError) {
      console.warn('DnD error suppressed:', error.message);
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      const isDnDError = this.state.error?.message?.includes('source') || 
                         this.state.error?.message?.includes('Cannot read properties of undefined') ||
                         this.state.error?.message?.includes('reading');
      if (isDnDError) {
        return this.props.children;
      }
      return <div className="text-white p-4">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

export default function Layout({ children }) {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <ErrorBoundary>
      <PersonalizationProvider>
        <GamificationProvider>
          <AvatarProvider>
            <EnhancedMainNavRevamped />
            <BackButton />
            <GlobalSearch />
            {userEmail && <NotificationCenter userEmail={userEmail} />}
            {children}
            <GlobalAvatarOverlay />
            <AnimationController />
            <OmniAssistant />
            <FeedbackButton />
            <UnifiedCommandBar />
            <ContextAwareHelpButton />
            <GeminiAssistant />
            <VertexAICopilot />
            <RealTimeAlertSystem />
            <style>{`
            .omni-logo-component {
              display: flex;
              align-items: center;
              justify-content: center;
            }
          `}</style>
          </AvatarProvider>
        </GamificationProvider>
      </PersonalizationProvider>
    </ErrorBoundary>
  );
  }