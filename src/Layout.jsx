import React, { useState, useEffect } from 'react';
import ConsolidatedNav from './components/navigation/ConsolidatedNav';
import BackExitControls from './components/navigation/BackExitControls';
import GamificationOverlay from './components/gamification/GamificationOverlay';
import Sidebar from './components/navigation/Sidebar';
import { GamificationProvider } from './components/gamification/GamificationContext';
import { PersonalizationProvider } from './components/personalization/PersonalizationContext';
import { AnimationProvider } from './components/animations/AnimationContext';
import { HolographicProvider } from './components/holographic/GlobalHolographicController';
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
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#09090f]">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text-omni mb-2">System Error</div>
            <p className="text-white/40 text-sm">Something went wrong. Please refresh.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LayoutContent({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [isLoadingHubs, setIsLoadingHubs] = useState(true);

  useEffect(() => {
    const handleGlobalError = (event) => {
      const msg = event.message || event.reason?.message || '';
      if (
        msg.includes('source') ||
        msg.includes('reading') ||
        msg.includes('undefined') ||
        msg.includes('ResizeObserver') ||
        (msg.includes('Cannot read properties of undefined') && msg.includes('source'))
      ) {
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        return true;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    const fetchHubs = async () => {
      try {
        const data = await base44.entities.Hub.list({ limit: 2000, sort: { name: 1 } });
        const unique = Array.from(new Map(data.map(item => [item.name, item])).values());
        setHubs(unique);
      } catch (error) {
        console.error("Failed to fetch hubs for sidebar", error);
      } finally {
        setIsLoadingHubs(false);
      }
    };
    fetchHubs();

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  return (
    <>
      <ConsolidatedNav
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} hubs={hubs} isLoading={isLoadingHubs} />
      <BackExitControls placement="top-right" />
      <GamificationOverlay />
      <div
        className="pt-[52px] transition-all duration-300 ease-in-out min-h-screen"
        style={{ paddingLeft: isSidebarOpen ? '260px' : '0' }}
      >
        {children}
      </div>
    </>
  );
}

import ContextualAssistantOverlay from './components/assistant/ContextualAssistantOverlay';
import OmniGenesisOnboarding from './components/onboarding/OmniGenesisOnboarding';
import GenesisCopilot from './components/assistant/GenesisCopilot';

export default function Layout({ children, currentPageName }) {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('omni_onboarding_complete');
    } catch {
      return true;
    }
  });

  return (
    <ErrorBoundary>
      <HolographicProvider>
        <AnimationProvider>
          <PersonalizationProvider>
            <GamificationProvider>
              <LayoutContent currentPageName={currentPageName}>
                {children}
                <ContextualAssistantOverlay />
                <GenesisCopilot />
                {showOnboarding && (
                  <OmniGenesisOnboarding onComplete={() => setShowOnboarding(false)} />
                )}
              </LayoutContent>
            </GamificationProvider>
          </PersonalizationProvider>
        </AnimationProvider>
      </HolographicProvider>
    </ErrorBoundary>
  );
}
