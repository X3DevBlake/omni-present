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
      return <div className="text-white p-4">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

function LayoutContent({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [isLoadingHubs, setIsLoadingHubs] = useState(true);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        // Optimizing fetch: Get ID, name, category, icon only if possible to reduce payload
        // Assuming standard list returns full objects, but we'll handle the large list carefully
        const data = await base44.entities.Hub.list({ limit: 2000, sort: { name: 1 } });
        // Deduplicate
        const unique = Array.from(new Map(data.map(item => [item.name, item])).values());
        setHubs(unique);
      } catch (error) {
        console.error("Failed to fetch hubs for sidebar", error);
      } finally {
        setIsLoadingHubs(false);
      }
    };
    fetchHubs();
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
        className="pt-20 transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isSidebarOpen ? '280px' : '0' }}
      >
        {children}
      </div>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ErrorBoundary>
      <HolographicProvider>
        <AnimationProvider>
          <PersonalizationProvider>
            <GamificationProvider>
              <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
            </GamificationProvider>
          </PersonalizationProvider>
        </AnimationProvider>
      </HolographicProvider>
    </ErrorBoundary>
  );
}