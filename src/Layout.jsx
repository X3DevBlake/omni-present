import React from 'react';
import EnhancedMainNavRevamped from './components/navigation/EnhancedMainNavRevamped';
import BackButton from './components/navigation/BackButton';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';
import PageTransitionLoader from './components/ui/PageTransitionLoader';
import { usePageTransition } from './components/hooks/usePageTransition';
import ImmersivePageTransition from './components/navigation/ImmersivePageTransition';
import PerformanceMonitor from './components/performance/PerformanceMonitor';
import ImmersiveNavToggle from './components/navigation/ImmersiveNavToggle';

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

function LayoutContent({ children }) {
  usePageTransition();
  return (
    <>
      <PageTransitionLoader />
      <ImmersiveNavToggle />
      <ImmersivePageTransition>
        <EnhancedMainNavRevamped />
        <BackButton />
        {children}
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

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      <PersonalizationProvider>
        <GamificationProvider>
          <PerformanceMonitor />
          <LayoutContent>{children}</LayoutContent>
        </GamificationProvider>
      </PersonalizationProvider>
    </ErrorBoundary>
  );
}