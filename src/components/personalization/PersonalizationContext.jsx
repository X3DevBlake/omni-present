import React, { createContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const PersonalizationContext = createContext();

export function PersonalizationProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [behaviorData, setBehaviorData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePersonalization();
  }, []);

  const initializePersonalization = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      setUserProfile(user);
      
      // Load or initialize user preferences
      const savedPreferences = user.preferences || {
        theme: 'dark',
        notificationLevel: 'smart',
        dashboardLayout: 'default',
        hiddenFeatures: [],
        prioritizedHubs: [],
        autoRecommendations: true
      };
      setPreferences(savedPreferences);

      // Initialize behavior tracking
      const behavior = {
        visitCounts: {},
        lastVisits: {},
        clickPatterns: {},
        scrollDepth: {},
        timeSpent: {}
      };
      setBehaviorData(behavior);

      // Generate initial recommendations
      generateRecommendations(savedPreferences, behavior);
    } catch (error) {
      console.error('Error initializing personalization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackPageVisit = useCallback((pageName) => {
    setBehaviorData(prev => ({
      ...prev,
      visitCounts: {
        ...prev.visitCounts,
        [pageName]: (prev.visitCounts[pageName] || 0) + 1
      },
      lastVisits: {
        ...prev.lastVisits,
        [pageName]: new Date().toISOString()
      }
    }));
  }, []);

  const trackInteraction = useCallback((featureName, actionType) => {
    setBehaviorData(prev => ({
      ...prev,
      clickPatterns: {
        ...prev.clickPatterns,
        [featureName]: (prev.clickPatterns[featureName] || 0) + 1
      }
    }));
  }, []);

  const generateRecommendations = (prefs, behavior) => {
    const recs = [];

    // Analyze behavior to generate contextual recommendations
    const topPages = Object.entries(behavior.visitCounts || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // DeFi recommendations
    if (topPages.some(([page]) => page.includes('Omni'))) {
      recs.push({
        id: 'defi_opportunity',
        type: 'opportunity',
        hub: 'omni',
        title: 'New Liquidity Pool Available',
        description: 'High-yield OMNI/USDT pool with 12.5% APY',
        action: 'Explore',
        weight: 0.9
      });
    }

    // Simulation recommendations
    if (topPages.some(([page]) => page.includes('Simulation'))) {
      recs.push({
        id: 'simulation_insight',
        type: 'insight',
        hub: 'simulation',
        title: 'Agent Learning Plateau Detected',
        description: 'Consider increasing simulation difficulty',
        action: 'Adjust',
        weight: 0.75
      });
    }

    // Device recommendations
    if (topPages.some(([page]) => page.includes('Device'))) {
      recs.push({
        id: 'device_upgrade',
        type: 'upgrade',
        hub: 'devices',
        title: 'Recommended Hardware Upgrade',
        description: 'Your usage patterns suggest upgrading to Voyager tier',
        action: 'Review',
        weight: 0.6
      });
    }

    // Universal recommendation
    recs.push({
      id: 'cross_hub_insight',
      type: 'insight',
      hub: 'analytics',
      title: 'Portfolio Aligned with Simulation Results',
      description: 'Your DeFi portfolio matches top-performing agents',
      action: 'Learn',
      weight: 0.85
    });

    setRecommendations(recs.sort((a, b) => b.weight - a.weight));
  };

  const updatePreference = async (key, value) => {
    try {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      
      // Save to user profile
      await base44.auth.updateMe({ preferences: updated });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const toggleFeatureVisibility = useCallback((featureName, visible) => {
    updatePreference('hiddenFeatures', 
      visible 
        ? preferences.hiddenFeatures?.filter(f => f !== featureName) || []
        : [...(preferences.hiddenFeatures || []), featureName]
    );
  }, [preferences]);

  const setPrioritizedHubs = useCallback((hubs) => {
    updatePreference('prioritizedHubs', hubs);
  }, []);

  const shouldShowFeature = (featureName) => {
    return !preferences.hiddenFeatures?.includes(featureName);
  };

  const getRecommendationsForHub = (hubName) => {
    return recommendations
      .filter(r => r.hub === hubName || r.hub === 'analytics')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  };

  const value = {
    userProfile,
    preferences,
    behaviorData,
    recommendations,
    isLoading,
    trackPageVisit,
    trackInteraction,
    updatePreference,
    toggleFeatureVisibility,
    setPrioritizedHubs,
    shouldShowFeature,
    getRecommendationsForHub,
    generateRecommendations
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = React.useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
}