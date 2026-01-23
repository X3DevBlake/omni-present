import React from 'react';
import EnhancedMainNavRevamped from './components/navigation/EnhancedMainNavRevamped';
import BackButton from './components/navigation/BackButton';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';
import { AnimationProvider } from './components/animations/AnimationContext';
import GlobalAnimationPlayer from './components/animations/GlobalAnimationPlayer';
import PageTransitionLoader from './components/ui/PageTransitionLoader';
import { usePageTransition } from './components/hooks/usePageTransition';
import ImmersivePageTransition from './components/navigation/ImmersivePageTransition';
import PerformanceMonitor from './components/performance/PerformanceMonitor';
import ImmersiveNavToggle from './components/navigation/ImmersiveNavToggle';
import VoiceNavigationAssistant from './components/navigation/VoiceNavigationAssistant';
import GestureNavigationController from './components/navigation/GestureNavigationController';
import ContextualNavSuggestions from './components/navigation/ContextualNavSuggestions';
import IntelligentNavBar from './components/navigation/IntelligentNavBar';
import GestureControlOverlay from './components/navigation/GestureControlOverlay';
import SmartBreadcrumbs from './components/navigation/SmartBreadcrumbs';
import FloatingMiniMap from './components/navigation/FloatingMiniMap';
import AdaptiveNavigationAI from './components/navigation/AdaptiveNavigationAI';
import QuickAccessShortcuts from './components/navigation/QuickAccessShortcuts';
import PredictiveNavigationSuggestions from './components/navigation/PredictiveNavigationSuggestions';
import AIContextualNavAssistant from './components/navigation/AIContextualNavAssistant';

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

function LayoutContent({ children, currentPageName }) {
  usePageTransition();
  const [navigationHistory, setNavigationHistory] = React.useState([]);

  return (
    <>
      <PageTransitionLoader />
      <IntelligentNavBar />
      <ImmersiveNavToggle />
      <VoiceNavigationAssistant />
      <GestureNavigationController />
      <GestureControlOverlay onGesture={(g) => console.log('Gesture:', g)} />
      <ContextualNavSuggestions />
      <FloatingMiniMap currentPage={currentPageName} hubs={[]} />
      <AdaptiveNavigationAI />
      <QuickAccessShortcuts />
      <PredictiveNavigationSuggestions />
      <AIContextualNavAssistant />
      <ImmersivePageTransition>
        <EnhancedMainNavRevamped />
        <BackButton />
        <div className="pt-20">
          <SmartBreadcrumbs currentPage={currentPageName} navigationHistory={navigationHistory} />
          {children}
        </div>
      </ImmersivePageTransition>
      <style>{`
        .omni-logo-component {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <PersonalizationProvider>
          <GamificationProvider>
            <PerformanceMonitor />
            <GlobalAnimationPlayer />
            <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
          </GamificationProvider>
        </PersonalizationProvider>
      </AnimationProvider>
    </ErrorBoundary>
  );
}