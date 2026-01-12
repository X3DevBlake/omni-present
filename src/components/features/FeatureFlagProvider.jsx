import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const FeatureFlagContext = createContext({});

export function useFeatureFlag(featureKey) {
  const context = useContext(FeatureFlagContext);
  return context[featureKey] || false;
}

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      // Get current user
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Fetch all feature flags
      const allFlags = await base44.entities.FeatureFlag.list();
      
      // Resolve each flag for this user
      const resolvedFlags = {};
      
      for (const flag of allFlags) {
        // Check if globally enabled
        if (!flag.enabled) {
          resolvedFlags[flag.feature_key] = false;
          continue;
        }

        // Check specific targeting
        if (flag.target_users?.includes(currentUser.email)) {
          resolvedFlags[flag.feature_key] = true;
          continue;
        }

        // Check role targeting
        if (flag.target_roles?.includes(currentUser.role)) {
          resolvedFlags[flag.feature_key] = true;
          continue;
        }

        // Check rollout percentage
        if (flag.rollout_percentage > 0) {
          const hash = hashString(currentUser.email);
          const userPercentile = hash % 100;
          resolvedFlags[flag.feature_key] = userPercentile < flag.rollout_percentage;
        } else {
          resolvedFlags[flag.feature_key] = false;
        }
      }

      setFlags(resolvedFlags);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  };

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}